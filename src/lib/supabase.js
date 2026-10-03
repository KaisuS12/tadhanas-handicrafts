import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// null when Supabase isn't set up yet, so the site uses src/data/shop.js
export const supabase = url && key ? createClient(url, key) : null

export const PHOTO_BUCKET = 'photos'

export async function uploadPhoto(file, folder) {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
  const path = `${folder}/${Date.now()}-${safeName}`
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { upsert: false })
  if (error) throw error
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
}
