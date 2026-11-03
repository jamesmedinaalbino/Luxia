import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, Tag, Eye, X } from 'lucide-react';
import { PhotoEvidence } from '../types';

interface PhotoUploaderProps {
  photos: PhotoEvidence[];
  onChange: (photos: PhotoEvidence[]) => void;
  maxPhotos?: number;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  onChange,
  maxPhotos = 8,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEvidence | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Compress image to reasonable resolution for snappy performance and PDF embedding
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    try {
      const newItems: PhotoEvidence[] = [];
      for (let i = 0; i < files.length; i++) {
        if (photos.length + newItems.length >= maxPhotos) break;
        const file = files[i];
        const compressedBase64 = await compressImage(file);
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        newItems.push({
          id: `pht-${Date.now()}-${i}`,
          url: compressedBase64,
          caption: 'Evidencia en sitio de instalación',
          category: 'durante',
          timestamp,
        });
      }
      onChange([...photos, ...newItems]);
    } catch (err) {
      console.error('Error compressing image', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const removePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null);
    }
  };

  const updateCaption = (id: string, caption: string) => {
    onChange(
      photos.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  const updateCategory = (id: string, category: PhotoEvidence['category']) => {
    onChange(
      photos.map((p) => (p.id === id ? { ...p, category } : p))
    );
  };

  return (
    <div className="space-y-3">
      {/* Hidden file inputs: one for generic file/gallery, one directly triggering mobile camera */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Buttons to capture or upload */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={photos.length >= maxPhotos || isProcessing}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Camera className="w-4 h-4" />
          <span>Tomar Foto (Cámara)</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={photos.length >= maxPhotos || isProcessing}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          <span>Galería / Archivos</span>
        </button>
      </div>

      {isProcessing && (
        <div className="text-center py-2 text-xs text-cyan-400 font-medium animate-pulse">
          Procesando y optimizando fotografía en tiempo real...
        </div>
      )}

      {/* Gallery list */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col"
            >
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className="p-1.5 bg-slate-900/80 hover:bg-cyan-600 text-white rounded-full backdrop-blur-sm"
                    title="Ver imagen completa"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] text-cyan-300 px-1.5 py-0.5 rounded backdrop-blur-xs font-mono">
                  {photo.category.toUpperCase()}
                </span>
              </div>

              <div className="p-2 space-y-1.5 flex-1 flex flex-col justify-between">
                <input
                  type="text"
                  value={photo.caption}
                  onChange={(e) => updateCaption(photo.id, e.target.value)}
                  placeholder="Etiqueta / Descripción"
                  className="w-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
                <div className="flex items-center justify-between text-[10px]">
                  <select
                    value={photo.category}
                    onChange={(e) => updateCategory(photo.id, e.target.value as PhotoEvidence['category'])}
                    className="bg-slate-800 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[10px]"
                  >
                    <option value="antes">Antes</option>
                    <option value="durante">Durante</option>
                    <option value="despues">Después</option>
                    <option value="detalle_rack">Rack / IDF</option>
                    <option value="equipos">Equipos</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-slate-800 bg-slate-900/40 rounded-xl p-4 text-center">
          <Tag className="w-5 h-5 mx-auto text-slate-600 mb-1" />
          <p className="text-xs text-slate-400 font-medium">Aún no se han capturado fotos</p>
          <p className="text-[10px] text-slate-500">Agregue evidencias en tiempo real de racks, cámaras o tubería.</p>
        </div>
      )}

      {/* Modal for full screen photo preview */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 items-center justify-center animate-fade-in">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
            <div className="p-4 bg-slate-900 flex justify-between items-center text-xs">
              <div>
                <p className="font-semibold text-slate-200">{selectedPhoto.caption}</p>
                <p className="text-[11px] text-slate-400 font-mono">{selectedPhoto.timestamp} • {selectedPhoto.category}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
