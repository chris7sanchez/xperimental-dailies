"use client";

import { useState } from "react";
import { Search, Instagram, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";
import ACTORS from "@/data/actors.json";

const CATEGORIES = ["Todos", "Interpretación", "Teatro Musical", "Cine y TV", "Voz", "Teatro"];

export default function ActorsDirectoryPage() {
  const [activeTab, setActiveTab] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredActors = ACTORS.filter(actor => {
    const matchesTab = activeTab === "Todos" || actor.category === activeTab;
    const matchesSearch = actor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-white selection:text-black">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 flex items-center justify-center rounded-sm">
                <div className="w-5 h-3 border-2 border-black rounded-sm relative">
                    <div className="absolute top-[-3px] left-1 w-1 h-3 bg-black transform -rotate-12" />
                </div>
            </div>
            <span className="font-black uppercase tracking-tighter text-sm">ESCUELA DE CINE</span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            {["Actores", "Cursos", "Producciones", "Contacto"].map(item => (
                <a key={item} href="#" className={`hover:text-white transition-colors ${item === "Actores" ? "text-orange-500" : ""}`}>
                    {item}
                </a>
            ))}
        </div>

        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
            <input 
                type="text" 
                placeholder="Buscar talento..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-zinc-900/50 border border-white/5 rounded-full py-2 pl-10 pr-4 text-[11px] outline-none focus:border-white/20 transition-all w-48 md:w-64"
            />
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto py-24 px-6 text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-white leading-none">
          Perfiles de Actores
        </h1>
        <p className="text-zinc-500 max-w-2xl mx-auto font-medium tracking-wide text-sm md:text-base leading-relaxed">
          Descubre a la próxima generación de artistas. Un catálogo exclusivo de los talentos emergentes formados en nuestras aulas.
        </p>
      </header>

      {/* Tabs / Filters */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-16 border-b border-white/5 mx-auto max-w-fit px-4 pb-1">
        {CATEGORIES.map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] font-black uppercase tracking-widest pb-3 transition-all relative ${
                    activeTab === tab ? "text-orange-500" : "text-zinc-600 hover:text-zinc-300"
                }`}
            >
                {tab}
                {activeTab === tab && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                )}
            </button>
        ))}
      </div>

      {/* Main Grid: Actor Cards */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {filteredActors.map((actor, index) => (
            <div 
                key={actor.id} 
                className="group flex flex-col bg-zinc-900/10 border border-white/5 rounded-sm overflow-hidden hover:border-white/20 transition-all duration-700 animate-in fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <div className="aspect-[4/5] bg-[#1a1a1c] relative overflow-hidden flex items-center justify-center">
                    {actor.image ? (
                        <div className="w-full h-full relative group">
                            <Image 
                              src={actor.image} 
                              alt={actor.name} 
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 ease-in-out" 
                            />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                            <span className="text-6xl font-serif italic text-white/10">{actor.name.charAt(0)}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-6 bg-[#0c0c0e] group-hover:bg-zinc-900 transition-colors duration-500">
                    <h3 className="text-xl md:text-2xl font-serif italic text-white leading-tight mb-2 uppercase">{actor.name}</h3>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 group-hover:text-orange-500">{actor.category}</div>
                </div>
            </div>
          ))}
        </div>
      </main>

      {/* Director Profile Section */}
      <section className="bg-zinc-900/30 border-t border-b border-white/5 py-32 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="relative group flex-shrink-0">
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-orange-600/20 group-hover:border-orange-600 transition-all duration-700 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <Image 
                      src="/images/actors/christian.jpg" 
                      alt="Christian Sánchez" 
                      fill
                      sizes="256px"
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                    />
                </div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-orange-600 flex items-center justify-center rounded-full text-black font-black text-xs">
                    CS
                </div>
            </div>

            <div className="space-y-6 text-center md:text-left">
                <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-serif italic text-white">CHRISTIAN SÁNCHEZ</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600">DIRECTOR DE CASTING Y DOCENTE</p>
                </div>
                <p className="text-zinc-400 text-sm md:text-lg leading-relaxed font-medium">
                    Con más de 15 años de experiencia en la industria cinematográfica europea, Christian lidera el departamento de talento en Xperimental Acting Studio, enfocándose en la técnica interpretativa y el desarrollo de la voz orgánica.
                </p>
                <div className="flex justify-center md:justify-start pt-4">
                    <span className="px-6 py-2 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        FUNDADOR DE XPERIMENTAL STUDIO
                    </span>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-black">
        <div className="space-y-2 text-center md:text-left">
          <span className="font-black uppercase tracking-tighter text-sm block">ESCUELA DE CINE</span>
          <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">
            © 2024 Escuela de Cine Profesional. Todos los derechos reservados.
          </p>
        </div>

        <div className="flex items-center gap-6 text-zinc-600">
            <a href="#" className="hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-all"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-all"><Linkedin className="w-5 h-5" /></a>
        </div>
      </footer>
    </div>
  );
}
