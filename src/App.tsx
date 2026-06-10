import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Clock, 
  Coffee, 
  Utensils, 
  Bed, 
  Car, 
  Camera,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Music,
  ExternalLink,
  Info,
  Sparkles,
  Map as MapIcon,
  Route,
  Bath,
  CheckCircle2,
  CloudSun,
  Navigation2,
  Users,
  CheckCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DayPlan, Location } from './constants';
import { cn, getDistance } from './utils';
import Admin from './Admin';

// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationIcon = ({ type, className }: { type: Location['type'], className?: string }) => {
  switch (type) {
    case 'cafe': return <Coffee className={className} />;
    case 'food': return <Utensils className={className} />;
    case 'hotel': return <Bed className={className} />;
    case 'travel': return <Car className={className} />;
    case 'activity': return <Camera className={className} />;
    case 'party': return <Music className={className} />;
    case 'rest': return <Bath className={className} />;
    default: return <MapPin className={className} />;
  }
};

const MapUpdater = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

const PACKING_LIST = [
  { id: 1, item: 'Áo khoác (Đà Lạt lạnh lắm)', category: 'Clothing' },
  { id: 2, item: 'Sạc dự phòng & Cáp sạc', category: 'Tech' },
  { id: 3, item: 'Giấy tờ tùy thân & Bằng lái', category: 'Docs' },
  { id: 4, item: 'Kem chống nắng & Dưỡng ẩm', category: 'Skincare' },
  { id: 6, item: 'Bàn chải đánh răng', category: 'Personal' },
  { id: 7, item: 'Khăn mặt/Khăn tắm', category: 'Personal' },
];

