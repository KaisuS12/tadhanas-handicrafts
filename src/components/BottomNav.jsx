import { useCart } from '../lib/cart.jsx'

// App-style tab bar, only visible on phones (see .bottom-nav in CSS)
export default function BottomNav({ route }) {
  const { count } = useCart()
  const tabs = [
    { href: '#/', icon: '🏠', label: 'Bouquets', active: route === 'home' },
    { href: '#/customize', icon: '🌸', label: 'Build', active: route === 'customize' },
    { href: '#/customize/bag', icon: '🛍️', label: 'My order', active: false, badge: count },
  ]
  return (
    <nav className="bottom-nav" aria-label="Main">
      {tabs.map((t) => (
        <a key={t.label} href={t.href} className={'bottom-tab' + (t.active ? ' active' : '')} aria-current={t.active ? 'page' : undefined}>
          <span className="bottom-icon" aria-hidden="true">
            {t.icon}
            {t.badge > 0 && <span className="bottom-badge">{t.badge}</span>}
          </span>
          {t.label}
        </a>
      ))}
    </nav>
  )
}
