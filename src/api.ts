import { DayPlan, Location, Trip, DEFAULT_TRIPS, TRIP_ITINERARIES, ITINERARY as INITIAL_ITINERARY } from './constants';

export const IS_STATIC = 
  window.location.hostname.endsWith('github.io') || 
  window.location.hostname.endsWith('github.preview') ||
  (!window.location.port && !window.location.hostname.includes('run.app'));

// Helper inside Static Mode to fetch and initialize trips
function getLocalTrips(): Trip[] {
  const stored = localStorage.getItem('travel-plan-trips');
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Trip[];
      if (parsed.length > 0) return parsed;
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem('travel-plan-trips', JSON.stringify(DEFAULT_TRIPS));
  return DEFAULT_TRIPS;
}

function saveLocalTrips(trips: Trip[]) {
  localStorage.setItem('travel-plan-trips', JSON.stringify(trips));
}

function getLocalItinerary(tripId: string): DayPlan[] {
  const key = `travel-plan-itinerary-${tripId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  // Initialize with mapped or fallback defaults
  const defaults = TRIP_ITINERARIES[tripId] && TRIP_ITINERARIES[tripId].length > 0 
    ? TRIP_ITINERARIES[tripId] 
    : INITIAL_ITINERARY;

  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
}

function saveLocalItinerary(tripId: string, itinerary: DayPlan[]) {
  localStorage.setItem(`travel-plan-itinerary-${tripId}`, JSON.stringify(itinerary));
}

export async function getTrips(): Promise<Trip[]> {
  if (IS_STATIC) {
    const list = getLocalTrips();
    const now = Date.now();
    // Sort closest to today
    return [...list].sort((a, b) => {
      const dA = Math.abs(new Date(a.startDate).getTime() - now);
      const dB = Math.abs(new Date(b.startDate).getTime() - now);
      return dA - dB;
    });
  }
  try {
    const res = await fetch('/api/trips');
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch (err) {
    console.warn('Fallback to local storage list due to API error:', err);
    return getLocalTrips();
  }
}

export async function saveTrip(trip: Trip): Promise<void> {
  if (IS_STATIC) {
    const trips = getLocalTrips();
    const exists = trips.some(t => t.id === trip.id);
    const updated = exists 
      ? trips.map(t => t.id === trip.id ? trip : t)
      : [...trips, trip];
    saveLocalTrips(updated);
    
    // Auto initiate local empty day 1 if not exists
    const key = `travel-plan-itinerary-${trip.id}`;
    if (!localStorage.getItem(key)) {
      saveLocalItinerary(trip.id, [
        {
          day: 1,
          date: trip.startDate,
          title: 'Ngày 1',
          locations: []
        }
      ]);
    }
    return;
  }
  const res = await fetch('/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trip),
  });
  if (!res.ok) throw new Error('API failed');
}

export async function getItinerary(tripId: string): Promise<DayPlan[]> {
  if (IS_STATIC) {
    return getLocalItinerary(tripId);
  }
  try {
    const res = await fetch(`/api/itinerary?tripId=${tripId}`);
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Fallback to local storage due to API error:', err);
    return getLocalItinerary(tripId);
  }
}

export async function saveLocation(loc: any): Promise<void> {
  const tripId = loc.trip_id || loc.tripId;
  if (!tripId) {
    throw new Error('tripId is required to save a location');
  }

  if (IS_STATIC) {
    const itinerary = getLocalItinerary(tripId);
    let updated = false;
    let newItinerary = itinerary.map(dayPlan => {
      if (dayPlan.day === loc.day) {
        const isExisting = dayPlan.locations.some(l => l.id === loc.id);
        const newLocations = isExisting
          ? dayPlan.locations.map(l => l.id === loc.id ? { ...l, ...loc } : l)
          : [...dayPlan.locations, { ...loc }];
        updated = true;
        return { ...dayPlan, locations: newLocations };
      }
      return dayPlan;
    });
    
    if (!updated && loc.day) {
      newItinerary.push({
        day: loc.day,
        date: `Day ${loc.day}`,
        title: `Day Plan ${loc.day}`,
        locations: [loc]
      });
      newItinerary.sort((a, b) => a.day - b.day);
    }
    saveLocalItinerary(tripId, newItinerary);
    return;
  }

  const res = await fetch('/api/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...loc, trip_id: tripId }),
  });
  if (!res.ok) throw new Error('API failed');
}

export async function deleteLocation(id: string, tripId: string): Promise<void> {
  if (IS_STATIC) {
    const itinerary = getLocalItinerary(tripId);
    const newItinerary = itinerary.map(dayPlan => ({
      ...dayPlan,
      locations: dayPlan.locations.filter(l => l.id !== id)
    }));
    saveLocalItinerary(tripId, newItinerary);
    return;
  }

  const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('API failed');
}

export async function reorderLocations(locations: { id: string, order_index: number }[], tripId: string): Promise<void> {
  if (IS_STATIC) {
    const itinerary = getLocalItinerary(tripId);
    const orderMap = new Map(locations.map(item => [item.id, item.order_index]));
    
    const newItinerary = itinerary.map(dayPlan => {
      const hasUpdates = dayPlan.locations.some(l => orderMap.has(l.id));
      if (!hasUpdates) return dayPlan;

      const updatedLocs = [...dayPlan.locations].map(l => {
        if (orderMap.has(l.id)) {
          return { ...l, order_index: orderMap.get(l.id)! };
        }
        return l;
      });

      updatedLocs.sort((a, b) => {
        const orderA = a.order_index ?? 0;
        const orderB = b.order_index ?? 0;
        if (orderA !== orderB) return orderA - orderB;
        return a.time.localeCompare(b.time);
      });

      return { ...dayPlan, locations: updatedLocs };
    });

    saveLocalItinerary(tripId, newItinerary);
    return;
  }

  const res = await fetch('/api/locations/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locations, tripId }),
  });
  if (!res.ok) throw new Error('API failed');
}

export async function updateDay(day: number, date: string, title: string, tripId: string): Promise<void> {
  if (IS_STATIC) {
    const itinerary = getLocalItinerary(tripId);
    const newItinerary = itinerary.map(dayPlan => {
      if (dayPlan.day === day) {
        return { ...dayPlan, date, title };
      }
      return dayPlan;
    });
    saveLocalItinerary(tripId, newItinerary);
    return;
  }

  const res = await fetch(`/api/days/${day}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, title, tripId }),
  });
  if (!res.ok) throw new Error('API failed');
}

export async function deleteTrip(tripId: string): Promise<void> {
  if (IS_STATIC) {
    const trips = getLocalTrips();
    const updated = trips.filter(t => t.id !== tripId);
    saveLocalTrips(updated);
    localStorage.removeItem(`travel-plan-itinerary-${tripId}`);
    return;
  }
  const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('API failed');
}


