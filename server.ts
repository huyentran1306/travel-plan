import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import Database from "better-sqlite3";
import { ITINERARY as INITIAL_ITINERARY } from "./src/constants";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // Database setup
  const db = new Database("itinerary.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
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
    CREATE TABLE IF NOT EXISTS days (
      day INTEGER PRIMARY KEY,
      date TEXT,
      title TEXT
    );
  `);

  // Seed initial data if empty
  const count = db.prepare("SELECT COUNT(*) as count FROM locations").get() as { count: number };
  if (count.count === 0) {
    const insertLoc = db.prepare(`
      INSERT INTO locations (id, day, name, time, description, lat, lng, type, address, suggestions, order_index, guide)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertDay = db.prepare(`
      INSERT INTO days (day, date, title)
      VALUES (?, ?, ?)
    `);

    INITIAL_ITINERARY.forEach(dayPlan => {
      insertDay.run(dayPlan.day, dayPlan.date, dayPlan.title);
      dayPlan.locations.forEach((loc, idx) => {
        insertLoc.run(
          loc.id,
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
  }

  // Multi-user state for checklist
  let checkedItems: number[] = [];

  // API routes
  app.get("/api/itinerary", (req, res) => {
    const days = db.prepare("SELECT * FROM days ORDER BY day").all() as any[];
    const locations = db.prepare("SELECT * FROM locations ORDER BY day, order_index, time").all() as any[];
    
    const itinerary = days.map(day => ({
      ...day,
      locations: locations
        .filter(loc => loc.day === day.day)
        .map(loc => ({
          ...loc,
          suggestions: loc.suggestions ? JSON.parse(loc.suggestions) : undefined
        }))
    }));
    res.json(itinerary);
  });

  app.post("/api/locations", (req, res) => {
    const { id, day, name, time, description, lat, lng, type, address, suggestions, order_index, guide } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO locations (id, day, name, time, description, lat, lng, type, address, suggestions, order_index, guide)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, 
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
    
    broadcast({ type: "SYNC_ITINERARY" });
    res.json({ status: "ok" });
  });

  app.post("/api/locations/reorder", (req, res) => {
    const { locations } = req.body; // Array of {id, order_index}
    const update = db.prepare("UPDATE locations SET order_index = ? WHERE id = ?");
    const transaction = db.transaction((items) => {
      for (const item of items) {
        update.run(item.order_index, item.id);
      }
    });
    transaction(locations);
    broadcast({ type: "SYNC_ITINERARY" });
    res.json({ status: "ok" });
  });

  app.delete("/api/locations/:id", (req, res) => {
    db.prepare("DELETE FROM locations WHERE id = ?").run(req.params.id);
    broadcast({ type: "SYNC_ITINERARY" });
    res.json({ status: "ok" });
  });

  app.put("/api/days/:day", (req, res) => {
    const { date, title } = req.body;
    db.prepare("UPDATE days SET date = ?, title = ? WHERE day = ?").run(date, title, req.params.day);
    broadcast({ type: "SYNC_ITINERARY" });
    res.json({ status: "ok" });
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
    app.use(express.static("dist"));
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
