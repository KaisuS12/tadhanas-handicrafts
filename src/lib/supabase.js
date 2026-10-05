import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// null when Supabase isn't set up yet, so the site uses src/data/shop.js
export const supabase = url && key ? createClient(url, key) : null

export const PHOTO_BUCKET = 'photos'

// Upload a photo plus a small ".thumb.jpg" copy next to it (for cards and lists).
// Returns the full-size URL; thumbUrl() derives the small one from it.
export async function uploadPhotoPair(full, thumb, folder, name) {
  const safeName = name.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-')
  const base = `${folder}/${Date.now()}-${safeName}`
  const bucket = supabase.storage.from(PHOTO_BUCKET)
  const options = { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false }
  const [a, b] = await Promise.all([bucket.upload(`${base}.jpg`, full, options), bucket.upload(`${base}.thumb.jpg`, thumb, options)])
  if (a.error) throw a.error
  if (b.error) throw b.error
  return bucket.getPublicUrl(`${base}.jpg`).data.publicUrl
}

// Small version of an uploaded photo (falls back to the full one if missing)
export const thumbUrl = (src) => (src && /\/storage\/v1\/object\/public\/.+\.jpg$/.test(src) && !src.endsWith('.thumb.jpg') ? src.replace(/\.jpg$/, '.thumb.jpg') : src)
