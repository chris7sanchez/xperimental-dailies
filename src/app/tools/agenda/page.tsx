"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  CalendarDays, 
  Users, 
  Loader2, 
  RefreshCw,
  Save,
  Trash2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { getAgenda, saveAvailability } from "./actions";
import { useToast } from "@/hooks/use-toast";

const DAYS = [
  { key: 'lun', label: 'Lun', full: 'Lunes' },
  { key: 'mar', label: 'Mar', full: 'Martes' },
  { key: 'mie', label: 'Mié', full: 'Miércoles' },
  { key: 'jue', label: 'Jue', full: 'Jueves' },
  { key: 'vie', label: 'Vie', full: 'Viernes' },
  { key: 'sab', label: 'Sáb', full: 'Sábado' },
  { key: 'dom', label: 'Dom', full: 'Domingo' },
];
const START_HOUR = 9;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

const COLORS = ['#d4af37', '#6495ed', '#48d182', '#e87e7e', '#c084fc', '#fb923c', '#67e8f9', '#f472b6'];

export default function AgendaPage() {
  const [userName, setUserName] = useState("");
  const [mySlots, setMySlots] = useState<Set<string>>(new Set());
  const [allData, setAllData] = useState<any>({ participants: {} });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'add' | 'remove' | null>(null);
  
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      const data = await getAgenda();
      setAllData(data || { participants: {} });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedName = localStorage.getItem('xp-agenda-user') || "";
    if (savedName) setUserName(savedName);
    loadData();
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const userKey = userName.toLowerCase().trim().replace(/\s+/g, '-');
    if (userKey && allData?.participants?.[userKey] && !hasChanges) {
      setMySlots(new Set(allData.participants[userKey].slots));
    }
  }, [allData, userName, hasChanges]);

  useEffect(() => {
    const handleMouseUp = () => { setIsDragging(false); setDragMode(null); };
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserName(val);
    localStorage.setItem('xp-agenda-user', val.trim());
    setHasChanges(true);
  };

  const guardName = () => {
    if (userName.trim()) return true;
    inputRef.current?.focus();
    toast({
      variant: "destructive",
      title: "ATENCIÓN",
      description: "Escribe tu nombre antes de seleccionar horas.",
    });
    return false;
  };

  const applyToggle = (slotId: string, forceMode?: 'add' | 'remove') => {
    if (!guardName()) return;
    setMySlots(prev => {
      const next = new Set(prev);
      const mode = forceMode || dragMode;
      if (mode === 'add') next.add(slotId);
      else if (mode === 'remove') next.delete(slotId);
      return next;
    });
    setHasChanges(true);
  };

  const handleMouseDown = (slotId: string) => {
    if (!guardName()) return;
    setIsDragging(true);
    const mode = mySlots.has(slotId) ? 'remove' : 'add';
    setDragMode(mode);
    applyToggle(slotId, mode);
  };

  const handleMouseEnter = (e: React.MouseEvent, slotId: string) => {
    setHoverSlot(slotId);
    if (isDragging && dragMode) {
      applyToggle(slotId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleSave = async () => {
    if (!userName.trim()) return;
    setIsSaving(true);
    try {
      await saveAvailability(userName, Array.from(mySlots));
      setHasChanges(false);
      await loadData(true);
      toast({
        title: "GUARDADO EXITOSO",
        description: "Tu disponibilidad ha sido actualizada.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "ERROR AL GUARDAR",
        description: "No se pudo actualizar tu disponibilidad.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const clearMySlots = () => {
    setMySlots(new Set());
    setHasChanges(true);
  };

  // Compute other participants per slot
  const othersMap: Record<string, { count: number, names: string[] }> = {};
  const userKey = userName.toLowerCase().trim().replace(/\s+/g, '-');
  
  if (allData?.participants) {
    Object.entries(allData.participants).forEach(([key, p]: [string, any]) => {
      if (key === userKey) return;
      p.slots?.forEach((sid: string) => {
        if (!othersMap[sid]) othersMap[sid] = { count: 0, names: [] };
        othersMap[sid].count++;
        othersMap[sid].names.push(p.name);
      });
    });
  }

  // Participants List Merging
  const mergedParticipants = { ...allData?.participants };
  if (userName.trim() && mySlots.size > 0) {
    mergedParticipants[userKey] = { name: userName, slots: Array.from(mySlots) };
  }
  const participantEntries = Object.entries(mergedParticipants || {});

  // Tooltip content
  const getTooltipContent = () => {
    if (!hoverSlot) return null;
    const [dayKey, hourStr] = hoverSlot.split('-');
    const day = DAYS.find(d => d.key === dayKey);
    const hour = parseInt(hourStr, 10);
    
    const names = [];
    if (mySlots.has(hoverSlot)) names.push(`${userName} (tú)`);
    if (othersMap[hoverSlot]) names.push(...othersMap[hoverSlot].names);
    
    if (names.length === 0) return null;

    return (
      <div 
        className="fixed z-50 pointer-events-none bg-zinc-950/95 border border-zinc-800 p-3 rounded-lg shadow-2xl backdrop-blur-xl transition-opacity duration-150"
        style={{ left: mousePos.x + 14, top: mousePos.y + 14 }}
      >
        <div className="text-[10px] uppercase font-black text-zinc-500 mb-1">
          {day?.full} {hour}:00 - {hour + 1}:00
        </div>
        {names.map((n, i) => (
          <div key={i} className="text-xs text-white font-serif italic truncate">{n}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans p-6 md:p-12 selection:bg-zinc-600">
      {/* Header Estilo Xperimental */}
      <header className="max-w-7xl mx-auto mb-16 space-y-4">
        <a href="/hub" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-orange-400 transition-colors mb-2">
          <span aria-hidden="true">←</span> Volver al Hub
        </a>
        <div className="flex items-center gap-3 text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-black">
          <CalendarDays className="w-4 h-4" />
          <span>Agenda & Matchmaking // Xperimental</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-white leading-none">
          Casting & Rehearsal <span className="font-sans font-black not-italic text-zinc-800">SYNC</span>
        </h1>
        <p className="text-zinc-500 max-w-2xl font-medium tracking-wide leading-relaxed">
          Sincroniza tus horarios de ensayo con los demás alumnos. 
          Selecciona tu disponibilidad y encuentra "matches" automáticos.
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Panel Izquierdo: Configuración */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="bg-transparent border-none shadow-none text-zinc-300">
            <CardHeader className="px-0">
              <CardTitle className="text-2xl md:text-3xl font-serif italic text-white flex items-center gap-3">
                <Users className="w-6 h-6 text-zinc-500" />
                Tu Perfil
              </CardTitle>
              <CardDescription className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] font-black mt-2">
                IDENTIFICACIÓN DE ALUMNO
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Nombre Completo</label>
                <Input 
                  ref={inputRef}
                  placeholder="Ej: Christian Sánchez" 
                  value={userName}
                  onChange={handleNameChange}
                  className="bg-zinc-900/40 border-zinc-800 h-12 text-sm placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-600 transition-all rounded-md"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || !userName.trim() || !hasChanges}
                  className="flex-1 bg-zinc-100 hover:bg-white text-black font-black h-12 rounded-full transition-all duration-300 active:scale-[0.98] disabled:bg-zinc-900 disabled:text-zinc-700 shadow-xl shadow-white/5"
                >
                  {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  GUARDAR
                </Button>
                <Button 
                  onClick={clearMySlots} 
                  variant="outline"
                  className="w-12 h-12 rounded-full bg-transparent border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/10 border-zinc-800/40 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
             <CardHeader className="border-b border-zinc-800/40 bg-zinc-900/40 p-4 flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">Participantes Activos</CardTitle>
                </div>
                <Button onClick={() => loadData(true)} variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 hover:text-white hover:bg-transparent">
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-white' : ''}`} />
                </Button>
             </CardHeader>
             <CardContent className="p-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
               {participantEntries.length === 0 ? (
                 <div className="text-center py-8 text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                   Nadie ha marcado horas aún
                 </div>
               ) : (
                 <ul className="space-y-2">
                   {participantEntries.map(([key, p]: [string, any], i) => (
                     <li key={key} className="flex justify-between items-center bg-zinc-900/30 p-2.5 rounded-md border border-zinc-800/20">
                       <div className="flex items-center gap-3 truncate">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                          <span className="text-xs text-zinc-300 font-medium truncate">
                            {p.name} {key === userKey && <span className="text-zinc-600 text-[10px] ml-1">(tú)</span>}
                          </span>
                       </div>
                       <div className="text-[10px] font-black text-zinc-500 tracking-tighter bg-zinc-900 px-2 py-0.5 rounded">
                         {p.slots?.length || 0} h
                       </div>
                     </li>
                   ))}
                 </ul>
               )}
             </CardContent>
          </Card>
        </div>

        {/* Panel Derecho: Cuadrícula */}
        <div className="lg:col-span-8">
           <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-3xl p-4 md:p-8 backdrop-blur-sm shadow-2xl overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Cabeceras de días */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 mb-4">
                   <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-end justify-center pb-2">
                     <Clock className="w-4 h-4 mb-0.5" />
                   </div>
                   {DAYS.map(day => (
                     <div key={day.key} className="text-center pb-2 border-b border-zinc-800/60">
                        <div className="text-xs font-black uppercase text-zinc-300 tracking-widest">{day.label}</div>
                     </div>
                   ))}
                </div>

                {/* Filas de horas */}
                <div className="space-y-2" onMouseLeave={() => setHoverSlot(null)}>
                   {HOURS.map(hour => (
                     <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] gap-2">
                        <div className="flex items-center justify-center text-[10px] font-black text-zinc-600 tabular-nums pr-2 border-r border-zinc-800/30">
                           {String(hour).padStart(2, '0')}:00
                        </div>
                        {DAYS.map(day => {
                          const slotId = `${day.key}-${hour}`;
                          const isMine = mySlots.has(slotId);
                          const others = othersMap[slotId] || { count: 0, names: [] };
                          const total = others.count + (isMine ? 1 : 0);
                          
                          let bgClass = "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-600";
                          if (isMine && others.count > 0) bgClass = "bg-[#48d182]/20 border-[#48d182] text-[#48d182] shadow-[0_0_15px_rgba(72,209,130,0.2)]";
                          else if (isMine) bgClass = "bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]";
                          else if (others.count >= 3) bgClass = "bg-[#6495ed]/60 border-[#6495ed]";
                          else if (others.count === 2) bgClass = "bg-[#6495ed]/40 border-[#6495ed]/60";
                          else if (others.count === 1) bgClass = "bg-[#6495ed]/20 border-[#6495ed]/40 text-[#6495ed]";

                          return (
                            <div 
                              key={slotId}
                              onMouseDown={(e) => { e.preventDefault(); handleMouseDown(slotId); }}
                              onMouseEnter={(e) => handleMouseEnter(e, slotId)}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={() => setHoverSlot(null)}
                              onTouchStart={(e) => { e.preventDefault(); applyToggle(slotId, isMine ? 'remove' : 'add'); }}
                              className={`h-10 md:h-12 rounded-md border transition-all duration-200 cursor-pointer flex items-center justify-center relative select-none ${bgClass}`}
                            >
                               {total > 0 && (
                                 <div className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded bg-black/40 text-[9px] font-black backdrop-blur-sm">
                                   {total}
                                 </div>
                               )}
                            </div>
                          );
                        })}
                     </div>
                   ))}
                </div>
              </div>
           </div>
        </div>
      </div>
      
      {getTooltipContent()}
    </div>
  );
}
