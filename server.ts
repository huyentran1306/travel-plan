import express from "express";
import path from "path";
import os from "os";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import Database from "better-sqlite3";
import { DEFAULT_TRIPS, TRIP_ITINERARIES, ITINERARY as INITIAL_ITINERARY } from "./src/constants";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // Database setup
  const dbPath = path.join(os.tmpdir(), "itinerary.db");
  const db = new Database(dbPath);

  // Check if we need to recreate old single-trip schema.
  let needsRecreation = false;
  try {
    const tableInfo = db.prepare("PRAGMA table_info(locations)").all() as any[];
    if (tableInfo.length > 0 && !tableInfo.some(col => col.name === "trip_id")) {
      needsRecreation = true;
    }
  } catch (e) {
    needsRecreation = true;
  }

  if (needsRecreation) {
    console.log("Upgrading database schema for multi-trip support...");
    db.exec(`
      DROP TABLE IF EXISTS locations;
      DROP TABLE IF EXISTS days;
      DROP TABLE IF EXISTS trips;
    `);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS days (
      trip_id TEXT,
      day INTEGER,
      date TEXT,
      title TEXT,
      PRIMARY KEY (trip_id, day)
    );
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      trip_id TEXT,
      day INTEGER,
      name TEXT,
      time TEXT,
      description TEXT,
      lat REAL,
      lng REAL,
      type TEXT,
      address TEXT,
      suggestions TEXT,
      order_index INTEGER DEFAULT 0,
      guide TEXT
    );
  `);

  // Seed and update default trips data
  console.log("Synchronizing default trips...");
  const deleteTripDays = db.prepare("DELETE FROM days WHERE trip_id = ?");
  const deleteTripLocs = db.prepare("DELETE FROM locations WHERE trip_id = ?");
  const deleteTripRow = db.prepare("DELETE FROM trips WHERE id = ?");

  DEFAULT_TRIPS.forEach(trip => {
    deleteTripDays.run(trip.id);
    deleteTripLocs.run(trip.id);
    deleteTripRow.run(trip.id);
  });

  const insertTrip = db.prepare(`
    INSERT INTO trips (id, name, description, start_date, end_date, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertDay = db.prepare(`
    INSERT INTO days (trip_id, day, date, title)
    VALUES (?, ?, ?, ?)
  `);
  const insertLoc = db.prepare(`
    INSERT INTO locations (id, trip_id, day, name, time, description, lat, lng, type, address, suggestions, order_index, guide)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  DEFAULT_TRIPS.forEach(trip => {
    insertTrip.run(trip.id, trip.name, trip.description, trip.startDate, trip.endDate, trip.imageUrl || null);
    
    const dayPlans = TRIP_ITINERARIES[trip.id] || [];

    dayPlans.forEach(dayPlan => {
      insertDay.run(trip.id, dayPlan.day, dayPlan.date, dayPlan.title);
      dayPlan.locations.forEach((loc, idx) => {
        insertLoc.run(
          loc.id,
          trip.id,
          dayPlan.day,
          loc.name,
          loc.time,
          loc.description,
          loc.lat,
          loc.lng,
          loc.type,
          loc.address || null,
          loc.suggestions ? JSON.stringify(loc.suggestions) : null,
          idx,
          loc.guide || null
        );
      });
    });
  });

  // Multi-user state for checklist
  let checkedItems: number[] = [];

  // API routes
  app.get("/api/trips", (req, res) => {
    try {
      const trips = db.prepare("SELECT * FROM trips").all() as any[];
      const now = Date.now();
      
      // Map to camelCase
      const mappedTrips = trips.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        startDate: t.start_date,
        endDate: t.end_date,
        imageUrl: t.image_url
      }));

      // Sort: Closest start date from "now" goes first
      mappedTrips.sort((a, b) => {
        const dA = Math.abs(new Date(a.startDate).getTime() - now);
        const dB = Math.abs(new Date(b.startDate).getTime() - now);
        return dA - dB;
      });

      res.json(mappedTrips);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/trips", (req, res) => {
    try {
      const { id, name, description, startDate, endDate, imageUrl } = req.body;
      db.prepare(`
        INSERT OR REPLACE INTO trips (id, name, description, start_date, end_date, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, name, description, startDate, endDate, imageUrl || null);

      // Create a default Day 1 if no days exist
      const dayCount = db.prepare("SELECT COUNT(*) as count FROM days WHERE trip_id = ?").get(id) as { count: number };
      if (dayCount.count === 0) {
        db.prepare(`
          INSERT INTO days (trip_id, day, date, title)
          VALUES (?, 1, ?, 'Ngày 1')
        `).run(id, startDate || "Chưa thiết lập");
      }

      broadcast({ type: "SYNC_TRIPS" });
      res.json({ status: "ok" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/trips/:id", (req, res) => {
    try {
      const tripId = req.params.id;
      db.prepare("DELETE FROM locations WHERE trip_id = ?").run(tripId);
      db.prepare("DELETE FROM days WHERE trip_id = ?").run(tripId);
      db.prepare("DELETE FROM trips WHERE id = ?").run(tripId);
      broadcast({ type: "SYNC_TRIPS" });
      res.json({ status: "ok" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/itinerary", (req, res) => {
    try {
      const tripId = req.query.tripId as string;
      if (!tripId) {
        return res.status(400).json({ error: "tripId parameter is required" });
      }
      
      const days = db.prepare("SELECT * FROM days WHERE trip_id = ? ORDER BY day").all(tripId) as any[];
      const locations = db.prepare("SELECT * FROM locations WHERE trip_id = ? ORDER BY day, order_index, time").all(tripId) as any[];
      
      const itinerary = days.map(day => ({
        day: day.day,
        date: day.date,
        title: day.title,
        locations: locations
          .filter(loc => loc.day === day.day)
          .map(loc => ({
            ...loc,
            suggestions: loc.suggestions ? JSON.parse(loc.suggestions) : undefined
          }))
      }));
      res.json(itinerary);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/locations", (req, res) => {
    try {
      const { id, trip_id, day, name, time, description, lat, lng, type, address, suggestions, order_index, guide } = req.body;
      db.prepare(`
        INSERT OR REPLACE INTO locations (id, trip_id, day, name, time, description, lat, lng, type, address, suggestions, order_index, guide)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, 
        trip_id,
        day, 
        name, 
        time, 
        description, 
        lat, 
        lng, 
        type, 
        address, 
        suggestions ? JSON.stringify(suggestions) : null,
        order_index || 0,
        guide || null
      );
      
      broadcast({ type: "SYNC_ITINERARY", tripId: trip_id });
      res.json({ status: "ok" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/locations/reorder", (req, res) => {
    try {
      const { locations, tripId } = req.body; // Array of {id, order_index}
      const update = db.prepare("UPDATE locations SET order_index = ? WHERE id = ?");
      const transaction = db.transaction((items) => {
        for (const item of items) {
          update.run(item.order_index, item.id);
        }
      });
      transaction(locations);
      broadcast({ type: "SYNC_ITINERARY", tripId });
      res.json({ status: "ok" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/locations/:id", (req, res) => {
    try {
      const loc = db.prepare("SELECT trip_id FROM locations WHERE id = ?").get(req.params.id) as { trip_id: string } | undefined;
      db.prepare("DELETE FROM locations WHERE id = ?").run(req.params.id);
      broadcast({ type: "SYNC_ITINERARY", tripId: loc?.trip_id });
      res.json({ status: "ok" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/days/:day", (req, res) => {
    try {
      const { date, title, tripId } = req.body;
      if (!tripId) {
        return res.status(400).json({ error: "tripId is required" });
      }
      db.prepare("UPDATE days SET date = ?, title = ? WHERE day = ? AND trip_id = ?").run(date, title, req.params.day, tripId);
      broadcast({ type: "SYNC_ITINERARY", tripId });
      res.json({ status: "ok" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/checklist", (req, res) => {
    res.json(checkedItems);
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        } else if (filePath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css; charset=utf-8");
        } else if (filePath.endsWith(".json")) {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
        } else if (filePath.endsWith(".svg")) {
          res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
        } else if (filePath.endsWith(".png")) {
          res.setHeader("Content-Type", "image/png");
        } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
          res.setHeader("Content-Type", "image/jpeg");
        } else if (filePath.endsWith(".webp")) {
          res.setHeader("Content-Type", "image/webp");
        }
      }
    }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // WebSocket for real-time sync
  const wss = new WebSocketServer({ server });

  const broadcast = (data: any) => {
    const stringified = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(stringified);
      }
    });
  };

  wss.on("connection", (ws) => {
    // Send initial state
    ws.send(JSON.stringify({ type: "SYNC_CHECKLIST", payload: checkedItems }));
    broadcast({ type: "UPDATE_USER_COUNT", payload: wss.clients.size });

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "TOGGLE_ITEM") {
          const id = message.payload;
          if (checkedItems.includes(id)) {
            checkedItems = checkedItems.filter((i) => i !== id);
          } else {
            checkedItems.push(id);
          }
          broadcast({ type: "SYNC_CHECKLIST", payload: checkedItems });
        }
      } catch (e) {
        console.error("WS Error:", e);
      }
    });

    ws.on("close", () => {
      broadcast({ type: "UPDATE_USER_COUNT", payload: wss.clients.size });
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
