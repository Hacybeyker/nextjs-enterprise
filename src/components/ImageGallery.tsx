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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

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

  // Función mejorada para copiar URL con feedback visual
  const copyToClipboard = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setShowToast(true);
      
      // Resetear el estado después de 2 segundos
      setTimeout(() => {
        setCopiedIndex(null);
        setShowToast(false);
      }, 2000);
    } catch (clipboardError) {
      console.warn('Clipboard API not available, using fallback:', clipboardError);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        // Usar el método legacy como fallback
        const successful = document.execCommand('copy');
        if (successful) {
          setCopiedIndex(index);
          setShowToast(true);
          setTimeout(() => {
            setCopiedIndex(null);
            setShowToast(false);
          }, 2000);
        }
      } catch (fallbackError) {
        console.error('Error copying to clipboard:', fallbackError);
      } finally {
        textArea.remove();
      }
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <div 
                key={image.name} 
                className="border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white group"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Overlay con información al hacer hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <div className="text-white text-center p-4">
                      <p className="text-sm font-medium mb-2">{image.name}</p>
                      <p className="text-xs opacity-90">
                        {formatFileSize(image.size)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-800 truncate" title={image.name}>
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(image.size)} • {formatDate(image.lastModified)}
                    </p>
                  </div>
                  
                  {/* Botón mejorado de copiar URL */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(image.url, index)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        copiedIndex === index
                          ? 'bg-green-500 text-white transform scale-95'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 active:scale-95'
                      }`}
                      disabled={copiedIndex === index}
                    >
                      {copiedIndex === index ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copiar URL
                        </>
                      )}
                    </button>
                    
                    {/* Botón para abrir en nueva pestaña */}
                    <button
                      onClick={() => window.open(image.url, '_blank')}
                      className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 active:scale-95"
                      title="Abrir en nueva pestaña"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast de notificación */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">¡URL copiada al portapapeles!</span>
          </div>
        </div>
      )}
    </div>
  );
}