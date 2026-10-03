import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import BottomNav from './components/BottomNav.jsx'
import Footer from './components/Footer.jsx'
import Toast from './components/Toast.jsx'
import Home from './pages/Home.jsx'
import Customize from './pages/Customize.jsx'
import Receipt from './pages/Receipt.jsx'
import { ShopDataProvider } from './lib/shopData.jsx'
import { CartProvider } from './lib/cart.jsx'

// Admin code only downloads when someone opens #/admin
const Admin = lazy(() => import('./pages/admin/Admin.jsx'))

const ROUTES = ['customize', 'receipt', 'admin']
const routeFromHash = () => ROUTES.find((r) => window.location.hash.startsWith('#/' + r)) ?? 'home'

export default function App() {
  const [route, setRoute] = useState(routeFromHash)
  const [toast, setToast] = useState('')
  const clearToast = useCallback(() => setToast(''), [])

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash())
      // "#/customize/bag" just opens the order sheet; keep the scroll position
      if (!window.location.hash.endsWith('/bag')) window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const page = {
    home: <Home notify={setToast} />,
    customize: <Customize />,
    receipt: <Receipt notify={setToast} />,
    admin: (
      <Suspense fallback={<div className="adm-loading">Loading…</div>}>
        <Admin notify={setToast} />
      </Suspense>
    ),
  }[route]

  return (
    <ShopDataProvider>
      <CartProvider>
        <div className={'app route-' + route}>
          {route === 'admin' ? (
            page
          ) : (
            <>
              <Navbar route={route} />
              <main>{page}</main>
              <Footer />
              <BottomNav route={route} />
            </>
          )}
          <Toast message={toast} onDone={clearToast} />
        </div>
      </CartProvider>
    </ShopDataProvider>
  )
}
