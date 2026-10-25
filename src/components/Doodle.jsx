// Hand-drawn style line doodles. They take the current text color,
// so `color: var(--sage)` on a parent tints them.
const PATHS = {
  sprig: (
    <>
      <path d="M9 41 C17 31 25 20 38 7" />
      <path d="M15 33 C9 32 6 26 8 21 C14 22 17 28 15 33Z" />
      <path d="M21 26 C20 19 24 14 30 12 C31 19 27 24 21 26Z" />
      <path d="M26 20 C32 21 36 26 36 32 C29 31 26 26 26 20Z" />
    </>
  ),
  tulip: (
    <>
      <path d="M16 13 C15.5 23 18.5 28.5 24 28.5 C29.5 28.5 32.5 23 32 13 L28 17.5 L24 11 L20 17.5 Z" />
      <path d="M24 28.5 C24.5 34 23.5 39 24 44" />
      <path d="M24 39 C19 38.5 15 34.5 14 29.5 C19 30 23 33.5 24 39" />
    </>
  ),
  daisy: (
    <>
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <ellipse key={r} cx="24" cy="12.5" rx="4.2" ry="7.5" transform={`rotate(${r} 24 22)`} />
      ))}
      <circle cx="24" cy="22" r="4" />
      <path d="M24 32 C24.5 37 23.5 41 24 45" />
    </>
  ),
  heart: <path d="M24 40 C12 31 6.5 24.5 8 16.5 C9.5 9.5 18.5 8 24 16 C29.5 8 38.5 9.5 40 16.5 C41.5 24.5 36 31 24 40Z" />,
  rings: (
    <>
      <circle cx="19" cy="28" r="9.5" />
      <circle cx="29.5" cy="28" r="9.5" />
      <path d="M29.5 18.5 L26.5 14 L29.5 10 L32.5 14 Z" />
    </>
  ),
  cap: (
    <>
      <path d="M5 18.5 L24 10 L43 18.5 L24 27 Z" />
      <path d="M13.5 22.5 V31 C13.5 35 34.5 35 34.5 31 V22.5" />
      <path d="M40 19.5 V29 M38 29 h4 l-1 4 h-2 z" />
    </>
  ),
  dove: (
    <>
      <path d="M7 28 C13 28.5 18 24.5 22 20.5 C26.5 16 32 14 38 15.5 L43 13.5 L40.5 19 C38.5 28.5 30 34.5 20 34.5 C14 34.5 9.5 31.5 7 28Z" />
      <path d="M22 22 C24 15.5 28 11.5 34.5 9.5 C33 16 29 21.5 22 22" />
      <circle cx="36.5" cy="18" r="0.6" fill="currentColor" />
    </>
  ),
  sparkle: <path d="M24 6 C25 18 30 23 42 24 C30 25 25 30 24 42 C23 30 18 25 6 24 C18 23 23 18 24 6Z" />,
  chat: (
    <>
      <path d="M8 13 C8 10 10 8.5 13 8.5 H35 C38 8.5 40 10 40 13 V27.5 C40 30.5 38 32 35 32 H20 L12 39 V32 C10 32 8 30.5 8 27.5Z" />
      <path d="M16 18 H32 M16 24 H27" />
    </>
  ),
  receipt: (
    <>
      <path d="M12 6 H36 V42 L32 39 L28 42 L24 39 L20 42 L16 39 L12 42 Z" />
      <path d="M17 14 H31 M17 20 H31 M17 26 H26" />
    </>
  ),
  bouquet: (
    <>
      <circle cx="18" cy="13" r="5" />
      <circle cx="30" cy="12" r="5" />
      <circle cx="24" cy="19" r="5" />
      <path d="M14 22 L24 44 L34 22 Z" />
      <path d="M20 31 C23 29 25 29 28 31" />
    </>
  ),
  arrow: <path d="M6 30 C16 20 28 18 40 22 M33 15 L40 22 L32 27" />,
  swirl: <path d="M24 24 C24 21 27 20 29 22 C31.5 24.5 29.5 29 25 29 C19.5 29 17 23.5 19.5 19 C23 13 32 13.5 35.5 20 C39.5 27.5 34 36 25 36 C15 36 9.5 27 12.5 18" />,
}

export default function Doodle({ name, size = 40, className = '', strokeWidth = 2.2, title }) {
  const shape = PATHS[name]
  if (!shape) return null
  return (
    <svg
      className={'doodle ' + className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {shape}
    </svg>
  )
}

// Hand-drawn underline for headings
export function Swash({ className = '' }) {
  return (
    <svg className={'swash ' + className} viewBox="0 0 200 14" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M4 9 C40 3 78 12 118 6 C148 2 170 9 196 5" />
    </svg>
  )
}

// Which doodle fits a bouquet category
export function occasionDoodle(category = '') {
  const c = category.toLowerCase()
  if (c.includes('birth')) return 'daisy'
  if (c.includes('anniv') || c.includes('wedding') || c.includes('valent')) return 'rings'
  if (c.includes('grad')) return 'cap'
  if (c.includes('sympath') || c.includes('condol') || c.includes('funeral')) return 'dove'
  if (c.includes('mother') || c.includes('love')) return 'heart'
  return 'tulip'
}
