import { useEffect, useState } from 'react'
import { getSettings, saveSettings, uploadPhoto } from '../../lib/db.js'
import { friendlyError } from '../../lib/errors.js'
import { ABOUT_DEFAULTS } from '../../components/home/AboutMaker.jsx'

const GROUPS = [
  {
    title: 'Your shop',
    fields: [
      { name: 'name', label: 'Shop name' },
      { name: 'tagline', label: 'Tagline', hint: 'The big line at the top of your home page.' },
    ],
  },
  {
    title: 'How customers reach you',
    fields: [
      { name: 'messenger_username', label: 'Messenger / Facebook page username', hint: 'The part after m.me/ or facebook.com/. Receipts are sent here.', test: true },
      { name: 'facebook_url', label: 'Facebook page link', placeholder: 'https://facebook.com/…' },
      { name: 'phone', label: 'Phone', type: 'tel' },
    ],
  },
  {
    title: 'Store details',
    fields: [
      { name: 'location', label: 'Location' },
      { name: 'hours', label: 'Store hours', placeholder: 'Mon–Sat, 9AM–7PM' },
    ],
  },
]

export default function SettingsForm({ onChanged, notify }) {
  const [saved, setSaved] = useState(null)
  const [row, setRow] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getSettings().then(
      (s) => {
        // Show the default "About" text so she can edit it rather than start blank.
        // (Only when the database has these fields; undefined means the update isn't run yet.)
        const filled = { ...s }
        for (const k of ['about_title', 'about_text']) if (k in filled && !filled[k]) filled[k] = ABOUT_DEFAULTS[k]
        setSaved(filled)
        setRow(filled)
      },
      (err) => notify('Load failed: ' + err.message),
    )
  }, [notify])

  const dirty = row && JSON.stringify(row) !== JSON.stringify(saved)

  async function save(e) {
    e.preventDefault()
    // eslint-disable-next-line no-unused-vars
    const { id, ...values } = row
    setBusy(true)
    try {
      await saveSettings(values)
      setSaved(row)
      onChanged()
      notify('Shop info saved ✓')
    } catch (err) {
      notify(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  const [uploading, setUploading] = useState(false)
  async function uploadAbout(file) {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadPhoto(file, 'about')
      setRow((r) => ({ ...r, about_photo: url }))
    } catch (err) {
      notify('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  if (!row) return <p className="muted">Loading…</p>
  const hasAbout = 'about_text' in row
  return (
    <form className="adm-settings" onSubmit={save}>
      {GROUPS.map((g) => (
        <section key={g.title} className="adm-panel">
          <h2>{g.title}</h2>
          {g.fields.map((f) => (
            <label key={f.name} className="adm-field">
              <span className="adm-label">{f.label}</span>
              <span className="adm-input-row">
                <input type={f.type ?? 'text'} value={row[f.name] ?? ''} placeholder={f.placeholder} onChange={(e) => setRow({ ...row, [f.name]: e.target.value.trimStart() })} />
                {f.test && row[f.name] && (
                  <a className="btn btn-small btn-ghost" href={`https://m.me/${row[f.name].trim()}`} target="_blank" rel="noreferrer">Test link ↗</a>
                )}
              </span>
              {f.hint && <span className="adm-hint">{f.hint}</span>}
            </label>
          ))}
        </section>
      ))}

      <section className="adm-panel">
        <h2>About you</h2>
        {!hasAbout ? (
          <p className="adm-hint">
            The “About the maker” section needs a quick database update. In Supabase → SQL Editor, run the latest lines from <code>supabase/schema.sql</code>.
          </p>
        ) : (
          <>
            <p className="adm-hint" style={{ marginTop: '-0.5rem' }}>Shown near the bottom of your home page, with your photo.</p>
            <div className="adm-field">
              <span className="adm-label">Your photo</span>
              <label className={'adm-photo-drop about-drop' + (row.about_photo ? ' has-photo' : '')}>
                {row.about_photo ? <img src={row.about_photo} alt="" /> : <span className="adm-photo-empty"><span aria-hidden="true">📷</span>Tap to add a photo<small>you, your hands, or your workspace</small></span>}
                {uploading && <span className="adm-photo-busy">Uploading…</span>}
                <input type="file" accept="image/*" hidden onChange={(e) => uploadAbout(e.target.files[0])} />
              </label>
              {row.about_photo && (
                <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setRow({ ...row, about_photo: '' })}>Remove photo</button>
              )}
            </div>
            <label className="adm-field">
              <span className="adm-label">Title</span>
              <input value={row.about_title ?? ''} onChange={(e) => setRow({ ...row, about_title: e.target.value })} />
            </label>
            <label className="adm-field">
              <span className="adm-label">Your story</span>
              <textarea rows={6} value={row.about_text ?? ''} onChange={(e) => setRow({ ...row, about_text: e.target.value })} />
              <span className="adm-hint">Leave a blank line between paragraphs. If you clear it, the default story is shown.</span>
            </label>
          </>
        )}
      </section>

      <div className={'adm-savebar' + (dirty ? ' show' : '')}>
        <span>You have unsaved changes</span>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setRow(saved)}>Undo</button>
        <button className="btn btn-small" disabled={!dirty || busy || uploading}>{busy ? 'Saving…' : 'Save changes'}</button>
      </div>
    </form>
  )
}
