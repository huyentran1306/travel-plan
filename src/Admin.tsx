import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Type, 
  AlignLeft, 
  Navigation2,
  Calendar,
  Edit3,
  GripVertical
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DayPlan, Location } from './constants';
import { cn } from './utils';
import { saveLocation, deleteLocation, reorderLocations, updateDay } from './api';

interface AdminProps {
  itinerary: DayPlan[];
  tripId: string;
  onBack: () => void;
  onRefresh: () => void;
}

interface SortableItemProps {
  loc: Location;
  day: number;
  onEdit: (loc: Location, day: number) => void;
  onDelete: (id: string) => void;
  key?: string | number;
}

function SortableLocation({ loc, day, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: loc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "p-4 bg-white rounded-2xl border border-black/5 shadow-sm flex items-center justify-between group transition-all",
        isDragging && "shadow-2xl scale-[1.02] opacity-50"
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <div 
          {...attributes} 
          {...listeners}
          className="p-2 -ml-2 text-black/10 hover:text-black/30 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-emerald-500">{loc.time}</span>
            <h3 className="font-bold text-sm">{loc.name}</h3>
          </div>
          <p className="text-[10px] text-black/40 line-clamp-1">{loc.description}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => onEdit(loc, day)}
          className="p-2 text-black/20 hover:text-black transition-colors"
        >
          <Edit3 size={16} />
        </button>
        <button 
          onClick={() => onDelete(loc.id)}
          className="p-2 text-black/20 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Admin({ itinerary, tripId, onBack, onRefresh }: AdminProps) {
  const [editingLoc, setEditingLoc] = useState<Partial<Location> & { day?: number } | null>(null);
  const [editingDay, setEditingDay] = useState<{ day: number, date: string, title: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent, day: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const dayPlan = itinerary.find(d => d.day === day);
    if (!dayPlan) return;

    const oldIndex = dayPlan.locations.findIndex(l => l.id === active.id);
    const newIndex = dayPlan.locations.findIndex(l => l.id === over.id);

    const newLocations = arrayMove(dayPlan.locations, oldIndex, newIndex);
    
    // Optimistic update
    const updatedItinerary = itinerary.map(d => 
      d.day === day ? { ...d, locations: newLocations } : d
    );
    // We don't have a global state here, we rely on onRefresh, but for smooth UI we could use local state
    // For now, let's just send to server and refresh
    
    const reorderPayload = newLocations.map((loc, idx) => ({
      id: loc.id,
      order_index: idx
    }));

    await reorderLocations(reorderPayload, tripId);

    onRefresh();
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoc) return;

    await saveLocation({ ...editingLoc, trip_id: tripId });

    setEditingLoc(null);
    onRefresh();
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    await deleteLocation(id, tripId);
    onRefresh();
  };

  const handleSaveDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;

    await updateDay(editingDay.day, editingDay.date, editingDay.title, tripId);

    setEditingDay(null);
    onRefresh();
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6 pb-24 font-sans max-w-md mx-auto">
      <header className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="p-3 bg-black text-white rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black tracking-tighter uppercase">Admin Panel</h1>
        <div className="w-10" />
      </header>

      <div className="space-y-12">
        {itinerary.map(dayPlan => (
          <section key={dayPlan.day} className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-black uppercase text-black/30">Day {dayPlan.day}</span>
                <h2 className="text-xl font-black">{dayPlan.title}</h2>
                <span className="text-xs font-bold text-emerald-600">{dayPlan.date}</span>
              </div>
              <button 
                onClick={() => setEditingDay({ day: dayPlan.day, date: dayPlan.date, title: dayPlan.title })}
                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"
              >
                <Edit3 size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, dayPlan.day)}
              >
                <SortableContext 
                  items={dayPlan.locations.map(l => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {dayPlan.locations.map(loc => (
                    <SortableLocation 
                      key={loc.id} 
                      loc={loc} 
                      day={dayPlan.day} 
                      onEdit={(l, d) => setEditingLoc({ ...l, day: d })}
                      onDelete={handleDeleteLocation}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              
              <button 
                onClick={() => setEditingLoc({ 
                  id: Math.random().toString(36).substr(2, 9),
                  day: dayPlan.day,
                  name: '',
                  time: '00:00',
                  description: '',
                  lat: 11.9425,
                  lng: 108.4361,
                  type: 'activity'
                })}
                className="w-full p-4 border-2 border-dashed border-black/10 rounded-2xl flex items-center justify-center gap-2 text-black/30 hover:border-black/30 hover:text-black/50 transition-all"
              >
                <Plus size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Add Location</span>
              </button>
            </div>
          </section>
        ))}
      </div>

      {/* Edit Location Modal */}
      <AnimatePresence>
        {editingLoc && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.form 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onSubmit={handleSaveLocation}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black uppercase tracking-tighter">Edit Location</h3>
                <button type="button" onClick={() => setEditingLoc(null)} className="text-black/30 font-bold">Close</button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black uppercase text-black/30 ml-2">Name</label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                    <input 
                      required
                      value={editingLoc.name}
                      onChange={e => setEditingLoc({...editingLoc, name: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ring-black/5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black uppercase text-black/30 ml-2">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                      <input 
                        required
                        value={editingLoc.time}
                        onChange={e => setEditingLoc({...editingLoc, time: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ring-black/5"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black uppercase text-black/30 ml-2">Type</label>
                    <select 
                      value={editingLoc.type}
                      onChange={e => setEditingLoc({...editingLoc, type: e.target.value as any})}
                      className="w-full px-4 py-4 bg-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ring-black/5 appearance-none"
                    >
                      <option value="food">Food</option>
                      <option value="cafe">Cafe</option>
                      <option value="hotel">Hotel</option>
                      <option value="activity">Activity</option>
                      <option value="travel">Travel</option>
                      <option value="party">Party</option>
                      <option value="rest">Rest</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black uppercase text-black/30 ml-2">Description</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-4 text-black/20" size={18} />
                    <textarea 
                      required
                      value={editingLoc.description}
                      onChange={e => setEditingLoc({...editingLoc, description: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ring-black/5 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black uppercase text-black/30 ml-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                    <input 
                      value={editingLoc.address || ''}
                      onChange={e => setEditingLoc({...editingLoc, address: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ring-black/5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black uppercase text-black/30 ml-2">Ghi chú / Hướng dẫn (Guide/Notes)</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-4 text-black/20" size={18} />
                    <textarea 
                      value={editingLoc.guide || ''}
                      onChange={e => setEditingLoc({...editingLoc, guide: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ring-black/5 min-h-[80px]"
                      placeholder="Lên xe khách Phương Trang, báo tới bến xe..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black uppercase text-black/30 ml-2">Lat</label>
                    <input 
                      type="number" step="any"
                      value={editingLoc.lat}
                      onChange={e => setEditingLoc({...editingLoc, lat: parseFloat(e.target.value)})}
                      className="w-full px-4 py-4 bg-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ring-black/5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-black uppercase text-black/30 ml-2">Lng</label>
                    <input 
                      type="number" step="any"
                      value={editingLoc.lng}
                      onChange={e => setEditingLoc({...editingLoc, lng: parseFloat(e.target.value)})}
                      className="w-full px-4 py-4 bg-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ring-black/5"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
              >
                <Save size={20} /> Save Changes
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Day Modal */}
      <AnimatePresence>
        {editingDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleSaveDay}
              className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black uppercase tracking-tighter">Edit Day {editingDay.day}</h3>
                <button type="button" onClick={() => setEditingDay(null)} className="text-black/30 font-bold">Close</button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black uppercase text-black/30 ml-2">Title</label>
                  <input 
                    required
                    value={editingDay.title}
                    onChange={e => setEditingDay({...editingDay, title: e.target.value})}
                    className="w-full px-4 py-4 bg-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ring-black/5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black uppercase text-black/30 ml-2">Date</label>
                  <input 
                    required
                    value={editingDay.date}
                    onChange={e => setEditingDay({...editingDay, date: e.target.value})}
                    className="w-full px-4 py-4 bg-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ring-black/5"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
              >
                <Save size={20} /> Update Day
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
