import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. File uploads will not work.');
}

const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http');
  } catch {
    return false;
  }
};

export const supabase = (isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE') 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

export const uploadAssignmentFile = async (file: File, classroomId: number) => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
  }

  // Path: assignments/classroomId/timestamp-filename
  const fileName = `assignments/${classroomId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  
  const { data, error } = await supabase.storage
    .from('labzero-assets')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('labzero-assets')
    .getPublicUrl(data.path);

  return publicUrl;
};

export const deleteAssignmentFile = async (fileUrl: string) => {
  if (!supabase || !fileUrl) return;

  try {
    // Extract the path from the public URL
    // Format: .../storage/v1/object/public/labzero-assets/assignments/2/1715620000-lab_manual.pdf
    const pathPart = fileUrl.split('/labzero-assets/')[1];
    if (pathPart) {
      await supabase.storage
        .from('labzero-assets')
        .remove([pathPart]);
    }
  } catch (error) {
    console.error("Failed to delete file from Supabase:", error);
  }
};
