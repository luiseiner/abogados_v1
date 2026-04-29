"use client";

import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Trash2, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FileWithMeta {
  id: string;
  file: File;
  progress: number;
}

export interface FileUploaderRef {
  getFiles: () => File[];
  clearFiles: () => void;
}

export const FileUploader = forwardRef<FileUploaderRef>((_props, ref) => {
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    getFiles: () => files.map(f => f.file), // Retorna solo los archivos nativos
    clearFiles: () => setFiles([])          // Permite limpiar la lista tras subir
  }));

  // Mapeo de colores e iconos según extensión
  const getFileStyle = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return { bg: "bg-red-600/20", text: "text-red-400", label: "pdf" };
      case 'doc':
      case 'docx': return { bg: "bg-blue-600/20", text: "text-blue-400", label: "doc" };
      case 'xls':
      case 'xlsx': return { bg: "bg-emerald-600/20", text: "text-emerald-400", label: "xls" };
      default: return { bg: "bg-gray-600/20", text: "text-gray-400", label: ext || "file" };
    }
  };

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const mappedFiles = Array.from(newFiles).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 100 // Simulando carga completa inmediata
    }));
    
    setFiles(prev => [...prev, ...mappedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Área de Carga */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileChange(e.dataTransfer.files);
        }}
        className={cn(
          "group relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 bg-muted/30 text-center",
          isDragging ? "border-primary bg-primary/10 scale-[1.01]" : "border-border hover:border-primary hover:bg-primary/10"
        )}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300">
          <UploadCloud className="h-6 w-6" />
        </div>
        
        <Label className="block text-sm font-medium text-foreground/80 cursor-pointer group-hover:text-foreground">
          Arrastre y suelte archivos aquí o{" "}
          <span className="text-primary font-semibold underline-offset-4 group-hover:underline">
            haga clic para seleccionar
          </span>
        </Label>
        
        <p className="mt-2 text-xs text-muted-foreground">
          PDF, Word, Excel, imágenes o formatos permitidos
        </p>

        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e.target.files)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>

      {/* Lista de Archivos */}
      {files.length > 0 && (
        <div className="mt-6 space-y-0 divide-y divide-border border-t border-border">
          {files.map((fileMeta) => {
            const style = getFileStyle(fileMeta.file.name);
            return (
              <div key={fileMeta.id} className="flex items-center justify-between py-4 group animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-4">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded border border-white/5 shadow-sm", style.bg, style.text)}>
                    <span className="text-[10px] font-bold uppercase">{style.label}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[200px] md:max-w-xs">
                      {fileMeta.file.name}
                    </span>
                    <span className="text-xs text-muted-foreground italic">
                      {formatSize(fileMeta.file.size)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                    {fileMeta.progress}%
                  </Badge>

                  <button 
                    onClick={() => removeFile(fileMeta.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

FileUploader.displayName = "FileUploader";