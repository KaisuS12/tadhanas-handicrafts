import { useShopData } from '../lib/shopData.jsx'
import { messengerUrl } from '../lib/order.js'
import Doodle from './Doodle.jsx'

export default function Footer() {
  const { settings } = useShopData()
  return (
    <footer className="footer">
      <div className="footer-vine" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <Doodle key={i} name={['sprig', 'tulip', 'daisy'][i % 3]} size={34} strokeWidth={1.8} />
        ))}
      </div>
      <div className="container footer-inner">
        <div className="footer-brand">
          <strong>{settings.name}</strong>
          <p className="hand footer-tag">handmade bouquets, made to order ✿</p>
        </div>
        <div className="footer-col">
          <span className="footer-label">Visit</span>
          {settings.location && <p>{settings.location}</p>}
          {settings.hours && <p>{settings.hours}</p>}
        </div>
        <div className="footer-col">
          <span className="footer-label">Say hi</span>
          {settings.phone && <p>📞 {settings.phone}</p>}
          <p>
            <a href={messengerUrl(settings)} target="_blank" rel="noreferrer">Messenger</a>
            {settings.facebook_url && (
              <>
                {' · '}
                <a href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook</a>
              </>
            )}
          </p>
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} {settings.name}</p>
    </footer>
  )
}
