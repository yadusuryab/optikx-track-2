/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = 'admin-panel'
): Promise<{ publicId: string; url: string; format?: string; bytes?: number; width?: number; height?: number }> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Cloudinary upload starting...', {
        type: typeof file,
        isBuffer: file instanceof Buffer,
        isBase64: typeof file === 'string' && file.startsWith('data:'),
        folder,
        fileSize: typeof file === 'string' ? file.length : file?.length
      });

      // Handle base64 string upload
      if (typeof file === 'string' && file.startsWith('data:')) {
        console.log('Uploading base64 data to Cloudinary...');
        
        cloudinary.uploader.upload(
          file,
          {
            folder,
            resource_type: 'image',
            timeout: 60000,
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary base64 upload error:', error);
              reject(error);
            } else if (result) {
              console.log('Cloudinary base64 upload successful:', {
                publicId: result.public_id,
                format: result.format,
                size: result.bytes
              });
              resolve({
                publicId: result.public_id,
                url: result.secure_url,
                format: result.format,
                bytes: result.bytes,
                width: result.width,
                height: result.height
              });
            } else {
              reject(new Error('No result from Cloudinary base64 upload'));
            }
          }
        );
      } 
      // Handle buffer upload (original functionality)
      else if (file instanceof Buffer) {
        console.log('Uploading buffer to Cloudinary via stream...');
        
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            timeout: 60000,
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary stream upload error:', error);
              reject(error);
            } else if (result) {
              console.log('Cloudinary stream upload successful:', {
                publicId: result.public_id,
                format: result.format,
                size: result.bytes
              });
              resolve({
                publicId: result.public_id,
                url: result.secure_url,
                format: result.format,
                bytes: result.bytes,
                width: result.width,
                height: result.height
              });
            } else {
              reject(new Error('No result from Cloudinary stream upload'));
            }
          }
        );

        uploadStream.on('error', (error) => {
          console.error('Upload stream error:', error);
          reject(error);
        });
        
        uploadStream.end(file);
      } else {
        const error = new Error(`Unsupported file type for Cloudinary upload: ${typeof file}`);
        console.error(error.message);
        reject(error);
      }
    } catch (error: any) {
      console.error('Unexpected error in uploadToCloudinary:', error);
      reject(error);
    }
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    console.log('Deleting from Cloudinary:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

// Utility function to convert buffer to base64
export function bufferToBase64(buffer: Buffer, mimeType: string = 'image/jpeg'): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

// Test function to verify Cloudinary configuration
export async function testCloudinaryConnection(): Promise<boolean> {
  try {
    // Try to upload a small test image
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const result = await uploadToCloudinary(testImage, 'test');
    console.log('Cloudinary connection test successful:', result.publicId);
    
    // Clean up test upload
    await deleteFromCloudinary(result.publicId);
    
    return true;
  } catch (error: any) {
    console.error('Cloudinary connection test failed:', error);
    return false;
  }
}