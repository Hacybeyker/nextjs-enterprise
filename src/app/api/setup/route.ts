import { NextResponse } from 'next/server';
import { ensureBucketIsPublic } from '@/lib/minio';

export async function POST() {
  try {
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