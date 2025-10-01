import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verificar que las variables de entorno estén disponibles
    if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY) {
      return NextResponse.json({ 
        error: 'MinIO configuration not available' 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validaciones
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Generar nombre único
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Importar dinámicamente y subir archivo
    const { uploadFile } = await import('@/lib/minio');
    const result = await uploadFile(fileName, buffer, file.type);

    return NextResponse.json({ 
      success: true, 
      fileName: result.fileName,
      fileUrl: result.url,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}