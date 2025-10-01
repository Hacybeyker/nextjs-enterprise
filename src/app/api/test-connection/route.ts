import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar que las variables de entorno estén disponibles
    if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY) {
      return NextResponse.json({
        success: false,
        error: 'MinIO configuration not available'
      }, { status: 500 });
    }

    // Importar dinámicamente solo si las variables están disponibles
    const { testConnection } = await import('@/lib/minio');
    const result = await testConnection();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}