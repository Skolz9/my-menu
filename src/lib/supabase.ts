import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env?.VITE_SUPABASE_URL?.trim() || '';
const rawAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured: boolean =
  Boolean(rawUrl) &&
  Boolean(rawAnonKey) &&
  !rawUrl.includes('your-project-ref.supabase.co') &&
  rawAnonKey !== 'your-public-anon-key';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Client-side image compression via HTML5 Canvas.
 * Resizes images to maxDimension and encodes as WebP/JPEG well below the 2 MB bucket limit.
 */
export async function compressImageFile(
  file: File,
  maxDimension: number = 1000,
  quality: number = 0.82
): Promise<{ blob: Blob; dataUrl: string }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/webp', quality);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed'));
              return;
            }
            if (blob.size > 2 * 1024 * 1024) {
              reject(new Error('Compressed image exceeds 2 MB limit'));
              return;
            }
            resolve({ blob, dataUrl });
          },
          'image/webp',
          quality
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a compressed image to the public "menu-images" Supabase Storage bucket
 * under `{businessId}/{timestamp}-{filename}.webp`.
 * Falls back to the compressed dataUrl when running without Supabase env vars.
 */
export async function uploadMenuImage(
  businessId: string,
  file: File
): Promise<string> {
  const { blob, dataUrl } = await compressImageFile(file);

  if (!supabase) {
    return dataUrl;
  }

  const cleanName = file.name
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9-_]+/g, '-')
    .slice(0, 40);
  const filePath = `${businessId}/${Date.now()}-${cleanName || 'image'}.webp`;

  const { error } = await supabase.storage
    .from('menu-images')
    .upload(filePath, blob, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (error) {
    // Fallback to compressed dataUrl if storage bucket is not yet created
    return dataUrl;
  }

  const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath);
  return data.publicUrl || dataUrl;
}
