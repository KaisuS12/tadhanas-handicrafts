import { useShopData } from '../lib/shopData.jsx'
import { useCart } from '../lib/cart.jsx'

export default function Navbar({ route }) {
  const { settings } = useShopData()
  const { count } = useCart()
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#/" className="brand">
          <span aria-hidden="true">🌷</span> {settings.name}
        </a>
        <nav className="nav-links">
          <a href="#/" className={route === 'home' ? 'active' : ''}>Bouquets</a>
          <a href="#/customize" className={'btn btn-small' + (route === 'customize' ? ' active' : '')}>
            Customize{count > 0 && <span className="badge">{count}</span>}
          </a>
        </nav>
      </div>
    </header>
  )
}
