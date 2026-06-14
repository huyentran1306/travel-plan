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
  CheckCircle,
  Plus,
  Trash2,
  Compass,
  ChevronDown
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DayPlan, Location, Trip } from './constants';
import { cn, getDistance } from './utils';
import { getItinerary, getTrips, saveTrip, deleteTrip, IS_STATIC } from './api';
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

interface PackingItem {
  id: string | number;
  item: string;
  category: string;
  notes?: string;
  isCustom?: boolean;
}

const DEFAULT_PACKING_LIST: PackingItem[] = [
  { id: 1, category: 'Giấy tờ', item: 'CMND/CCCD', notes: 'Mang bản gốc' },
  { id: 11, category: 'Giấy tờ', item: 'Bằng lái xe', notes: 'Để thuê xe máy hoặc lái xe' },
  { id: 2, category: 'Hành lý', item: 'Quần áo', notes: '3 ngày, thời tiết mùa hè' },
  { id: 3, category: 'Hành lý', item: 'Đồ vệ sinh cá nhân', notes: 'Bàn chải, kem đánh răng, dầu gội, sữa tắm' },
  { id: 4, category: 'Hành lý', item: 'Thuốc men cần thiết', notes: 'Thuốc đau đầu, cảm cúm, dị ứng' },
  { id: 5, category: 'Hành lý', item: 'Kem chống nắng', notes: 'SPF 50+ cho biển' },
  { id: 6, category: 'Hành lý', item: 'Đồ tắm suối', notes: 'Quần áo bơi, khăn tắm dự phòng' },
  { id: 7, category: 'Điện tử', item: 'Sạc điện thoại', notes: 'Sạc và dây cáp' },
  { id: 8, category: 'Điện tử', item: 'Sạc dự phòng (Power bank)', notes: 'Dung lượng cao' },
  { id: 9, category: 'Khác', item: 'Camera/Máy ảnh', notes: 'Lưu kỷ niệm chuyến đi' },
  { id: 10, category: 'Khác', item: 'Kính râm', notes: 'Chống nắng' }
];

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(() => {
    return localStorage.getItem('travel-plan-active-trip-id');
  });
  
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  const [showMap, setShowMap] = useState(false);
  const [showPacking, setShowPacking] = useState(false);
  const [checkedItems, setCheckedItems] = useState<(string | number)[]>([]);
  const [userCount, setUserCount] = useState(1);
  const [showFooter, setShowFooter] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const [packingItems, setPackingItems] = useState<PackingItem[]>(() => {
    const saved = localStorage.getItem('travel-plan-packing-list-items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Inject driver's license if missing
        const hasLicense = parsed.some((item: any) => item.item === 'Bằng lái xe');
        const updated = [...parsed];
        if (!hasLicense) {
          updated.push({ id: 11, category: 'Giấy tờ', item: 'Bằng lái xe', notes: 'Để thuê xe máy hoặc lái xe' });
        }
        // Force clothing notes to match the updated 3 days
        updated.forEach((item: any) => {
          if (item.item === 'Quần áo' && item.notes === '7 ngày, thời tiết mùa hè') {
            item.notes = '3 ngày, thời tiết mùa hè';
          }
        });
        return updated;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_PACKING_LIST;
  });

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Giấy tờ');
  const [newItemNotes, setNewItemNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('travel-plan-packing-list-items', JSON.stringify(packingItems));
  }, [packingItems]);
  
  // Trip Creation States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTripData, setNewTripData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  });

  const socketRef = useRef<WebSocket | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const selectedTripIdRef = useRef<string | null>(selectedTripId);

  // Sync ref to avoid socket recreation closures
  useEffect(() => {
    selectedTripIdRef.current = selectedTripId;
    if (selectedTripId) {
      localStorage.setItem('travel-plan-active-trip-id', selectedTripId);
    } else {
      localStorage.removeItem('travel-plan-active-trip-id');
    }
  }, [selectedTripId]);

  // Safeguard days index when switching trips
  useEffect(() => {
    setActiveDay(0);
    setSelectedLocationId(null);
  }, [selectedTripId]);

  const loadTripsList = async () => {
    const data = await getTrips();
    setTrips(data);
  };

  const fetchItinerary = async (tripId: string) => {
    const data = await getItinerary(tripId);
    setItinerary(data);
  };

  useEffect(() => {
    loadTripsList();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchItinerary(selectedTripId);
    } else {
      setItinerary([]);
    }
  }, [selectedTripId]);

  const activeTrip = useMemo(() => {
    return trips.find(t => t.id === selectedTripId);
  }, [trips, selectedTripId]);

  const currentDay = useMemo(() => {
    return itinerary[activeDay];
  }, [itinerary, activeDay]);

  // Scroll listener for footer visibility (active trip view)
  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
        const atBottom = scrollHeight - scrollTop <= clientHeight + 50;
        setShowFooter(atBottom);
      }
    };

    const main = mainRef.current;
    if (main) {
      main.addEventListener('scroll', handleScroll);
      handleScroll();
    }
    return () => main?.removeEventListener('scroll', handleScroll);
  }, [activeDay, showMap, showPacking, itinerary, selectedTripId]);

  // WebSocket for multi-user sync
  useEffect(() => {
    if (IS_STATIC) {
      const savedChecklist = localStorage.getItem('travel-plan-checklist');
      if (savedChecklist) {
        try {
          setCheckedItems(JSON.parse(savedChecklist));
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'SYNC_CHECKLIST') {
        setCheckedItems(message.payload);
        localStorage.setItem('travel-plan-checklist', JSON.stringify(message.payload));
      } else if (message.type === 'UPDATE_USER_COUNT') {
        setUserCount(message.payload);
      } else if (message.type === 'SYNC_TRIPS') {
        loadTripsList();
      } else if (message.type === 'SYNC_ITINERARY') {
        if (selectedTripIdRef.current) {
          fetchItinerary(selectedTripIdRef.current);
        }
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
    setTimeout(() => setClickCount(0), 2000);
  };

  const polylinePositions = useMemo(() => {
    if (!currentDay) return [];
    return currentDay.locations.map(loc => [loc.lat, loc.lng] as [number, number]);
  }, [currentDay]);

  const mapCenter = useMemo(() => {
    if (!currentDay || currentDay.locations.length === 0) return [13.0900, 109.3000] as [number, number];
    const selected = currentDay.locations.find(l => l.id === selectedLocationId);
    if (selected) return [selected.lat, selected.lng] as [number, number];
    return [currentDay.locations[0].lat, currentDay.locations[0].lng] as [number, number];
  }, [currentDay, selectedLocationId]);

  const togglePackingItem = (id: string | number) => {
    let newCheckedItems;
    if (checkedItems.includes(id as any)) {
      newCheckedItems = checkedItems.filter(i => i !== id);
    } else {
      newCheckedItems = [...checkedItems, id];
    }
    setCheckedItems(newCheckedItems);
    localStorage.setItem('travel-plan-checklist', JSON.stringify(newCheckedItems));

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'TOGGLE_ITEM', payload: id }));
    }
  };

  const deletePackingItem = (id: string | number) => {
    setPackingItems(prev => prev.filter(item => item.id !== id));
    setCheckedItems(prev => prev.filter(i => i !== id));
  };

  const resetPackingItems = () => {
    if (window.confirm('Bạn có muốn khôi phục danh sách đồ dùng chuẩn bị về mặc định không?')) {
      setPackingItems(DEFAULT_PACKING_LIST);
      setCheckedItems([]);
      localStorage.removeItem('travel-plan-checklist');
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'SYNC_CHECKLIST', payload: [] }));
      }
    }
  };

  const handleAddPackingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: PackingItem = {
      id: `packing-${Date.now()}`,
      item: newItemName.trim(),
      category: newItemCategory,
      notes: newItemNotes.trim() || undefined,
      isCustom: true
    };

    setPackingItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemNotes('');
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, PackingItem[]> = {};
    packingItems.forEach(item => {
      const cat = item.category || 'Khác';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });
    return groups;
  }, [packingItems]);

  const navigateToLocation = (loc: Location) => {
    const destination = loc.address ? encodeURIComponent(loc.address) : `${loc.lat},${loc.lng}`;
    window.open(`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${destination}`, '_blank');
  };

  // Status computation for Trip badge
  const getTripStatus = (startDateStr: string, endDateStr: string) => {
    const now = new Date();
    now.setHours(0,0,0,0);
    const start = new Date(startDateStr);
    start.setHours(0,0,0,0);
    const end = new Date(endDateStr);
    end.setHours(0,0,0,0);

    if (now >= start && now <= end) {
      return { label: 'Đang diễn ra 🚀', color: 'bg-emerald-500 text-white border-emerald-600' };
    } else if (now < start) {
      return { label: 'Sắp diễn ra 📅', color: 'bg-sky-500 text-white border-sky-600' };
    } else {
      return { label: 'Đã hoàn tất 🏆', color: 'bg-black/40 text-white/90 border-transparent' };
    }
  };

  const handleCreateTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripData.name || !newTripData.startDate || !newTripData.endDate) return;

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name: newTripData.name,
      description: newTripData.description || 'Hành trình cùng gia đình & đồng bọn.',
      startDate: newTripData.startDate,
      endDate: newTripData.endDate,
      imageUrl: newTripData.imageUrl
    };

    await saveTrip(newTrip);
    setShowCreateModal(false);
    setNewTripData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    });
    // Reload trips list & select the newly created trip!
    await loadTripsList();
    setSelectedTripId(newTrip.id);
  };

  const handleDeleteTripClick = async (tripId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hành trình này? Việc xóa sẽ bao gồm tất cả các ngày và địa điểm đi kèm.')) return;
    await deleteTrip(tripId);
    if (selectedTripId === tripId) {
      setSelectedTripId(null);
    }
    loadTripsList();
  };

  // Active Trip Dynamic Presentation Configuration
  const tripConfig = useMemo(() => {
    if (!activeTrip) return null;
    const isPhuYen = activeTrip.id === 'phu-yen-2026';
    const isDalat = activeTrip.id === 'da-lat-2026';
    const isVungTau = activeTrip.id === 'vung-tau-2026';

    if (isPhuYen) {
      return {
        coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800',
        weather: '28°C - 34°C',
        stay: 'Nhà Liền (Tây Hòa)'
      };
    } else if (isDalat) {
      return {
        coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        weather: '14°C - 21°C',
        stay: 'Homestay Thung Lũng'
      };
    } else if (isVungTau) {
      return {
        coverImage: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
        weather: '27°C - 33°C',
        stay: 'Căn hộ biển Bãi Sau'
      };
    } else {
      return {
        coverImage: activeTrip.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
        weather: '26°C - 32°C',
        stay: 'Homestay / Khách sạn'
      };
    }
  }, [activeTrip]);

  if (isAdmin && selectedTripId) {
    return (
      <Admin 
        itinerary={itinerary} 
        tripId={selectedTripId}
        onBack={() => setIsAdmin(false)} 
        onRefresh={() => fetchItinerary(selectedTripId)} 
      />
    );
  }

  // --- VIEW 1: HOME PAGE TRIP SELECTOR ---
  if (!selectedTripId) {
    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#FDFCFB] shadow-2xl relative overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16">
        
        {/* Cool, beautiful travel-inspired header */}
        <header className="relative h-72 flex-shrink-0 flex flex-col justify-end p-8 overflow-hidden rounded-b-[2rem] shadow-lg">
          {/* Stunning travel road trip / wanderlust backdrop */}
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800" 
            alt="Wanderlust Background" 
            className="absolute inset-0 w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />
          {/* Elegant warm-toned dark bottom-feathered gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white border border-white/10 text-[9px] font-black uppercase rounded-lg tracking-widest leading-none">
                ✈️ VI VU ĐỒNG BỌN
              </span>
              <div className="flex items-center gap-1.5 bg-emerald-500/80 backdrop-blur-md rounded-lg px-2.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[8px] font-black text-white uppercase tracking-wider whitespace-nowrap">
                  {userCount} kết nối
                </span>
              </div>
            </div>
            
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              KẾ HOẠCH HÀNH TRÌNH 🗺️
            </h1>
            <p className="text-[11px] text-white/80 font-medium max-w-xs leading-relaxed tracking-wide drop-shadow-sm font-sans">
              Theo dõi lịch trình chi tiết, tương tác cùng đồng đội và gói ghém hành lý một cách hoàn hảo nhất.
            </p>
          </div>
        </header>

        {/* Action strip */}
        <section className="px-6 py-6 flex items-center justify-between border-b border-black/5 bg-white">
          <div className="flex flex-col">
            <span className="text-xs font-black text-black uppercase tracking-wider">Hành trình ({trips.length})</span>
            <span className="text-[10px] text-black/40 font-bold uppercase tracking-wide">Xếp thứ tự gần nhất</span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:scale-[1.03] active:scale-95 transition-all"
          >
            <Plus size={14} /> Thêm chuyến
          </button>
        </section>

        {/* Trips grid stack */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <AnimatePresence>
            {trips.map((trip, idx) => {
              const status = getTripStatus(trip.startDate, trip.endDate);
              const isClosest = idx === 0; // Sorted in DB by closest first
              const formattedStart = new Date(trip.startDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
              const formattedEnd = new Date(trip.endDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });

              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative h-48 bg-white rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all border border-black/5"
                  onClick={() => setSelectedTripId(trip.id)}
                >
                  {/* Card Cover image */}
                  <img 
                    src={trip.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80'} 
                    alt={trip.name} 
                    className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-[1.04] transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {/* Heavy overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/10 transition-colors duration-300" />

                  {/* Status badging absolute */}
                  <div className="absolute top-4 left-4 flex gap-1.5 z-10 items-center">
                    <span className={cn("px-2.5 py-1 text-[8px] font-black uppercase rounded-lg border shadow-sm tracking-widest", status.color)}>
                      {status.label}
                    </span>
                    {isClosest && (
                      <span className="px-2.5 py-1 bg-yellow-400 text-black text-[8px] font-black uppercase rounded-lg shadow-sm tracking-widest">
                        Tiêu điểm ✨
                      </span>
                    )}
                  </div>

                  {/* Absolute Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTripClick(trip.id);
                    }}
                    className="absolute top-4 right-4 p-2.5 bg-black/50 hover:bg-red-600 text-white rounded-xl backdrop-blur-md opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all shadow-sm z-20"
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* Text content card details */}
                  <div className="absolute inset-x-4 bottom-4 text-white z-10 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-white/60 mb-0.5 tracking-widest font-mono flex items-center gap-1">
                      <Calendar size={10} /> {formattedStart} — {formattedEnd}
                    </span>
                    <h2 className="text-xl font-bold tracking-tight mb-1 group-hover:text-yellow-100 transition-colors leading-snug">
                      {trip.name}
                    </h2>
                    <p className="text-xs text-white/50 line-clamp-1 max-w-[280px]">
                      {trip.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {trips.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <Compass size={40} className="mx-auto text-black/10 animate-spin" />
              <p className="text-sm font-bold text-black/40 uppercase tracking-wider">Không tìm thấy chuyến đi nào</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest"
              >
                Tạo Chuyến Đi Mày Nhé!
              </button>
            </div>
          )}
        </main>

        {/* Modal: New trip creation */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.form 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onSubmit={handleCreateTripSubmit}
                className="w-full max-w-xs bg-white rounded-[2.5rem] p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-lg font-black uppercase tracking-tight">Tạo chuyến đi 🚗</h3>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="text-black/30 font-bold text-xs uppercase uppercase">Hủy</button>
                </div>

                <div className="space-y-3.5 text-left">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-black uppercase text-black/30">Tên hành trình</label>
                    <input 
                      required
                      placeholder="vd: Đà Lạt đi trốn nóng ❄️"
                      value={newTripData.name}
                      onChange={e => setNewTripData({...newTripData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-black/5 rounded-2xl font-bold text-xs focus:outline-none focus:ring-1 ring-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-black uppercase text-black/30">Mô tả ngắn</label>
                    <textarea 
                      placeholder="Ăn hải sản, tắm biển và chill hoàng hôn..."
                      value={newTripData.description}
                      onChange={e => setNewTripData({...newTripData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-black/5 rounded-2xl font-bold text-xs focus:outline-none focus:ring-1 ring-black min-h-[60px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-black uppercase text-black/30">Ngày đi</label>
                      <input 
                        required
                        type="date"
                        value={newTripData.startDate}
                        onChange={e => setNewTripData({...newTripData, startDate: e.target.value})}
                        className="w-full px-4 py-3 bg-black/5 rounded-2xl font-bold text-xs focus:outline-none focus:ring-1 ring-black appearance-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-black uppercase text-black/30">Ngày về</label>
                      <input 
                        required
                        type="date"
                        value={newTripData.endDate}
                        onChange={e => setNewTripData({...newTripData, endDate: e.target.value})}
                        className="w-full px-4 py-3 bg-black/5 rounded-2xl font-bold text-xs focus:outline-none focus:ring-1 ring-black"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-black uppercase text-black/30">Ảnh bìa mẫu</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: 'Nước biển 🏖️', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
                        { name: 'Núi mây ⛰️', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
                        { name: 'Khách sạn 🌊', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800' },
                      ].map(cover => (
                        <button
                          key={cover.name}
                          type="button"
                          onClick={() => setNewTripData({ ...newTripData, imageUrl: cover.url })}
                          className={cn(
                            "py-1.5 rounded-lg border text-[8px] font-black capitalize truncate leading-none",
                            newTripData.imageUrl === cover.url ? "bg-black text-white border-black" : "bg-black/5 text-black/50 border-transparent"
                          )}
                        >
                          {cover.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg active:scale-95 transition-all"
                >
                  Bắt đầu Lên lịch ví vi vu
                </button>
              </motion.form>
            </div>
          )}
        </AnimatePresence>

        {/* Global branding credit line */}
        <div className="absolute bottom-4 left-0 w-full text-center text-black/10 text-[8px] font-bold tracking-widest font-mono uppercase">
          Team trip logs Space
        </div>
      </div>
    );
  }

  // --- VIEW 2: TRIP DETAILED PLANNER VIEW ---
  if (!tripConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            src={tripConfig.coverImage} 
            alt={activeTrip.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#FDFCFB]" />
        </motion.div>

        {/* Back back Button to Trip Selection Dashboard */}
        <button 
          onClick={() => {
            setSelectedTripId(null);
            setItinerary([]);
          }}
          className="absolute top-6 left-6 z-20 px-4 py-2 bg-black/65 hover:bg-black text-white text-[10px] font-black uppercase rounded-xl backdrop-blur-md flex items-center gap-1 shadow-md hover:scale-[1.03] active:scale-95 transition-all"
        >
          <ChevronLeft size={14} /> Tất cả chuyến đi
        </button>

        <div className="relative z-10 p-8 h-full flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={handleSparkleClick}
                className="p-1 hover:scale-110 transition-transform active:scale-95"
                title="Double-click 3 times to enter admin mode"
              >
                <Sparkles size={16} className="text-yellow-300 animate-pulse" />
              </button>
            </div>
            
            <h1 className="text-3xl font-bold text-white tracking-tighter leading-tight mb-2">
              {activeTrip.name}
            </h1>
            
            <div className="flex items-center gap-5 mt-4">
              <div className="flex flex-col">
                <span className="text-[8px] text-white/50 uppercase tracking-widest font-black font-mono">Thời tiết</span>
                <div className="flex items-center gap-1.5 text-white">
                  <CloudSun size={14} className="text-emerald-300" />
                  <span className="text-xs font-bold leading-none">{tripConfig.weather}</span>
                </div>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-[8px] text-white/50 uppercase tracking-widest font-black font-mono">Lưu trú</span>
                <div className="flex items-center gap-1.5 text-white">
                  <Bed size={14} className="text-emerald-300" />
                  <span className="text-xs font-bold leading-none truncate max-w-[120px]">{tripConfig.stay}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Day Selector block if itinerary days exist */}
      {itinerary.length > 0 && (
        <nav className="sticky top-0 z-30 bg-[#FDFCFB]/95 backdrop-blur-xl border-b border-black/5 px-5 py-5">
          <div className="flex justify-between items-center">
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar max-w-[80%]">
              {itinerary.map((day, idx) => (
                <button
                  key={day.day}
                  onClick={() => {
                    setActiveDay(idx);
                    setSelectedLocationId(null);
                  }}
                  className={cn(
                    "relative px-4 py-2 rounded-2xl text-[11px] font-black transition-all duration-300 overflow-hidden shrink-0",
                    activeDay === idx 
                      ? "text-white" 
                      : "text-black/30 hover:text-black/50"
                  )}
                >
                  {activeDay === idx && (
                    <motion.div 
                      layoutId="activeDayBg"
                      className="absolute inset-0 bg-black z-0"
                      transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">Day {day.day}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => setShowPacking(!showPacking)}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300 relative",
                  showPacking ? "bg-emerald-500 text-white" : "bg-black/5 text-black/40 hover:bg-black/10"
                )}
                title="Bản đồ chuẩn bị đồ dùng"
              >
                <CheckCircle size={16} />
                {checkedItems.filter(id => packingItems.some(item => item.id === id)).length > 0 && !showPacking && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-[#FDFCFB]">
                    {checkedItems.filter(id => packingItems.some(item => item.id === id)).length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setShowMap(!showMap)}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  showMap ? "bg-black text-white" : "bg-black/5 text-black/40 hover:bg-black/10"
                )}
                title="Xem bản đồ hành trình"
              >
                <MapIcon size={16} />
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto pb-40">
        <AnimatePresence>
          {showPacking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-50/50 border-b border-emerald-100 overflow-hidden font-sans"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-emerald-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800/80">Checklist Đồng Đội 🎒</h3>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">
                        {userCount} Online
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-emerald-600/70 font-mono">
                      {checkedItems.filter(id => packingItems.some(item => item.id === id)).length}/{packingItems.length}
                    </span>
                    <button
                      type="button"
                      onClick={resetPackingItems}
                      className="text-[9px] hover:underline text-rose-600 font-black uppercase tracking-wider"
                      title="Khôi phục danh sách mặc định"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Grouped layout by Category */}
                <div className="space-y-4">
                  {(Object.entries(groupedItems) as [string, PackingItem[]][]).map(([category, items]) => (
                    <div key={category} className="bg-white/40 p-4 rounded-2xl border border-emerald-100/30">
                      <h4 className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-emerald-100/20 pb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 gap-1.5">
                        {items.map(item => {
                          const isCompleted = checkedItems.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-3 p-3 bg-white hover:bg-emerald-50/20 rounded-xl border border-emerald-100/50 shadow-sm transition-all text-left"
                            >
                              <button
                                type="button"
                                onClick={() => togglePackingItem(item.id)}
                                className="flex-1 flex items-center gap-3 text-left"
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0",
                                  isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-emerald-200 bg-white"
                                )}>
                                  {isCompleted && <CheckCircle2 size={11} />}
                                </div>
                                <div className="flex flex-col select-none">
                                  <span className={cn(
                                    "text-xs font-bold leading-snug", 
                                    isCompleted ? "text-black/30 line-through font-medium" : "text-black/80"
                                  )}>
                                    {item.item}
                                  </span>
                                  {item.notes && (
                                    <span className={cn(
                                      "text-[10px] mt-0.5 font-medium leading-none",
                                      isCompleted ? "text-black/20" : "text-black/45"
                                    )}>
                                      📝 {item.notes}
                                    </span>
                                  )}
                                </div>
                              </button>
                              
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletePackingItem(item.id);
                                }}
                                className="p-1 px-2 rounded-lg hover:bg-rose-50 text-black/20 hover:text-rose-500 transition-colors shrink-0"
                                title="Xóa"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form to add custom packing items */}
                <form 
                  onSubmit={handleAddPackingItem}
                  className="mt-5 p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-3"
                >
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    <Plus size={12} className="text-emerald-500" /> Thêm đồ dùng tự chọn
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-black/40 mb-1 tracking-wider">Tên món đồ *</label>
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Ví dụ: Quần bơi, Loa kéo, Thuốc đau bụng..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-200"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-black/40 mb-1 tracking-wider font-sans">Hạng mục</label>
                        <select
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold font-sans focus:outline-none focus:border-emerald-200"
                        >
                          <option value="Giấy tờ">Giấy tờ 📄</option>
                          <option value="Hành lý">Hành lý 🎒</option>
                          <option value="Điện tử">Điện tử ⚡</option>
                          <option value="Khác">Khác ✨</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-[9px] font-black uppercase text-black/40 mb-1 tracking-wider font-sans">Ghi chú (Không bắt buộc)</label>
                        <input
                          type="text"
                          value={newItemNotes}
                          onChange={(e) => setNewItemNotes(e.target.value)}
                          placeholder="Ví dụ: Đút túi khóa..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-200"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm font-sans"
                    >
                      Thêm Vào Danh Sách
                    </button>
                  </div>
                </form>

              </div>
            </motion.div>
          )}

          {showMap && currentDay && currentDay.locations.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 350 }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full relative z-20 border-b border-black/5"
            >
              <MapContainer 
                center={mapCenter} 
                zoom={12} 
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
                <MapUpdater center={mapCenter} zoom={selectedLocationId ? 14 : 11} />
              </MapContainer>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {currentDay ? (
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-10"
              >
                <div className="flex items-end justify-between border-b border-black/5 pb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-black/90 leading-tight tracking-tight">{currentDay.title}</h2>
                    <div className="flex items-center gap-3 mt-3">
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-full">
                        <Calendar size={11} /> {currentDay.date}
                      </p>
                      <p className="text-[10px] text-black/30 font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Navigation2 size={11} /> {currentDay.locations.length} Stops
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-black/5 rounded-2xl text-black/15">
                    <Info size={16} />
                  </div>
                </div>

                {/* Timeline rendering block */}
                <div className="relative space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-emerald-400/30 before:via-black/5 before:to-transparent">
                  {currentDay.locations.map((loc, idx) => {
                    const nextLoc = currentDay.locations[idx + 1];
                    const distance = nextLoc ? getDistance(loc.lat, loc.lng, nextLoc.lat, nextLoc.lng) : 0;

                    return (
                      <div key={loc.id} className="relative">
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="relative pl-14 group cursor-pointer"
                          onClick={() => setSelectedLocationId(selectedLocationId === loc.id ? null : loc.id)}
                        >
                          {/* Timeline Dot */}
                          <div className={cn(
                            "absolute left-0 top-1 w-9 h-9 rounded-full border-4 border-[#FDFCFB] flex items-center justify-center z-10 transition-all duration-300 shadow-md",
                            selectedLocationId === loc.id 
                              ? "bg-black text-white scale-110 shadow-black/25" 
                              : "bg-white text-black/15 group-hover:text-black/40 group-hover:scale-105"
                          )}>
                            <LocationIcon type={loc.type} className="w-3.5 h-3.5" />
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider text-emerald-600/70">
                                <Clock size={12} /> {loc.time}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateToLocation(loc);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/5 text-black/50 hover:bg-black hover:text-white transition-all duration-350 text-[9px] font-black uppercase tracking-wider active:scale-90"
                              >
                                <ExternalLink size={10} /> dẫn đường
                              </button>
                            </div>

                            <h3 className={cn(
                              "text-xl font-bold leading-none transition-all duration-300 tracking-tight",
                              selectedLocationId === loc.id ? "text-emerald-600 translate-x-2" : "text-black/80"
                            )}>
                              {loc.name}
                            </h3>
                            
                            <p className="text-xs text-black/45 leading-relaxed font-semibold">
                              {loc.description}
                            </p>

                            {/* Sticky-guide note if exists */}
                            {loc.guide && (
                              <div className="mt-2.5 px-3.5 py-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/50 flex items-start gap-2 shadow-sm text-[11px] text-amber-900/90 leading-relaxed">
                                <span className="text-xs">📒</span>
                                <div className="flex-1">
                                  <span className="font-extrabold text-amber-950 block text-[8px] uppercase tracking-wider leading-none mb-1">Cần nhớ:</span>
                                  {loc.guide}
                                </div>
                              </div>
                            )}

                            {/* Expansion list recommendations */}
                            <AnimatePresence>
                              {(selectedLocationId === loc.id || loc.suggestions) && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  {loc.suggestions && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                      {loc.suggestions.map(s => (
                                        <span key={s} className="text-[10px] bg-emerald-50 text-emerald-800/80 px-4 py-2 rounded-xl font-black border border-emerald-100/50 shadow-sm leading-none">
                                          ✨ {s}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {loc.address && (
                                    <div className="mt-4 p-4 rounded-2xl bg-black/[0.015] border border-black/[0.04] flex items-start gap-4 hover:bg-black/[0.03] transition-all">
                                      <div className="p-2 ml-1 rounded-xl bg-white shadow-sm text-black/20">
                                        <MapPin size={14} />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-[8px] font-mono text-black/20 uppercase tracking-widest font-black">Địa chỉ</span>
                                        <span className="text-[10px] text-black/50 font-bold leading-normal">
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

                        {/* Distance Indicator in-between nodes */}
                        {nextLoc && (
                          <div className="absolute left-[19px] top-[50%] -translate-y-1/2 -translate-x-[110%] z-20">
                            <div className="flex flex-col items-center bg-white border border-black/5 px-1 py-0.5 rounded-md shadow-sm whitespace-nowrap">
                              <span className="text-[7.5px] font-mono font-black text-black/40">
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
            ) : (
              <div className="py-20 text-center space-y-4">
                <Compass className="mx-auto text-black/15 animate-bounce" size={40} />
                <h3 className="text-md font-black uppercase text-black/30">Chưa có ngày hay địa điểm</h3>
                <p className="text-xs text-black/40 max-w-[200px] mx-auto">
                  Click đúp vào biểu tượng ngôi sao màu vàng ba lần ở góc bên phải để kích hoạt chế độ **Admin** nhằm thêm mới sự kiện!
                </p>
                <button
                  onClick={handleSparkleClick}
                  className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase rounded-lg shadow-md"
                >
                  Kích hoạt bí mật
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Footer Navigation controls */}
      <AnimatePresence>
        {showFooter && currentDay && (
          <motion.footer 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-6rem)] max-w-[calc(448px-6rem)] z-40 animate-pulse"
          >
            <div className="bg-black text-white rounded-full p-2.5 shadow-lg flex items-center justify-between border border-white/5">
              <div className="flex flex-col pl-4">
                <span className="text-[7px] font-mono opacity-40 uppercase tracking-widest font-black leading-none mb-1">Hành trình</span>
                <span className="text-[10px] font-black tracking-tight truncate max-w-[120px] leading-tight">
                  Day {activeDay + 1}: {currentDay.title}
                </span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => setActiveDay(prev => Math.max(0, prev - 1))}
                  disabled={activeDay === 0}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all active:scale-90"
                >
                  <ChevronLeft size={14} />
                </button>
                <button 
                  onClick={() => setActiveDay(prev => Math.min(itinerary.length - 1, prev + 1))}
                  disabled={activeDay === itinerary.length - 1}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all active:scale-90"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Atmospheric Blur Backgrounds */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-40">
        <div className="absolute top-[-30%] left-[-30%] w-[100%] h-[100%] bg-emerald-100 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-30%] right-[-30%] w-[100%] h-[100%] bg-amber-50 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
    </div>
  );
}
