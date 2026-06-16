"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileVideo, CheckCircle2, AlertCircle, Sparkles, MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VideoConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);
    setProgress(0);
    setResultUrl(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Mock progress since we're simulation for now, or use real tracking if API supports it
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 2 : prev));
      }, 500);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      
      if (!response.ok) throw new Error('Error en el servidor');

      const result = await response.json();
      setProgress(100);
      setResultUrl(result.url);
    } catch (error) {
      console.error('Error al procesar el video:', error);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Header / Nav */}
      <div className="absolute top-8 left-8">
        <Button 
            variant="ghost" 
            onClick={() => router.push('/hub')}
            className="text-zinc-500 hover:text-white flex items-center gap-2 uppercase text-[10px] font-black tracking-widest"
        >
            <MoveLeft className="w-4 h-4" /> Volver al Hub
        </Button>
      </div>

      <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-700">
        <Card className="p-10 shadow-[0_50px_100px_rgba(0,0,0,0.9)] border border-white/5 bg-[#0a0a0b] rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 animate-pulse" />
          
          <div className="text-center mb-10">
            <div className="bg-orange-600/10 border border-orange-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,88,12,0.15)]">
              <Sparkles className="text-orange-600 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-serif italic text-white/90">Video Converter Pro</h1>
            <p className="text-zinc-500 mt-2 font-black uppercase text-[10px] tracking-[0.3em]">
                BRAW // MOV // AVI // MKV ⮕ MP4
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">
                SELECCIONA MATERIAL ORIGINAL
              </Label>

              <div className="relative group">
                <input 
                    type="file" 
                    onChange={handleUpload}
                    disabled={uploading}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    accept="video/*"
                />
                <div className={`
                  flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-all duration-500
                  ${uploading ? 'bg-zinc-900/10 border-zinc-800' : 'hover:border-orange-600/40 hover:bg-orange-600/5 border-zinc-900 bg-zinc-900/20'}
                `}>
                  <Upload className={`w-10 h-10 mb-4 transition-transform duration-500 group-hover:-translate-y-1 ${uploading ? 'text-zinc-700 animate-pulse' : 'text-zinc-500'}`} />
                  <span className="text-zinc-400 font-bold text-sm uppercase tracking-widest">
                    {uploading ? 'PROCESANDO...' : 'Subir Archivo'}
                  </span>
                </div>
              </div>
            </div>

            {file && (
              <div className="p-6 bg-zinc-900/30 rounded-xl border border-white/5 space-y-4 animate-in slide-in-from-bottom-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center text-orange-600">
                        <FileVideo className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-300 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.3)]">{progress}%</span>
                </div>
                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-orange-600 transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
              </div>
            )}

            {resultUrl && (
              <Button 
                onClick={() => window.open(resultUrl, '_blank')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-black rounded-lg py-8 text-xs font-black uppercase tracking-[0.3em] transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_0_50px_rgba(234,88,12,0.2)]"
              >
                <CheckCircle2 className="mr-2 w-5 h-5" />
                Descargar MP4 Optimizado
              </Button>
            )}
          </div>
        </Card>

        <div className="mt-10 flex justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
            <AlertCircle className="w-3 h-3" />
            <span>Server-side Processing</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" />
            <span>Xperimental Lab</span>
          </div>
        </div>
      </div>
    </div>
  );
}
