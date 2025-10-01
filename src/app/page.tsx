import ImageGallery from "@/components/ImageGallery";
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MinIO Image Gallery</h1>
          <p className="text-gray-600 mb-6">Sube y gestiona tus imágenes con MinIO</p>
          
          {/* Imagen estática de demostración */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
              <div className="relative aspect-square">
                <Image
                  src="https://minis3.cosorio.dev/nextjs-enterprise/1759290990171-superman.jpg"
                  alt="Imagen de demostración - Superman"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ejemplo de imagen desde MinIO</h3>
                <p className="text-sm text-gray-600">
                  Esta imagen se carga directamente desde tu servidor MinIO configurado con Dokploy
                </p>
                <div className="mt-3 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                  https://minis3.cosorio.dev/nextjs-enterprise/1759290990171-superman.jpg
                </div>
              </div>
            </div>
          </div>
        </header>

        <ImageGallery className="mb-8" />
      </div>
    </div>
  );
}
