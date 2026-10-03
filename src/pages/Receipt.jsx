import { useEffect, useRef, useState } from 'react'
import { toBlob } from 'html-to-image'
import useLockScroll from '../lib/useLockScroll.js'
import { useCart } from '../lib/cart.jsx'
import { useShopData } from '../lib/shopData.jsx'
import { receiptText, messengerUrl, copyText } from '../lib/order.js'

export default function Receipt({ notify }) {
  const { receipt } = useCart()
  const { settings } = useShopData()
  const ref = useRef(null)
  const [file, setFile] = useState(null) // the receipt as a PNG, rendered ahead of time
  const [preview, setPreview] = useState('') // object URL for the press-and-hold fallback
  useLockScroll(Boolean(preview))

  // Render the image before the customer taps: iOS only allows sharing
  // right inside a tap, and rendering takes too long to do it then.
  const orderNo = receipt?.orderNo
  useEffect(() => {
    if (!orderNo) return
    let cancelled = false
    setFile(null)
    ;(async () => {
      try {
        await document.fonts?.ready
        const blob = await toBlob(ref.current, { pixelRatio: 2, backgroundColor: '#ffffff' })
        if (!cancelled && blob) setFile(new File([blob], `${orderNo}.png`, { type: 'image/png' }))
      } catch (err) {
        console.error('Could not render receipt image', err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [orderNo])

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  if (!receipt) {
    return (
      <div className="container section center">
        <h1 className="page-title">No order yet</h1>
        <p className="muted">Build a bouquet first, then place your order.</p>
        <a href="#/customize" className="btn">Build your bouquet</a>
      </div>
    )
  }

  const created = new Date(receipt.createdAt)
  const d = receipt.details

  const canShare = Boolean(file && navigator.canShare?.({ files: [file] }))
  const isTouch = window.matchMedia?.('(pointer: coarse)').matches

  function showPreview() {
    setPreview(URL.createObjectURL(file))
  }

  async function share() {
    try {
      await navigator.share({ files: [file], title: settings.name, text: `My order ${receipt.orderNo}` })
      notify('Sent! We’ll reply with the price soon 💐')
    } catch (err) {
      if (err.name === 'AbortError') return // customer closed the share sheet
      console.error(err)
      showPreview()
    }
  }

  function saveImage() {
    // Phones often ignore downloads, so let them press-and-hold the picture instead
    if (isTouch) return showPreview()
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    notify('Receipt saved! Send it to us on Messenger.')
  }

  async function copy() {
    notify((await copyText(receiptText(receipt, settings))) ? 'Order copied! Paste it in Messenger.' : 'Could not copy. Please take a screenshot instead.')
  }

  return (
    <div className="container section receipt-page">
      <h1 className="page-title center">Almost done! 🎉</h1>
      <p className="muted center">Save this receipt and send it to our Facebook page. We’ll reply with the price and payment details.</p>

      <div className="receipt" ref={ref}>
        <div className="receipt-head">
          <div className="receipt-logo">🌷</div>
          <h2>{settings.name}</h2>
          <p className="muted small">Order receipt</p>
        </div>

        <dl className="receipt-meta">
          <div><dt>Order no.</dt><dd>{receipt.orderNo}</dd></div>
          <div><dt>Placed</dt><dd>{created.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
        </dl>

        <table className="receipt-items">
          <thead>
            <tr><th>Item</th><th className="qty">Qty</th></tr>
          </thead>
          <tbody>
            {receipt.items.map((i, idx) => (
              <tr key={idx}>
                <td>
                  {i.code && <strong>#{i.code} </strong>}
                  {i.name}
                  {i.color && <span className="muted"> · {i.color}</span>}
                  {i.kind === 'bouquet' && <span className="muted small"> (ready-made)</span>}
                </td>
                <td className="qty">{i.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="receipt-meta">
          {receipt.basedOn && (
            <div><dt>Inspired by</dt><dd>{receipt.basedOn.code && `#${receipt.basedOn.code} `}{receipt.basedOn.name}</dd></div>
          )}
          {receipt.wrapper && <div><dt>Wrap</dt><dd>{receipt.wrapper}</dd></div>}
          {receipt.addOns.length > 0 && <div><dt>Extras</dt><dd>{receipt.addOns.join(', ')}</dd></div>}
          {receipt.cardMessage && <div><dt>Card message</dt><dd>“{receipt.cardMessage}”</dd></div>}
        </dl>

        <dl className="receipt-meta receipt-customer">
          <div><dt>Name</dt><dd>{d.name}</dd></div>
          <div><dt>Pickup / Delivery</dt><dd>{d.method}</dd></div>
          {d.date && <div><dt>Date needed</dt><dd>{new Date(d.date + 'T00:00').toLocaleDateString('en-PH', { dateStyle: 'medium' })}</dd></div>}
        </dl>

        <p className="receipt-foot">Price to be confirmed by {settings.name} via Messenger.<br />Thank you! 💐</p>
      </div>

      <div className="receipt-actions">
        {!file ? (
          <button className="btn" disabled>Preparing receipt…</button>
        ) : canShare ? (
          <button className="btn" onClick={share}>📤 Share receipt to Messenger</button>
        ) : (
          <button className="btn" onClick={saveImage}>⬇ Save receipt as image</button>
        )}
        <a className={'btn' + (canShare ? ' btn-ghost' : '')} href={messengerUrl(settings)} target="_blank" rel="noreferrer">💬 Open our Messenger</a>
        <button className="btn btn-ghost" onClick={copy}>Copy order text</button>
      </div>
      <ol className="receipt-steps muted small">
        {canShare ? (
          <>
            <li>Tap <strong>Share receipt to Messenger</strong>.</li>
            <li>Choose <strong>Messenger</strong>, then pick our page and send.</li>
          </>
        ) : (
          <>
            <li>Tap <strong>Save receipt as image</strong>.</li>
            <li>Tap <strong>Open our Messenger</strong> and attach the saved picture (or paste the copied text).</li>
          </>
        )}
      </ol>
      <div className="center">
        <a href="#/customize" className="link-btn">Build another bouquet</a>
      </div>

      {preview && (
        <div className="lightbox" onClick={() => setPreview('')} role="dialog" aria-modal="true" aria-label="Save your receipt">
          <div className="lightbox-inner receipt-preview" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setPreview('')} aria-label="Close">×</button>
            <p className="receipt-preview-tip"><strong>Press and hold</strong> the picture, then tap <strong>Save to Photos</strong> (iPhone) or <strong>Download image</strong> (Android).</p>
            <img src={preview} alt={`Receipt ${receipt.orderNo}`} />
            <div className="lightbox-caption">
              <a className="btn" href={messengerUrl(settings)} target="_blank" rel="noreferrer">💬 Open our Messenger</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
