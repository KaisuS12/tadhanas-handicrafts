import { useEffect } from 'react'

// Stop the page behind a sheet/popup from scrolling (mainly for phones)
export default function useLockScroll(locked) {
  useEffect(() => {
    if (!locked) return
    document.body.classList.add('no-scroll')
    return () => document.body.classList.remove('no-scroll')
  }, [locked])
}
