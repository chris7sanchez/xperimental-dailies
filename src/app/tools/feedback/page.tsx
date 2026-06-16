"use client";

import { MessageSquare, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center p-12 text-center">
      <div className="p-8 bg-zinc-900/40 rounded-[40px] border border-zinc-800 backdrop-blur-3xl animate-in zoom-in-95 duration-700">
        <MessageSquare className="w-20 h-20 text-zinc-500 mx-auto mb-8" />
        <h1 className="text-4xl font-serif italic mb-4">Feedback & Registro</h1>
        <p className="text-zinc-600 uppercase tracking-widest text-[10px] font-black mb-12">PRODUCTION LOGS SYNC // PENDING INTEGRATION</p>
        
        <button 
          onClick={() => router.push('/hub')}
          className="inline-flex items-center gap-2 text-xs font-black uppercase text-white hover:text-zinc-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Hub
        </button>
      </div>
    </div>
  );
}
