'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ImageData {
  name: string;
  url: string;
  size: number;
  lastModified: string;
}

interface ImageGalleryProps {
  readonly className?: string;
}

export default function ImageGallery({ className = '' }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Cargar imágenes al montar el componente
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/images');
      
      const result = await response.json();
      console.log('Response from /api/images:', result);
      if (result.success) {
        setImages(result.images);
      } else {
        setError('Error loading images');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Error loading images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setSelectedFile(null);
        // Recargar la lista de imágenes
        await loadImages();
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(result.error || 'Error uploading file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Subir Nueva Imagen</h2>
        
        <div className="space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                Archivo seleccionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>
          
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            {isUploading ? 'Subiendo...' : 'Subir Imagen'}
          </button>
          
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Galería de Imágenes</h2>
          <button
            onClick={loadImages}
            disabled={isLoading}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-300"
          >
            {isLoading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Cargando imágenes...</p>
          </div>
        )}
        
        {!isLoading && images.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay imágenes disponibles</p>
          </div>
        )}
        
        {!isLoading && images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={image.name} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 truncate" title={image.name}>
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatFileSize(image.size)} • {formatDate(image.lastModified)}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(image.url)}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Copiar URL
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}