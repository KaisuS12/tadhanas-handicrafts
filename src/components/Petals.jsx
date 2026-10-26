import { useMemo } from 'react'

const COLORS = ['#efb3c1', '#f5cdd6', '#e79bb0', '#f7dbc8', '#d9e6cf']
const rand = (a, b) => a + Math.random() * (b - a)

// Soft petals drifting down. mode="fall" loops gently (hero);
// mode="burst" is a one-time shower over the whole screen (receipt).
export default function Petals({ count, mode = 'fall' }) {
  const n = count ?? (window.matchMedia?.('(max-width: 640px)').matches ? 6 : 10)
  const petals = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const burst = mode === 'burst'
        return {
          '--x': `${rand(2, 96)}%`,
          '--delay': `${burst ? rand(0, 0.5) : rand(0, 14)}s`,
          '--dur': `${burst ? rand(1.8, 2.9) : rand(10, 17)}s`,
          '--s': `${rand(10, 18)}px`,
          '--drift': `${rand(-70, 70)}px`,
          '--spin': `${rand(-420, 420)}deg`,
          '--c': COLORS[i % COLORS.length],
        }
      }),
    [n, mode],
  )
  return (
    <div className={`petals petals-${mode}`} aria-hidden="true">
      {petals.map((style, i) => (
        <span key={i} style={style} />
      ))}
    </div>
  )
}
