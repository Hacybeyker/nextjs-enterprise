import { Client } from 'minio';

// Configuración para Service Account - Puerto 9000 HTTP con path-style
export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: 9000, // Puerto API directo de MinIO
  useSSL: false, // Dokploy no tiene SSL en puerto 9000
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
  region: 'us-east-1',
  pathStyle: true, // IMPORTANTE: Usar path-style URLs
});

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME!;

// Función de debug para probar conectividad
export async function testConnection() {
  try {
    console.log('🔍 Testing MinIO connection...');
    console.log('Endpoint:', process.env.MINIO_ENDPOINT);
    console.log('Port:', process.env.MINIO_PORT);
    console.log('SSL:', process.env.MINIO_USE_SSL);
    console.log('Access Key:', process.env.MINIO_ACCESS_KEY);
    
    // Probar listando buckets
    const buckets = await minioClient.listBuckets();
    console.log('✅ Connection successful. Buckets found:', buckets.length);
    return { success: true, buckets };
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function ensureBucketIsPublic() {
  try {
    console.log(`🔍 Verificando bucket ${BUCKET_NAME}...`);
    
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✅ Bucket ${BUCKET_NAME} creado`);
    }

    const publicPolicy = {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {"AWS": ["*"]},
          "Action": ["s3:GetObject"],
          "Resource": [`arn:aws:s3:::${BUCKET_NAME}/*`]
        }
      ]
    };

    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(publicPolicy));
    console.log(`✅ Bucket ${BUCKET_NAME} configurado como público`);
    
    return { success: true, message: 'Bucket configurado correctamente' };
  } catch (error) {
    console.error('❌ Error configurando bucket:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

// Función para listar objetos del bucket
export async function listObjects() {
  try {
    // Asegurar que el bucket existe y es público
    await ensureBucketIsPublic();

    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      return [];
    }

    const objectsStream = minioClient.listObjects(BUCKET_NAME, '', true);
    const objects = [];

    for await (const obj of objectsStream) {
      if (obj.name) {
        objects.push({
          name: obj.name,
          size: obj.size || 0,
          lastModified: obj.lastModified || new Date(),
        });
      }
    }

    return objects;
  } catch (error) {
    console.error('Error listing objects:', error);
    throw error;
  }
}

// Función para obtener URL pública (puerto 9000 HTTP)
export function getPublicUrl(objectName: string): string {
  return `http://${process.env.MINIO_ENDPOINT}:9000/${BUCKET_NAME}/${objectName}`;
}

// Función para obtener URL pre-firmada (alternativa si puerto 9000 no está expuesto)
export async function getPresignedUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
  try {
    return await minioClient.presignedGetObject(BUCKET_NAME, objectName, expiry);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}

// Función para subir archivo
export async function uploadFile(fileName: string, buffer: Buffer, contentType: string) {
  try {
    // Asegurar que el bucket existe y es público
    await ensureBucketIsPublic();

    await minioClient.putObject(
      BUCKET_NAME,
      fileName,
      buffer,
      buffer.length,
      {
        'Content-Type': contentType,
      }
    );

    return {
      success: true,
      fileName,
      url: getPublicUrl(fileName)
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}