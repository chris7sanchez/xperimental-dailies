"use client";

import { useRouter } from "next/navigation";
import { MoveRight, CalendarDays } from "lucide-react";

export default function XperimentalHubPage() {
  const router = useRouter();

  const links = [
    { label: "ESCENAS", path: "/tools/video" },
    { label: "ACTOR.", path: "/tools/actors" },
    { label: "CONVERT", path: "/tools/convert" },
    { label: "TAKE", path: "/tools/feedback" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-900/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-900/20 blur-[150px] rounded-full" />
      </div>

      {/* Main Content Container */}
      <div className="z-10 flex flex-col items-center gap-12 max-w-5xl px-6">
        
        {/* Logo / Header Technical */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="flex items-center justify-center gap-3">
            <span className="w-12 h-[1px] bg-zinc-800" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
                MEDIA PRODUCTION HUB
            </span>
            <span className="w-12 h-[1px] bg-zinc-800" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic text-white/90">
            Servidor de Material Audiovisual
          </h1>
        </div>

        {/* The Interactive Clapperboard Hero */}
        <div className="relative group animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <div className="relative w-full max-w-[600px] drop-shadow-[0_45px_100px_rgba(0,0,0,0.8)]">
            <img 
                src="/img/clapperboard_hub.png" 
                alt="Xperimental Clapperboard" 
                className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
            />

            {/* Link Hotspots over the image labels */}
            {/* ESCENAS Area */}
            <button 
                onClick={() => router.push('/tools/video')}
                className="absolute top-[37%] left-[8%] w-[26%] h-[15%] group/btn cursor-pointer z-20 flex items-center justify-center"
                title="Ir a Escenas"
            >
                <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/5 rounded-sm transition-all duration-300 border border-transparent group-hover/btn:border-white/10" />
                <div className="opacity-0 group-hover/btn:opacity-100 translate-y-2 group-hover/btn:translate-y-0 transition-all duration-300">
                    <MoveRight className="text-orange-600 w-5 h-5 shadow-[0_0_20px_rgba(234,88,12,0.5)]" />
                </div>
            </button>

            {/* ACTOR Area */}
            <button 
                onClick={() => router.push('/tools/actors')}
                className="absolute top-[37%] left-[34%] w-[26%] h-[15%] group/btn cursor-pointer z-20 flex items-center justify-center"
                title="Ver Catálogo de Actores"
            >
                <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/5 rounded-sm transition-all duration-300 border border-transparent group-hover/btn:border-white/10" />
                <div className="opacity-0 group-hover/btn:opacity-100 translate-y-2 group-hover/btn:translate-y-0 transition-all duration-300">
                    <MoveRight className="text-orange-600 w-5 h-5 shadow-[0_0_20px_rgba(234,88,12,0.5)]" />
                </div>
            </button>

            {/* TAKE Area */}
            <button 
                onClick={() => router.push('/tools/feedback')}
                className="absolute top-[37%] left-[60%] w-[26%] h-[15%] group/btn cursor-pointer z-20 flex items-center justify-center"
                title="Registro de Tomas & Feedback"
            >
                <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/5 rounded-sm transition-all duration-300 border border-transparent group-hover/btn:border-white/10" />
                <div className="opacity-0 group-hover/btn:opacity-100 translate-y-2 group-hover/btn:translate-y-0 transition-all duration-300">
                    <MoveRight className="text-orange-600 w-5 h-5 shadow-[0_0_20px_rgba(234,88,12,0.5)]" />
                </div>
            </button>
          </div>

          {/* REC Status Pulsing Indicator */}
          <div className="absolute top-10 right-10 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
            <span className="text-[10px] font-black tracking-widest text-red-600/80">REC</span>
          </div>
        </div>

        {/* Accesos rápidos (no impresos en la claqueta) */}
        <div className="flex flex-wrap items-center justify-center gap-3 -mt-6 animate-in fade-in duration-1000 delay-500">
            <button
                onClick={() => router.push('/tools/agenda')}
                className="group/agenda flex items-center gap-2 px-5 py-2.5 rounded-full border border-orange-600/30 bg-orange-600/5 hover:bg-orange-600/10 hover:border-orange-600/60 transition-all duration-300"
                title="Abrir tu Agenda"
            >
                <CalendarDays className="w-4 h-4 text-orange-600" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-200/90">Agenda</span>
            </button>
            <button
                onClick={() => router.push('/tools/convert')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-800 hover:border-zinc-600 hover:bg-white/5 transition-all duration-300"
                title="Convertir material"
            >
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Convert</span>
            </button>
        </div>

        {/* Footer info text */}
        <div className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mt-16 animate-in fade-in duration-1000 delay-700">
            XPERIMENTAL ACTING STUDIO // CENTRAL SERVER // ACTIVE CONNECT
        </div>
      </div>
    </div>
  );
}
