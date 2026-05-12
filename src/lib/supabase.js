import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@bhakty.studio'
export const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export async function getCloudinarySignature(folder = 'bhakty-studio') {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add env vars before direct uploads.')
  }

  const { data, error } = await supabase.functions.invoke('cloudinary-sign-upload', {
    body: { folder },
  })

  if (error) throw error
  return data
}
