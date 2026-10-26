// "Fly to my order": a little photo bubble arcs from what was tapped into the
// order button (bottom tab on phones, top bar or order panel on laptops).

const TARGETS = ['.bottom-tab[href="#/customize/bag"] .bottom-icon', '.nav-order', '.cart-panel']
const SIZE = 64

const isVisible = (el) => {
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Little scale "pop" on an element (restartable)
export function bump(el) {
  if (!el) return
  el.classList.remove('bump')
  void el.offsetWidth // restart the CSS animation
  el.classList.add('bump')
  setTimeout(() => el.classList.remove('bump'), 500)
}

// sourceEl: the photo (an <img class="photo"> or the emoji placeholder)
export function flyToCart(sourceEl) {
  if (!sourceEl || typeof sourceEl.animate !== 'function' || reducedMotion()) return
  const target = TARGETS.map((s) => document.querySelector(s)).find((el) => el && isVisible(el))
  if (!target) return

  const from = sourceEl.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  const ghost = document.createElement('div')
  ghost.className = 'fly-ghost'
  const img = sourceEl.tagName === 'IMG' ? sourceEl : sourceEl.querySelector('img')
  if (img) ghost.style.backgroundImage = `url("${img.currentSrc || img.src}")`
  else ghost.textContent = sourceEl.textContent.trim() || '💐'

  const x0 = from.left + from.width / 2 - SIZE / 2
  const y0 = from.top + from.height / 2 - SIZE / 2
  // On the laptop order panel, aim for its top instead of its middle
  const ty = target.classList.contains('cart-panel') ? to.top + 40 : to.top + to.height / 2
  const dx = to.left + to.width / 2 - SIZE / 2 - x0
  const dy = ty - SIZE / 2 - y0
  ghost.style.left = `${x0}px`
  ghost.style.top = `${y0}px`
  document.body.appendChild(ghost)

  const lift = Math.min(160, Math.abs(dy) * 0.35 + 60) // how high the arc goes
  const anim = ghost.animate(
    [
      { transform: 'translate(0, 0) scale(1.2)', opacity: 0.95 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - lift}px) scale(0.85)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.22)`, opacity: 0.5 },
    ],
    { duration: 760, easing: 'cubic-bezier(.45,0,.25,1)' },
  )
  anim.onfinish = anim.oncancel = () => {
    ghost.remove()
    bump(target)
  }
}
