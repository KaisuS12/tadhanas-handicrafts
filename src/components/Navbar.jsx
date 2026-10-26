import { useShopData } from '../lib/shopData.jsx'
import { useCart } from '../lib/cart.jsx'
import Doodle from './Doodle.jsx'

export default function Navbar({ route }) {
  const { settings } = useShopData()
  const { count } = useCart()
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#/" className="brand">
          <span className="brand-mark" aria-hidden="true"><Doodle name="tulip" size={26} strokeWidth={2.4} /></span>
          <span className="brand-name">{settings.name}</span>
        </a>
        <nav className="nav-links" aria-label="Main">
          <a href="#/" className={route === 'home' ? 'active' : ''}>Bouquets</a>
          <a href="#/customize" className={route === 'customize' ? 'active' : ''}>Build your own</a>
          <a href="#/customize/bag" className="btn btn-small nav-order">
            My order{count > 0 && <span key={count} className="badge">{count}</span>}
          </a>
        </nav>
      </div>
    </header>
  )
}