export default function App() {
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showPacking, setShowPacking] = useState(false);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [userCount, setUserCount] = useState(1);
  const [showFooter, setShowFooter] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  
  const socketRef = useRef<WebSocket | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const fetchItinerary = async () => {
    const res = await fetch('/api/itinerary');
    const data = await res.json();
    setItinerary(data);
  };

  useEffect(() => {
    fetchItinerary();
  }, []);

  const currentDay = itinerary[activeDay];

  // Scroll listener for footer visibility
  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
        // Show footer when scrolled to the bottom (within a small threshold)
        const atBottom = scrollHeight - scrollTop <= clientHeight + 50;
        setShowFooter(atBottom);
      }
    };

    const main = mainRef.current;
    if (main) {
      main.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
    }
    return () => main?.removeEventListener('scroll', handleScroll);
  }, [activeDay, showMap, showPacking, itinerary]);

  // WebSocket for multi-user sync
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'SYNC_CHECKLIST') {
        setCheckedItems(message.payload);
      } else if (message.type === 'UPDATE_USER_COUNT') {
        setUserCount(message.payload);
      } else if (message.type === 'SYNC_ITINERARY') {
        fetchItinerary();
      }
    };

    return () => socket.close();
  }, []);

  const handleSparkleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount === 3) {
      setIsAdmin(true);
      setClickCount(0);
    }
    // Reset count after 2 seconds of inactivity
    setTimeout(() => setClickCount(0), 2000);
  };

  const polylinePositions = useMemo(() => {
    if (!currentDay) return [];
    return currentDay.locations.map(loc => [loc.lat, loc.lng] as [number, number]);
  }, [currentDay]);

  const mapCenter = useMemo(() => {
    if (!currentDay || currentDay.locations.length === 0) return [11.9425, 108.4361] as [number, number];
    const selected = currentDay.locations.find(l => l.id === selectedLocationId);
    if (selected) return [selected.lat, selected.lng] as [number, number];
    return [currentDay.locations[0].lat, currentDay.locations[0].lng] as [number, number];
  }, [currentDay, selectedLocationId]);

  if (isAdmin) {
    return (
      <Admin 
        itinerary={itinerary} 
        onBack={() => setIsAdmin(false)} 
        onRefresh={fetchItinerary} 
      />
    );
  }

  if (itinerary.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const togglePackingItem = (id: number) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'TOGGLE_ITEM', payload: id }));
    }
  };

  const navigateToLocation = (loc: Location) => {
    const destination = loc.address ? encodeURIComponent(loc.address) : `${loc.lat},${loc.lng}`;
    window.open(`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${destination}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#FDFCFB] shadow-2xl relative overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Hero Section */}
      <header className="relative h-80 flex-shrink-0 overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://picsum.photos/seed/dalat-flowers/800/1200" 
            alt="Đà Lạt Flowers" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#FDFCFB]" />
        </motion.div>

        <div className="relative z-10 p-8 h-full flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={handleSparkleClick}
                className="p-1 hover:scale-110 transition-transform active:scale-95"
              >
                <Sparkles size={16} className="text-yellow-300 animate-pulse" />
              </button>
            </div>
            <h1 className="text-4xl font-serif italic text-white leading-tight">
              🧭 SG → ĐÀ LẠT <br />
              <span className="not-italic font-bold text-5xl tracking-tighter">27/2 — 1/3</span>
            </h1>
            
            <div className="mt-6 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold">Weather</span>
                <div className="flex items-center gap-2 text-white">
                  <CloudSun size={16} className="text-emerald-300" />
                  <span className="text-sm font-bold">16°C - 24°C</span>
                </div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold">Stay</span>
                <div className="flex items-center gap-2 text-white">
                  <Bed size={16} className="text-emerald-300" />
                  <span className="text-sm font-bold">Ladalat Hotel</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Day Selector */}
      <nav className="sticky top-0 z-30 bg-[#FDFCFB]/95 backdrop-blur-xl border-b border-black/5 px-5 py-5">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            {itinerary.map((day, idx) => (
              <button
                key={day.day}
                onClick={() => {
                  setActiveDay(idx);
                  setSelectedLocationId(null);
                }}
                className={cn(
                  "relative px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-500 overflow-hidden",
                  activeDay === idx 
                    ? "text-white" 
                    : "text-black/30 hover:text-black/50"
                )}
              >
                {activeDay === idx && (
                  <motion.div 
                    layoutId="activeDayBg"
                    className="absolute inset-0 bg-black z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">Day {day.day}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowPacking(!showPacking)}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300 relative",
                showPacking ? "bg-emerald-500 text-white" : "bg-black/5 text-black/40 hover:bg-black/10"
              )}
            >
              <CheckCircle size={18} />
              {checkedItems.length > 0 && !showPacking && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-[#FDFCFB]">
                  {checkedItems.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setShowMap(!showMap)}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                showMap ? "bg-black text-white" : "bg-black/5 text-black/40 hover:bg-black/10"
              )}
            >
              <MapIcon size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto pb-40">
        <AnimatePresence>
          {showPacking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-50/50 border-b border-emerald-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-emerald-600" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800/60">Shared Checklist</h3>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">
                        {userCount} {userCount === 1 ? 'User' : 'Users'} Online
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600/50">{checkedItems.length}/{PACKING_LIST.length} Done</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {PACKING_LIST.map(item => (
                    <button
                      key={item.id}
                      onClick={() => togglePackingItem(item.id)}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-100 shadow-sm text-left transition-all active:scale-95"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        checkedItems.includes(item.id) ? "bg-emerald-500 border-emerald-500 text-white" : "border-emerald-200"
                      )}>
                        {checkedItems.includes(item.id) && <CheckCircle2 size={12} />}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", checkedItems.includes(item.id) ? "text-black/30 line-through" : "text-black/70")}>{item.item}</span>
                        <span className="text-[9px] font-mono text-black/20 uppercase tracking-tighter">{item.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {showMap && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 350 }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full relative z-20 border-b border-black/5"
            >
              <MapContainer 
                center={mapCenter} 
                zoom={13} 
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {currentDay.locations.map((loc) => (
                  <Marker 
                    key={loc.id} 
                    position={[loc.lat, loc.lng]}
                    eventHandlers={{
                      click: () => setSelectedLocationId(loc.id),
                    }}
                  >
                    <Popup>
                      <div className="font-sans p-1">
                        <p className="font-black text-sm text-black">{loc.name}</p>
                        <p className="text-[10px] font-mono text-emerald-600 mt-1 uppercase tracking-widest">{loc.time}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                <Polyline 
                  positions={polylinePositions} 
                  color="#10b981" 
                  weight={4} 
                  opacity={0.4} 
                  dashArray="12, 12"
                />
                <MapUpdater center={mapCenter} zoom={selectedLocationId ? 15 : 12} />
              </MapContainer>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-8">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-12"
          >
            <div className="flex items-end justify-between border-b border-black/5 pb-6">
              <div>
                <h2 className="text-3xl font-serif font-bold text-black/90 leading-none tracking-tight">{currentDay.title}</h2>
                <div className="flex items-center gap-3 mt-4">
                  <p className="text-[11px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <Calendar size={12} /> {currentDay.date}
                  </p>
                  <p className="text-[11px] text-black/30 font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Navigation2 size={12} /> {currentDay.locations.length} Stops
                  </p>
                </div>
              </div>
              <div className="p-3 bg-black/5 rounded-2xl text-black/10">
                <Info size={20} />
              </div>
            </div>

            <div className="relative space-y-16 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-emerald-400/30 before:via-black/5 before:to-transparent">
              {currentDay.locations.map((loc, idx) => {
                const nextLoc = currentDay.locations[idx + 1];
                const distance = nextLoc ? getDistance(loc.lat, loc.lng, nextLoc.lat, nextLoc.lng) : 0;

                return (
                  <div key={loc.id} className="relative">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative pl-16 group cursor-pointer"
                      onClick={() => setSelectedLocationId(selectedLocationId === loc.id ? null : loc.id)}
                    >
                      {/* Timeline Dot */}
                      <div className={cn(
                        "absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-[#FDFCFB] flex items-center justify-center z-10 transition-all duration-500 shadow-lg",
                        selectedLocationId === loc.id 
                          ? "bg-black text-white scale-125 rotate-[360deg] shadow-black/20" 
                          : "bg-white text-black/20 group-hover:text-black/50 group-hover:scale-110 group-hover:shadow-xl"
                      )}>
                        <LocationIcon type={loc.type} className="w-4.5 h-4.5" />
                      </div>

                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-[11px] font-mono font-black uppercase tracking-[0.2em] text-emerald-600/60">
                            <Clock size={14} /> {loc.time}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToLocation(loc);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-black/5 text-black/50 hover:bg-black hover:text-white transition-all duration-500 text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-90"
                          >
                            <ExternalLink size={12} /> Go
                          </button>
                        </div>

                        <h3 className={cn(
                          "text-2xl font-bold leading-tight transition-all duration-500 tracking-tight",
                          selectedLocationId === loc.id ? "text-black translate-x-3" : "text-black/70"
                        )}>
                          {loc.name}
                        </h3>
                        
                        <p className="text-base text-black/50 leading-relaxed font-medium">
                          {loc.description}
                        </p>

                        <AnimatePresence>
                          {(selectedLocationId === loc.id || loc.suggestions) && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              {loc.suggestions && (
                                <div className="mt-6 flex flex-wrap gap-3">
                                  {loc.suggestions.map(s => (
                                    <span key={s} className="text-[11px] bg-emerald-50 text-emerald-800/60 px-5 py-2.5 rounded-2xl font-black border border-emerald-100/50 shadow-sm">
                                      ✨ {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {loc.address && (
                                <div className="mt-5 p-5 rounded-[2rem] bg-black/[0.02] border border-black/[0.05] flex items-start gap-5 group/addr hover:bg-black/[0.04] transition-all duration-300">
                                  <div className="p-3 rounded-2xl bg-white shadow-sm text-black/20 group-hover/addr:text-emerald-500 transition-colors">
                                    <MapPin size={18} />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono text-black/20 uppercase tracking-widest font-bold">Address</span>
                                    <span className="text-xs text-black/40 font-bold leading-relaxed">
                                      {loc.address}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    {/* Distance Indicator - Positioned to the left of the timeline to avoid title overlap */}
                    {nextLoc && (
                      <div className="absolute left-[19px] top-[50%] -translate-y-1/2 -translate-x-[110%] z-20">
                        <div className="flex flex-col items-center bg-white/90 backdrop-blur-sm px-1.5 py-1 rounded-lg border border-black/5 shadow-sm whitespace-nowrap">
                          <Route size={8} className="text-emerald-500/50 mb-0.5" />
                          <span className="text-[8px] font-mono font-black text-black/40">
                            {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Floating Footer Navigation */}
      <AnimatePresence>
        {showFooter && (
          <motion.footer 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-6rem)] max-w-[calc(448px-6rem)] z-40"
          >
            <div className="bg-black/95 backdrop-blur-3xl text-white rounded-full p-2.5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex items-center justify-between border border-white/10">
              <div className="flex flex-col pl-4">
                <span className="text-[7px] font-mono opacity-30 uppercase tracking-[0.3em] font-black">Day {activeDay + 1}</span>
                <span className="text-[11px] font-black tracking-tight truncate max-w-[120px]">
                  {currentDay.title}
                </span>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setActiveDay(prev => Math.max(0, prev - 1))}
                  disabled={activeDay === 0}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-5 transition-all active:scale-90"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setActiveDay(prev => Math.min(itinerary.length - 1, prev + 1))}
                  disabled={activeDay === itinerary.length - 1}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-5 transition-all active:scale-90"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Atmospheric Blur Backgrounds */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-60">
        <div className="absolute top-[-40%] left-[-40%] w-[120%] h-[120%] bg-emerald-100/20 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-[-40%] right-[-40%] w-[120%] h-[120%] bg-orange-50/20 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
    </div>
  );
}

