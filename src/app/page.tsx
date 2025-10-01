import ImageGallery from "@/components/ImageGallery";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MinIO Image Gallery</h1>
          <p className="text-gray-600">Sube y gestiona tus imágenes con MinIO</p>
        </header>

        <ImageGallery className="mb-8" />
      </div>
    </div>
  );
}
