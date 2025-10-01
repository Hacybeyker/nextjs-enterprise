import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Verificar que las variables de entorno estén disponibles
    if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY) {
      return NextResponse.json({
        success: false,
        error: 'MinIO configuration not available'
      }, { status: 500 });
    }

    // Importar dinámicamente solo si las variables están disponibles
    const { ensureBucketIsPublic } = await import('@/lib/minio');
    const result = await ensureBucketIsPublic();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}