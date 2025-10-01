import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar que las variables de entorno estén disponibles
    if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY) {
      return NextResponse.json({ 
        success: true, 
        images: [],
        count: 0
      });
    }

    // Importar dinámicamente solo si las variables están disponibles
    const { listObjects, getPublicUrl } = await import('@/lib/minio');
    const objects = await listObjects() as Array<{name: string, size: number, lastModified: Date}>;
    
    const images = objects
      .filter(obj => {
        const extension = obj.name.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '');
      })
      .map(obj => ({
        name: obj.name,
        url: getPublicUrl(obj.name),
        size: obj.size,
        lastModified: obj.lastModified,
      }))
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    return NextResponse.json({ 
      success: true, 
      images,
      count: images.length
    });

  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json({ 
      success: true, 
      images: [],
      count: 0,
      error: 'Failed to list images' 
    }, { status: 200 }); // Devolver 200 para evitar errores en build
  }
}