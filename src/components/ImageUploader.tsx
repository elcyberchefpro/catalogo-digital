'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabase';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  productId?: number;
  onUploadComplete?: (urls: string[]) => void;
}

export default function ImageUploader({ productId, onUploadComplete }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    for (const file of acceptedFiles) {
      const filename = `${productId || 'temp'}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('productos-fotos')
        .upload(filename, file);

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('productos-fotos')
          .getPublicUrl(filename);
        setUploadedUrls(prev => [...prev, publicUrl]);
        // Create local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }

    setUploading(false);
  }, [productId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    onDrop,
  });

  const removeImage = (index: number) => {
    setUploadedUrls(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Notify parent when URLs change
  if (onUploadComplete && uploadedUrls.length > 0) {
    onUploadComplete(uploadedUrls);
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`dropzone flex flex-col items-center justify-center gap-2 ${isDragActive ? 'dragging' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload size={32} className={isDragActive ? 'text-emerald-500' : 'text-gray-400'} />
        {isDragActive ? (
          <p className="text-emerald-600 font-medium">¡Soltá las fotos acá!</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">Arrastrá las fotos o hacé clic para elegirlas</p>
            <p className="text-gray-400 text-xs">PNG, JPG, WebP — múltiples archivos</p>
          </>
        )}
      </div>

      {uploading && (
        <p className="text-sm text-emerald-600 text-center">Subiendo imágenes…</p>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
              {src.startsWith('data:') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length === 0 && !uploading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm justify-center py-4">
          <ImageIcon size={16} />
          <span>Sin imágenes cargadas</span>
        </div>
      )}
    </div>
  );
}
