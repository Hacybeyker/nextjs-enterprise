import { NextResponse } from 'next/server';
import { listObjects, getPublicUrl } from '@/lib/minio';

export async function GET() {
  try {
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
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}