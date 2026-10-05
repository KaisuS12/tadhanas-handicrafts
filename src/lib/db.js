// One data API for the whole app:
//  - 'supabase' mode when the .env keys are set (real, shared by all visitors)
//  - 'local' test mode otherwise: data lives in this browser only
import { supabase, uploadPhotoPair } from './supabase.js'
import * as seed from '../data/shop.js'

export const mode = supabase ? 'supabase' : 'local'

const TABLES = ['bouquets', 'flowers', 'options']
const LOCAL_KEY = 'tadhana-test-db-v4' // bump when the sample data changes shape
const bySort = (a, b) => (a.sort ?? 0) - (b.sort ?? 0)

// ---------- Local test store ----------
const seedDb = () => structuredClone({ settings: seed.settings, bouquets: seed.bouquets, flowers: seed.flowers, options: seed.options })

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fall through to seed data
  }
  return seedDb()
}

function writeLocal(store) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(store))
  } catch {
    throw new Error('Browser storage is full. Try smaller photos, or connect Supabase.')
  }
}

function mutateLocal(fn) {
  const store = readLocal()
  fn(store)
  writeLocal(store)
}

export function resetLocal() {
  try {
    localStorage.removeItem(LOCAL_KEY)
  } catch {
    // nothing to reset
  }
}

// ---------- Shared API (always async, throws on error) ----------
const check = ({ data, error }) => {
  if (error) throw error
  return data
}

export async function selectAll(table) {
  if (mode === 'local') return [...readLocal()[table]].sort(bySort)
  return check(await supabase.from(table).select('*').order('sort'))
}

export async function insertRow(table, values) {
  if (mode === 'local') {
    return mutateLocal((s) => s[table].push({ id: crypto.randomUUID(), ...values }))
  }
  check(await supabase.from(table).insert(values))
}

export async function updateRow(table, id, values) {
  if (mode === 'local') {
    return mutateLocal((s) => {
      s[table] = s[table].map((r) => (r.id === id ? { ...r, ...values } : r))
    })
  }
  check(await supabase.from(table).update(values).eq('id', id))
}

export async function deleteRow(table, id) {
  if (mode === 'local') {
    return mutateLocal((s) => {
      s[table] = s[table].filter((r) => r.id !== id)
    })
  }
  check(await supabase.from(table).delete().eq('id', id))
}

export async function getSettings() {
  if (mode === 'local') return readLocal().settings
  return check(await supabase.from('settings').select('*').eq('id', 1).single())
}

export async function saveSettings(values) {
  if (mode === 'local') return mutateLocal((s) => (s.settings = { ...s.settings, ...values }))
  check(await supabase.from('settings').update(values).eq('id', 1))
}

export async function loadAll() {
  const [settings, ...rows] = await Promise.all([getSettings(), ...TABLES.map(selectAll)])
  return { settings, ...Object.fromEntries(TABLES.map((t, i) => [t, rows[i]])) }
}

// Photos are shrunk before saving so pages load fast on mobile data.
// Test mode stores them in the browser (smaller); Supabase gets a sharper version.
export async function uploadPhoto(file, folder) {
  if (mode === 'supabase') {
    // Full size for the zoomed view, a small copy for cards (saves free-plan bandwidth)
    const [full, thumb] = await Promise.all([shrinkImage(file, 1400, 0.85), shrinkImage(file, 480, 0.78)])
    return uploadPhotoPair(full, thumb, folder, file.name)
  }
  const blob = await shrinkImage(file, 600, 0.8)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

function shrinkImage(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff' // transparent PNGs would turn black as JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(img.src)
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not process that photo'))), 'image/jpeg', quality)
    }
    img.onerror = () => reject(new Error('That file is not a supported image. Try a JPG or PNG.'))
    img.src = URL.createObjectURL(file)
  })
}
