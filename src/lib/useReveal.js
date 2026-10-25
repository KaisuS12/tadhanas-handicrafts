import { useEffect } from 'react'

// Fades in every `.reveal` element inside `ref` as it scrolls into view.
// `deps` re-scan when new items appear (e.g. after the shop data loads).
export default function useReveal(ref, deps = []) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = [...root.querySelectorAll('.reveal:not(.in)')]
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
