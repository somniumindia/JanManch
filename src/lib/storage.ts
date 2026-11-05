import { getSupabase } from './supabase';

export type MediaType = 'image' | 'video' | 'document';

export function getMediaTypeFromFile(file: File): MediaType {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('image/')) return 'image';
  return 'document';
}

export async function uploadMediaFile(file: File): Promise<{
  url: string;
  type: MediaType;
  filename: string;
}> {
  const type = getMediaTypeFromFile(file);
  const supabase = getSupabase();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `uploads/${Date.now()}_${safeName}`;

  if (supabase) {
    try {
      const { data, error } = await supabase.storage.from('media').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (!error && data) {
        const { data: pubData } = supabase.storage.from('media').getPublicUrl(path);
        if (pubData?.publicUrl) {
          return {
            url: pubData.publicUrl,
            type,
            filename: file.name,
          };
        }
      } else if (error) {
        console.warn('Supabase storage error (will fallback):', error.message);
      }
    } catch (e) {
      console.warn('Supabase storage exception (will fallback):', e);
    }
  }

  // Fallback to Data URL for instant local/demo responsiveness
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve({
            url: reader.result,
            type,
            filename: file.name,
          });
        } else {
          resolve({
            url: URL.createObjectURL(file),
            type,
            filename: file.name,
          });
        }
      };
      reader.onerror = () => {
        resolve({
          url: URL.createObjectURL(file),
          type,
          filename: file.name,
        });
      };
      reader.readAsDataURL(file);
    } catch {
      resolve({
        url: URL.createObjectURL(file),
        type,
        filename: file.name,
      });
    }
  });
}
