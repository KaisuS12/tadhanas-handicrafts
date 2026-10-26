import { useEffect, useRef } from 'react'

// Drag a bottom sheet down with your finger to close it (touch only).
// sheetRef: the element that moves. scrollRef: the part that scrolls inside it
// (defaults to the sheet). Only starts when that part is scrolled to the top.
export default function useSwipeDown(sheetRef, onClose, { enabled = true, scrollRef } = {}) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet || !enabled) return
    const scroller = () => scrollRef?.current ?? sheet
    let startY = 0
    let dy = 0
    let t0 = 0
    let dragging = false

    const reset = () => {
      sheet.style.transition = ''
      sheet.style.transform = ''
    }
    const start = (e) => {
      if (scroller().scrollTop > 0 || e.touches.length > 1) return
      startY = e.touches[0].clientY
      t0 = Date.now()
      dy = 0
      dragging = true
    }
    const move = (e) => {
      if (!dragging) return
      dy = e.touches[0].clientY - startY
      if (dy <= 0) {
        sheet.style.transform = ''
        return
      }
      if (scroller().scrollTop > 0) {
        dragging = false
        return
      }
      e.preventDefault() // we're dragging the sheet, not scrolling the page
      sheet.style.transition = 'none'
      sheet.style.transform = `translateY(${dy}px)`
    }
    const end = () => {
      if (!dragging) return
      dragging = false
      const speed = dy / Math.max(1, Date.now() - t0) // px per ms
      sheet.style.transition = 'transform 0.25s ease'
      if (dy > 110 || (speed > 0.6 && dy > 40)) {
        sheet.style.transform = 'translateY(100%)'
        setTimeout(() => {
          closeRef.current()
          reset()
        }, 200)
      } else {
        sheet.style.transform = ''
        setTimeout(reset, 260)
      }
    }

    sheet.addEventListener('touchstart', start, { passive: true })
    sheet.addEventListener('touchmove', move, { passive: false })
    sheet.addEventListener('touchend', end)
    sheet.addEventListener('touchcancel', end)
    return () => {
      sheet.removeEventListener('touchstart', start)
      sheet.removeEventListener('touchmove', move)
      sheet.removeEventListener('touchend', end)
      sheet.removeEventListener('touchcancel', end)
      reset()
    }
  }, [sheetRef, scrollRef, enabled])
}
