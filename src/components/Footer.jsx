import { useShopData } from '../lib/shopData.jsx'
import { messengerUrl } from '../lib/order.js'

export default function Footer() {
  const { settings } = useShopData()
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong>{settings.name}</strong>
          {settings.location && <p>{settings.location}</p>}
          {settings.hours && <p>{settings.hours}</p>}
        </div>
        <div>
          {settings.phone && <p>📞 {settings.phone}</p>}
          <p>
            {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}
            {settings.facebook_url && ' · '}
            <a href={messengerUrl(settings)} target="_blank" rel="noreferrer">Messenger</a>
          </p>
          <p>
            <a href="#/admin" className="footer-admin">Shop admin</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
