"use client";

import { useState, useEffect } from "react";
import { 
  FileVideo, 
  Settings2, 
  Search, 
  Plus, 
  Loader2, 
  RefreshCw, 
  FolderPlus, 
  Download,
  Film,
  Clock,
  HardDrive
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  getVideos, 
  processVideoAction, 
  getPublicVideos 
} from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function VideoProcessorPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [publicFiles, setPublicFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Settings
  const [preset, setPreset] = useState<'high' | 'medium' | 'low'>('medium');
  const [suffix, setSuffix] = useState('_v2');
  const [situation, setSituation] = useState('');
  const [tags, setTags] = useState('');
  const [targetFolder, setTargetFolder] = useState('videos/processed');

  const { toast } = useToast();

  const loadVideos = async () => {
    const data = await getVideos();
    setVideos(data);
  };

  const loadPublicVideos = async () => {
    const files = await getPublicVideos();
    setPublicFiles(files || []);
  };

  useEffect(() => {
    loadVideos();
    loadPublicVideos();
  }, []);

  const handleProcess = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    toast({
      title: "PRODUCCIÓN EN CURSO",
      description: `Iniciando procesado de ${selectedFiles.length} tomas...`,
    });

    let successCount = 0;
    try {
      for (const fileName of selectedFiles) {
        const result = await processVideoAction(
          fileName,
          preset,
          suffix,
          situation,
          tags.split(',').map(t => t.trim()).filter(t => t),
          targetFolder
        );
        if (result) successCount++;
      }

      toast({
        title: "PRODUCCIÓN COMPLETADA",
        description: `Se han procesado ${successCount} de ${selectedFiles.length} vídeos.`,
      });
      setSelectedFiles([]);
      loadVideos();
      loadPublicVideos();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "ERROR DE PRODUCCIÓN",
        description: "Hubo un fallo en el procesado del lote.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseActors = (fileName: string) => {
    const match = fileName.match(/_([A-Z]+:[A-Z]+)/i);
    if (match) {
        return match[1].split(':').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' & ');
    }
    return null;
  };

  const filteredVideos = videos.filter(v => 
    v.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans p-6 md:p-12 selection:bg-zinc-600">
      {/* Header Estilo Xperimental */}
      <header className="max-w-7xl mx-auto mb-16 space-y-4">
        <div className="flex items-center gap-3 text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-black">
          <Film className="w-4 h-4" />
          <span>Digital Media Server // Xperimental</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-white leading-none">
          Media Production <span className="font-sans font-black not-italic text-zinc-800">HUB</span>
        </h1>
        <p className="text-zinc-500 max-w-2xl font-medium tracking-wide leading-relaxed">
          Distribución y procesado técnico de dailies para Xperimental Acting Studio. 
          Gestión de tomas comprimidas para revisiones académicas.
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Panel Izquierdo: Configuración */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="bg-transparent border-none shadow-none text-zinc-300">
            <CardHeader className="px-0">
              <CardTitle className="text-2xl md:text-3xl font-serif italic text-white flex items-center gap-3">
                <FolderPlus className="w-6 h-6 text-zinc-500" />
                Nueva sesión dailies
              </CardTitle>
              <CardDescription className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] font-black mt-2">
                CONFIGURACIÓN TÉCNICA
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-10">
              {/* Selección de Archivos */}
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                  <span className="text-xs font-black uppercase text-zinc-500 tracking-widest">Archivos en Bruto</span>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedFiles(publicFiles)}
                      className="text-[10px] font-black uppercase transition-colors hover:text-white"
                    >
                      Todos
                    </button>
                    <button 
                      onClick={() => setSelectedFiles([])}
                      className="text-[10px] font-black uppercase text-zinc-700 transition-colors hover:text-white"
                    >
                      Limpiar
                    </button>
                    <button onClick={loadPublicVideos} className="text-zinc-700 hover:text-white transition-colors">
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                  {publicFiles.map((name) => (
                    <div 
                      key={name}
                      className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                        selectedFiles.includes(name) 
                          ? 'bg-zinc-900 border-zinc-700 shadow-xl' 
                          : 'bg-transparent border-transparent hover:bg-zinc-900/40 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Checkbox 
                          id={`v-${name}`}
                          checked={selectedFiles.includes(name)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedFiles([...selectedFiles, name]);
                            else setSelectedFiles(selectedFiles.filter(f => f !== name));
                          }}
                          className="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                        <div className="flex flex-col truncate">
                          <label htmlFor={`v-${name}`} className="text-xs font-bold truncate cursor-pointer select-none tracking-tight">
                            {name}
                          </label>
                          <span className="text-[10px] text-zinc-600 italic font-serif opacity-80 group-hover:opacity-100 transition-opacity">
                            {parseActors(name) || 'E.F.C. Archive'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] border-zinc-800 text-zinc-700 px-1 py-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        RAW
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ajustes Técnicos */}
              <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm shadow-inner">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Calidad</label>
                    <Select value={preset} onValueChange={(v: any) => setPreset(v)}>
                      <SelectTrigger className="bg-transparent border-zinc-800 h-10 text-xs focus:ring-1 focus:ring-zinc-600 transition-all rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                        <SelectItem value="high">CINEMA (Original)</SelectItem>
                        <SelectItem value="medium">PREVIEW (720p)</SelectItem>
                        <SelectItem value="low">PROXY (480p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Contexto</label>
                    <Input 
                      placeholder="Ej: Escena Época" 
                      value={situation}
                      onChange={e => setSituation(e.target.value)}
                      className="bg-transparent border-zinc-800 h-10 text-xs placeholder:text-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-600 transition-all rounded-md"
                    />
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Sufijo</label>
                    <Input 
                      placeholder="_edit" 
                      value={suffix}
                      onChange={e => setSuffix(e.target.value)}
                      className="bg-transparent border-zinc-800 h-10 text-xs placeholder:text-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-600 transition-all rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Tags</label>
                    <Input 
                      placeholder="drama, reel" 
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      className="bg-transparent border-zinc-800 h-10 text-xs placeholder:text-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-600 transition-all rounded-md"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleProcess} 
                disabled={isProcessing || selectedFiles.length === 0}
                className="w-full bg-zinc-100 hover:bg-white text-black font-black h-12 rounded-full transition-all duration-300 active:scale-[0.98] disabled:bg-zinc-900 disabled:text-zinc-700 shadow-xl shadow-white/5"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  <Settings2 className="mr-2 h-4 w-4" />
                )}
                PROCESAR LOTE ({selectedFiles.length})
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Panel Derecho: Catálogo */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif italic text-white flex items-center gap-3">
                <HardDrive className="w-6 h-6 text-zinc-500" />
                Dailies Catalog
              </h2>
              <p className="text-zinc-700 uppercase tracking-[0.2em] text-[10px] font-black mt-2">MATERIAL DISPONIBLE</p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
              <input 
                placeholder="BUSCAR TOMA..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-b border-zinc-800 focus:border-white outline-none text-[10px] font-black tracking-widest uppercase text-white transition-all duration-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredVideos.length > 0 ? filteredVideos.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((video) => (
              <Card key={video.id} className="bg-zinc-900/20 border-zinc-800/40 hover:border-zinc-500 transition-all duration-500 group overflow-hidden shadow-2xl backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="aspect-video bg-zinc-950 relative flex items-center justify-center overflow-hidden">
                    <video className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-in-out">
                        <source src={video.path} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-5 left-5 right-5">
                        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                           <Clock className="w-3 h-3 text-zinc-700" />
                           {new Date(video.date).toLocaleDateString([], { month: 'short', day: 'numeric'})} // {new Date(video.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="text-xl md:text-2xl font-serif italic text-white leading-none tracking-tight">
                            {parseActors(video.originalName) || video.situation || "Production Take"}
                        </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start gap-4">
                       <div className="space-y-1.5 flex-1 truncate">
                          <label className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em] block">Technical Metadata</label>
                          <div className="text-[10px] font-medium text-zinc-500 truncate tabular-nums">
                              {video.processedName}
                          </div>
                       </div>
                       <div className="text-[10px] font-black text-zinc-400 bg-zinc-800 px-2 py-1 rounded tracking-tighter shadow-lg">
                          {(video.size / 1024 / 1024).toFixed(1)} <span className="text-zinc-600">MB</span>
                       </div>
                    </div>

                    <div className="flex gap-3">
                        <a 
                          href={video.path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 rounded-md text-[10px] font-black uppercase transition-all duration-300 border border-zinc-800"
                        >
                          Review
                        </a>
                        <a 
                          href={video.path} 
                          download={video.processedName}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-md text-[10px] font-black uppercase transition-all duration-300 shadow-xl shadow-white/5 active:scale-95"
                        >
                          Dailies <Download className="w-3 h-3 ml-1" />
                        </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full h-80 flex flex-col items-center justify-center border border-zinc-900 bg-zinc-900/5 rounded-[40px] opacity-30 group hover:opacity-100 transition-opacity duration-700">
                <div className="p-6 bg-zinc-900 rounded-full mb-6 shadow-inner">
                  <Film className="w-10 h-10 text-zinc-700" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600">No Material Recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
