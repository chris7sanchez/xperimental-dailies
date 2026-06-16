"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CalendarDays, Users, Loader2, RefreshCw, Save, Trash2, Clock, Pencil, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAgenda, saveAvailability, deleteAvailability, verifyPin } from "./actions";
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
const keyFor = (n) => n.toLowerCase().trim().replace(/\s+/g, '-');

export default function AgendaPage() {
  const [userName, setUserName] = useState("");
  const [pin, setPin] = useState("");
  const [mySlots, setMySlots] = useState(new Set());
  const [allData, setAllData] = useState({ participants: {} });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const [hoverSlot, setHoverSlot] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { toast } = useToast();
  const inputRef = useRef(null);
  const touchActiveRef = useRef(false);

  const myKey = keyFor(userName);
  const myRecord = allData?.participants?.[myKey];
  const exists = !!myRecord;
  const canEditGrid = editing || !exists;

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      const data = await getAgenda();
      setAllData(data || { participants: {} });
      setLastSync(new Date());
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    const savedName = localStorage.getItem('xp-agenda-user') || "";
    if (savedName) setUserName(savedName);
    loadData();
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // En modo lectura, refleja siempre tus horas guardadas (y cambios de otros dispositivos)
  useEffect(() => {
    if (!editing && myRecord) {
      setMySlots(new Set(myRecord.slots || []));
    } else if (!editing && !myRecord) {
      setMySlots(new Set());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allData, userName, editing]);

  useEffect(() => {
    const end = () => { setIsDragging(false); setDragMode(null); setTimeout(() => { touchActiveRef.current = false; }, 500); };
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);
    return () => { document.removeEventListener('mouseup', end); document.removeEventListener('touchend', end); };
  }, []);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setUserName(val);
    localStorage.setItem('xp-agenda-user', val.trim());
    setEditing(false);
  };

  const guardName = () => {
    if (userName.trim()) return true;
    inputRef.current?.focus();
    toast({ variant: "destructive", title: "ATENCIÓN", description: "Escribe tu nombre primero." });
    return false;
  };

  const lockedHint = () => toast({ title: "MODO LECTURA", description: "Pulsa EDITAR (con tu PIN) para cambiar tus horas." });

  const applyToggle = (slotId, forceMode) => {
    setMySlots(prev => {
      const next = new Set(prev);
      const mode = forceMode || dragMode;
      if (mode === 'add') next.add(slotId);
      else if (mode === 'remove') next.delete(slotId);
      return next;
    });
  };

  const handleMouseDown = (slotId) => {
    if (!canEditGrid) { lockedHint(); return; }
    if (!guardName()) return;
    setIsDragging(true);
    const mode = mySlots.has(slotId) ? 'remove' : 'add';
    setDragMode(mode);
    applyToggle(slotId, mode);
  };

  const handleMouseEnter = (e, slotId) => {
    setHoverSlot(slotId);
    if (isDragging && dragMode && canEditGrid) applyToggle(slotId);
  };
  const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });

  const handleSaveCreate = async () => {
    if (!guardName()) return;
    if (pin.length !== 4) { toast({ variant: "destructive", title: "PIN REQUERIDO", description: "Crea un PIN de 4 cifras." }); return; }
    if (mySlots.size === 0) { toast({ variant: "destructive", title: "SIN HORAS", description: "Marca al menos una hora antes de guardar." }); return; }
    setIsSaving(true);
    try {
      const res = await saveAvailability(userName, pin, Array.from(mySlots));
      if (res?.error) toast({ variant: "destructive", title: "NO SE GUARDÓ", description: res.error });
      else { setPin(""); setEditing(false); await loadData(true); toast({ title: "GUARDADO", description: "Tus horas se han guardado. Usa tu PIN para editarlas o borrarlas." }); }
    } finally { setIsSaving(false); }
  };

  const handleEdit = async () => {
    const p = typeof window !== "undefined" ? window.prompt("Introduce tu PIN de 4 cifras para EDITAR tus horas") : null;
    if (p === null) return;
    if (!/^\d{4}$/.test(p)) { toast({ variant: "destructive", title: "PIN INVÁLIDO", description: "El PIN son 4 cifras." }); return; }
    setIsSaving(true);
    try {
      const res = await verifyPin(userName, p);
      if (!res?.ok) { toast({ variant: "destructive", title: "PIN INCORRECTO", description: "No coincide con el guardado." }); return; }
      setPin(p);
      setMySlots(new Set(myRecord?.slots || []));
      setEditing(true);
      toast({ title: "MODO EDICIÓN", description: "Toca para añadir o quitar horas y guarda los cambios." });
    } finally { setIsSaving(false); }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const empty = mySlots.size === 0;
      const res = await saveAvailability(userName, pin, Array.from(mySlots));
      if (res?.error) toast({ variant: "destructive", title: "NO SE GUARDÓ", description: res.error });
      else {
        setEditing(false);
        await loadData(true);
        toast({ title: empty ? "TE HAS ELIMINADO" : "CAMBIOS GUARDADOS", description: empty ? "Como te quedaste sin horas, se borró tu registro." : "Tus horas se han actualizado." });
      }
    } finally { setIsSaving(false); }
  };

  const handleCancelEdit = () => { setEditing(false); setMySlots(new Set(myRecord?.slots || [])); };

  const handleDelete = async () => {
    const p = typeof window !== "undefined" ? window.prompt("Introduce tu PIN de 4 cifras para BORRAR todas tus horas") : null;
    if (p === null) return;
    if (!/^\d{4}$/.test(p)) { toast({ variant: "destructive", title: "PIN INVÁLIDO", description: "El PIN son 4 cifras." }); return; }
    setIsSaving(true);
    try {
      const res = await deleteAvailability(userName, p);
      if (res?.error) toast({ variant: "destructive", title: "NO SE PUDO BORRAR", description: res.error });
      else { setEditing(false); setMySlots(new Set()); await loadData(true); toast({ title: "BORRADO", description: "Tus horas se han eliminado." }); }
    } finally { setIsSaving(false); }
  };

  const othersMap = {};
  if (allData?.participants) {
    Object.entries(allData.participants).forEach(([key, p]) => {
      if (key === myKey) return;
      p.slots?.forEach((sid) => {
        if (!othersMap[sid]) othersMap[sid] = { count: 0, names: [] };
        othersMap[sid].count++;
        othersMap[sid].names.push(p.name);
      });
    });
  }

  const mergedParticipants = { ...allData?.participants };
  if (userName.trim() && mySlots.size > 0) {
    mergedParticipants[myKey] = { name: userName, slots: Array.from(mySlots) };
  } else if (userName.trim() && mySlots.size === 0) {
    delete mergedParticipants[myKey];
  }
  const participantEntries = Object.entries(mergedParticipants || {});

  const getTooltipContent = () => {
    if (!hoverSlot) return null;
    const [dayKey, hourStr] = hoverSlot.split('-');
    const day = DAYS.find(d => d.key === dayKey);
    const hour = parseInt(hourStr, 10);
    const names = [];
    if (mySlots.has(hoverSlot)) names.push(`${userName || 'Tú'} (tú)`);
    if (othersMap[hoverSlot]) names.push(...othersMap[hoverSlot].names);
    if (names.length === 0) return null;
    return (
      <div className="fixed z-50 pointer-events-none bg-zinc-950/95 border border-zinc-800 p-3 rounded-lg shadow-2xl backdrop-blur-xl"
        style={{ left: mousePos.x + 14, top: mousePos.y + 14 }}>
        <div className="text-[10px] uppercase font-black text-zinc-500 mb-1">{day?.full} {hour}:00 - {hour + 1}:00</div>
        {names.map((n, i) => (<div key={i} className="text-xs text-white font-serif italic truncate">{n}</div>))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans p-6 md:p-12 selection:bg-zinc-600">
      <header className="max-w-7xl mx-auto mb-12 space-y-4">
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
          Sincroniza tus horarios de ensayo con los demás alumnos. Marca tu disponibilidad y guarda con un PIN; podrás editarla o borrarla cuando quieras.
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <Card className="bg-transparent border-none shadow-none text-zinc-300">
            <CardHeader className="px-0">
              <CardTitle className="text-2xl md:text-3xl font-serif italic text-white flex items-center gap-3">
                <Users className="w-6 h-6 text-zinc-500" /> Tu Perfil
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

              {!exists && (
                <>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Crea tu PIN (4 cifras)</label>
                    <Input
                      type="password" inputMode="numeric" maxLength={4} placeholder="••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                      className="bg-zinc-900/40 border-zinc-800 h-12 text-sm tracking-[0.5em] placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-600 transition-all rounded-md"
                    />
                    <p className="text-[9px] text-zinc-600 leading-relaxed">Marca tus horas en la cuadrícula y pulsa Guardar. El PIN te servirá para editarlas o borrarlas (sin cuenta).</p>
                  </div>
                  <Button onClick={handleSaveCreate} disabled={isSaving || !userName.trim() || pin.length !== 4 || mySlots.size === 0}
                    className="w-full bg-zinc-100 hover:bg-white text-black font-black h-12 rounded-full transition-all duration-300 active:scale-[0.98] disabled:bg-zinc-900 disabled:text-zinc-700 shadow-xl shadow-white/5">
                    {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} GUARDAR HORAS
                  </Button>
                </>
              )}

              {exists && !editing && (
                <div className="space-y-4">
                  <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">Tienes guardadas</div>
                    <div className="text-3xl font-serif italic text-[#d4af37]">{myRecord.slots?.length || 0} horas</div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleEdit} disabled={isSaving}
                      className="flex-1 bg-zinc-100 hover:bg-white text-black font-black h-12 rounded-full active:scale-[0.98] shadow-xl shadow-white/5">
                      <Pencil className="mr-2 h-4 w-4" /> EDITAR
                    </Button>
                    <Button onClick={handleDelete} disabled={isSaving} variant="outline"
                      className="h-12 px-5 rounded-full bg-transparent border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/50 font-black">
                      <Trash2 className="mr-2 h-4 w-4" /> BORRAR
                    </Button>
                  </div>
                  <p className="text-[9px] text-zinc-600 leading-relaxed">Te pedirá tu PIN. La cuadrícula está en modo lectura hasta que pulses Editar.</p>
                </div>
              )}

              {exists && editing && (
                <div className="space-y-3">
                  <div className="text-[10px] uppercase tracking-widest text-[#d4af37] font-black animate-pulse">● Editando — toca para añadir / quitar</div>
                  <div className="flex gap-3">
                    <Button onClick={handleSaveEdit} disabled={isSaving}
                      className="flex-1 bg-zinc-100 hover:bg-white text-black font-black h-12 rounded-full active:scale-[0.98] shadow-xl shadow-white/5">
                      {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />} GUARDAR CAMBIOS
                    </Button>
                    <Button onClick={handleCancelEdit} disabled={isSaving} variant="outline"
                      className="h-12 px-5 rounded-full bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 font-black">
                      <X className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                  </div>
                  <p className="text-[9px] text-zinc-600 leading-relaxed">Si te quedas sin horas y guardas, se elimina tu registro.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/10 border-zinc-800/40 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/40 bg-zinc-900/40 p-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">Participantes Activos</CardTitle>
                {lastSync && <div className="text-[8px] text-zinc-600 uppercase tracking-widest mt-1">Actualizado {lastSync.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>}
              </div>
              <Button onClick={() => loadData(true)} variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 hover:text-white hover:bg-transparent">
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-white' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent className="p-4 max-h-[400px] overflow-y-auto">
              {participantEntries.length === 0 ? (
                <div className="text-center py-8 text-[10px] text-zinc-600 font-black uppercase tracking-widest">Nadie ha marcado horas aún</div>
              ) : (
                <ul className="space-y-2">
                  {participantEntries.map(([key, p], i) => (
                    <li key={key} className="flex justify-between items-center bg-zinc-900/30 p-2.5 rounded-md border border-zinc-800/20">
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                        <span className="text-xs text-zinc-300 font-medium truncate">
                          {p.name} {key === myKey && <span className="text-zinc-600 text-[10px] ml-1">(tú)</span>}
                        </span>
                      </div>
                      <div className="text-[10px] font-black text-zinc-500 tracking-tighter bg-zinc-900 px-2 py-0.5 rounded">{p.slots?.length || 0} h</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-3xl p-4 md:p-8 backdrop-blur-sm shadow-2xl overflow-x-auto">
            {!canEditGrid && (
              <div className="mb-4 text-[10px] uppercase tracking-widest text-zinc-500 font-black flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-600"></span> Modo lectura — pulsa EDITAR para cambiar tus horas
              </div>
            )}
            <div className="min-w-[600px]">
              <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 mb-4">
                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-end justify-center pb-2"><Clock className="w-4 h-4 mb-0.5" /></div>
                {DAYS.map(day => (
                  <div key={day.key} className="text-center pb-2 border-b border-zinc-800/60">
                    <div className="text-xs font-black uppercase text-zinc-300 tracking-widest">{day.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2" onMouseLeave={() => setHoverSlot(null)}>
                {HOURS.map(hour => (
                  <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] gap-2">
                    <div className="flex items-center justify-center text-[10px] font-black text-zinc-600 tabular-nums pr-2 border-r border-zinc-800/30">{String(hour).padStart(2, '0')}:00</div>
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
                          data-slot={slotId}
                          style={{ touchAction: 'manipulation' }}
                          onMouseDown={(e) => { if (touchActiveRef.current) return; e.preventDefault(); handleMouseDown(slotId); }}
                          onMouseEnter={(e) => { if (touchActiveRef.current) return; handleMouseEnter(e, slotId); }}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={() => setHoverSlot(null)}
                          onTouchStart={() => {
                            touchActiveRef.current = true;
                            if (!canEditGrid) { lockedHint(); return; }
                            if (!guardName()) return;
                            const mine = mySlots.has(slotId);
                            setIsDragging(true);
                            setDragMode(mine ? 'remove' : 'add');
                            applyToggle(slotId, mine ? 'remove' : 'add');
                          }}
                          onTouchMove={(e) => {
                            if (!canEditGrid) return;
                            const t = e.touches[0];
                            if (!t || !dragMode) return;
                            const el = document.elementFromPoint(t.clientX, t.clientY);
                            const sid = el?.dataset?.slot;
                            if (sid) applyToggle(sid, dragMode);
                          }}
                          className={`h-10 md:h-12 rounded-md border transition-all duration-200 ${canEditGrid ? 'cursor-pointer' : 'cursor-default'} flex items-center justify-center relative select-none ${bgClass}`}
                        >
                          {total > 0 && (
                            <div className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded bg-black/40 text-[9px] font-black backdrop-blur-sm">{total}</div>
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
