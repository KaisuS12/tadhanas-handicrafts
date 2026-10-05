import { useState } from 'react'
import { thumbUrl } from '../lib/supabase.js'

const TINTS = ['#d9758f', '#e1a730', '#b48ac9', '#c0392b', '#8a9a8c', '#e58fa6', '#6f9a7a']

const tintFor = (seed = '') => TINTS[[...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TINTS.length]

// Shows the real photo if one is set, otherwise a soft colored placeholder.
// Uses the small ".thumb" copy unless `full` is set (e.g. the zoomed view).
export default function Photo({ src, emoji, seed, alt, className = '', full = false }) {
  const [thumbFailed, setThumbFailed] = useState(false)
  if (src) {
    const small = full || thumbFailed ? src : thumbUrl(src)
    return <img src={small} alt={alt} className={'photo ' + className} loading="lazy" decoding="async" onError={() => small !== src && setThumbFailed(true)} />
  }
  return (
    <div className={'photo photo-placeholder ' + className} style={{ '--tint': tintFor(seed ?? alt) }} role="img" aria-label={alt}>
      <span>{emoji || '💐'}</span>
    </div>
  )
}
