import { DayPlan, Location, ITINERARY as INITIAL_ITINERARY } from './constants';

export const IS_STATIC = 
  window.location.hostname.endsWith('github.io') || 
  window.location.hostname.endsWith('github.preview') ||
  (!window.location.port && !window.location.hostname.includes('run.app'));

function getLocalItinerary(): DayPlan[] {
  const stored = localStorage.getItem('travel-plan-itinerary');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  // Initialize with static default
  localStorage.setItem('travel-plan-itinerary', JSON.stringify(INITIAL_ITINERARY));
  return INITIAL_ITINERARY;
}

function saveLocalItinerary(itinerary: DayPlan[]) {
  localStorage.setItem('travel-plan-itinerary', JSON.stringify(itinerary));
}

export async function getItinerary(): Promise<DayPlan[]> {
  if (IS_STATIC) {
    return getLocalItinerary();
  }
  try {
    const res = await fetch('/api/itinerary');
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Fallback to local storage due to API error:', err);
    return getLocalItinerary();
  }
}

export async function saveLocation(loc: any): Promise<void> {
  if (IS_STATIC) {
    const itinerary = getLocalItinerary();
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
    saveLocalItinerary(newItinerary);
    return;
  }

  const res = await fetch('/api/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loc),
  });
  if (!res.ok) throw new Error('API failed');
}

export async function deleteLocation(id: string): Promise<void> {
  if (IS_STATIC) {
    const itinerary = getLocalItinerary();
    const newItinerary = itinerary.map(dayPlan => ({
      ...dayPlan,
      locations: dayPlan.locations.filter(l => l.id !== id)
    }));
    saveLocalItinerary(newItinerary);
    return;
  }

  const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('API failed');
}

export async function reorderLocations(locations: { id: string, order_index: number }[]): Promise<void> {
  if (IS_STATIC) {
    const itinerary = getLocalItinerary();
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

    saveLocalItinerary(newItinerary);
    return;
  }

  const res = await fetch('/api/locations/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locations }),
  });
  if (!res.ok) throw new Error('API failed');
}

export async function updateDay(day: number, date: string, title: string): Promise<void> {
  if (IS_STATIC) {
    const itinerary = getLocalItinerary();
    const newItinerary = itinerary.map(dayPlan => {
      if (dayPlan.day === day) {
        return { ...dayPlan, date, title };
      }
      return dayPlan;
    });
    saveLocalItinerary(newItinerary);
    return;
  }

  const res = await fetch(`/api/days/${day}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, title }),
  });
  if (!res.ok) throw new Error('API failed');
}
