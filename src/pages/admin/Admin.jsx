import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { mode, resetLocal, loadAll } from '../../lib/db.js'
import { useShopData } from '../../lib/shopData.jsx'
import Login from './Login.jsx'
import CrudTable from './CrudTable.jsx'
import SettingsForm from './SettingsForm.jsx'
import Overview from './Overview.jsx'

const STOCK = { on: 'In stock', off: 'Out of stock' }
const SHOWN = { on: 'Showing', off: 'Hidden' }

const photo = { name: 'image_url', label: 'Photo', type: 'image' }
const name = (placeholder) => ({ name: 'name', label: 'Name', type: 'text', required: true, placeholder })
const emoji = { name: 'emoji', label: 'Placeholder emoji', type: 'text', hint: 'Shown when there’s no photo yet.', small: true }
const colors = { name: 'colors', label: 'Colors available', type: 'tags', summary: true, placeholder: 'Type a color, press Enter' }

const SECTIONS = [
  { id: 'overview', icon: '🏡', label: 'Overview', help: 'What needs your attention today.' },
  {
    id: 'bouquets',
    icon: '💐',
    label: 'Bouquets',
    help: 'Bouquets you’ve made, shown on the home page. List what’s inside so customers can “Make one like this”.',
    table: 'bouquets',
    itemLabel: 'bouquet',
    autoCode: 'B',
    layout: 'cards',
    stockLabels: SHOWN,
    newRow: () => ({ name: '', category: '', description: '', emoji: '💐', image_url: '', wrapper_id: '', recipe: [], active: true }),
    fields: [
      photo,
      name('e.g. Classic Red Dozen'),
      { name: 'category', label: 'Category', type: 'category', summary: true, suggestions: ['Birthday', 'Anniversary', 'Graduation', 'Sympathy', 'Just Because'] },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'A short line customers will read' },
      { name: 'recipe', label: 'What’s inside', type: 'recipe' },
      { name: 'code', label: 'Code', type: 'text', small: true, placeholder: 'Auto', hint: 'Shown on the photo. Leave blank to auto-number.' },
      emoji,
    ],
  },
  {
    id: 'flowers',
    icon: '🌹',
    label: 'Flowers',
    help: 'Main flowers customers can add on “Build your bouquet”.',
    table: 'flowers',
    where: { type: 'main' },
    itemLabel: 'flower',
    layout: 'cards',
    stockLabels: STOCK,
    newRow: () => ({ name: '', colors: [], emoji: '🌸', image_url: '', active: true }),
    fields: [photo, name('e.g. Rose'), colors, emoji],
  },
  {
    id: 'fillers',
    icon: '🌿',
    label: 'Fillers',
    help: 'Fillers and greens like baby’s breath and eucalyptus.',
    table: 'flowers',
    where: { type: 'filler' },
    itemLabel: 'filler',
    layout: 'cards',
    stockLabels: STOCK,
    newRow: () => ({ name: '', colors: [], emoji: '🌿', image_url: '', active: true }),
    fields: [photo, name('e.g. Baby’s Breath'), colors, emoji],
  },
  {
    id: 'wraps',
    icon: '🎀',
    label: 'Wraps',
    help: 'Wrapping choices. The customer picks one.',
    table: 'options',
    where: { kind: 'wrapper' },
    itemLabel: 'wrap',
    layout: 'rows',
    stockLabels: STOCK,
    newRow: () => ({ name: '', active: true }),
    fields: [name('e.g. Korean Wrap')],
  },
  {
    id: 'extras',
    icon: '🍫',
    label: 'Extras',
    help: 'Add-ons like cards, ribbons, chocolates. The customer can pick any.',
    table: 'options',
    where: { kind: 'addon' },
    itemLabel: 'extra',
    layout: 'rows',
    stockLabels: STOCK,
    newRow: () => ({ name: '', active: true }),
    fields: [name('e.g. Message Card')],
  },
  { id: 'settings', icon: '⚙️', label: 'Shop info', help: 'Your shop name, contact details, and Messenger link.' },
]

const matches = (row, where = {}) => Object.entries(where).every(([k, v]) => row[k] === v)

// The section lives in the address (#/admin/bouquets) so a refresh stays put.
// "#/admin/bouquets/new" opens the add form straight away.
function fromHash() {
  const [, id, action] = window.location.hash.replace(/^#\/?/, '').split('/')
  const section = SECTIONS.some((s) => s.id === id) ? id : 'overview'
  return { section, edit: action === 'new' ? 'new' : null }
}

export default function Admin({ notify }) {
  const { reload: reloadShop } = useShopData()
  const [session, setSession] = useState(mode === 'local' ? 'test' : undefined)
  const [sectionId, setSectionId] = useState(() => fromHash().section)
  const [openEdit, setOpenEdit] = useState(() => fromHash().edit) // { id } or 'new', handed to the section once
  const [all, setAll] = useState(null) // every row, including hidden ones, for counts
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (mode !== 'supabase') return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const refresh = useCallback(async () => {
    try {
      setAll(await loadAll())
    } catch (err) {
      notify('Could not load your shop: ' + err.message)
    }
  }, [notify])

  useEffect(() => {
    if (session) refresh()
  }, [session, refresh, version])

  const onChanged = useCallback(() => {
    refresh()
    reloadShop()
  }, [refresh, reloadShop])

  if (session === undefined) return <div className="adm-loading">Loading…</div>
  if (!session) return <Login />

  function go(id, edit = null) {
    setSectionId(id)
    setOpenEdit(edit)
    history.replaceState(null, '', `#/admin/${id}`)
    window.scrollTo(0, 0)
  }

  function resetTestData() {
    if (!confirm('Put back the original sample flowers, wraps and bouquets? Your test changes will be lost.')) return
    resetLocal()
    reloadShop()
    setVersion((v) => v + 1)
    notify('Test data reset')
  }

  const countFor = (s) => (all && s.table ? all[s.table].filter((r) => matches(r, s.where)).length : null)
  const section = SECTIONS.find((s) => s.id === sectionId)
  const email = typeof session === 'object' ? session.user?.email : ''

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">
          <span className="adm-logo" aria-hidden="true">🌷</span>
          <div>
            <strong>{all?.settings?.name ?? 'Shop admin'}</strong>
            <span className={'adm-status ' + mode}>{mode === 'local' ? 'Test mode' : 'Live'}</span>
          </div>
        </div>

        <nav className="adm-nav" aria-label="Admin sections">
          {SECTIONS.map((s) => (
            <button key={s.id} className={'adm-nav-item' + (s.id === sectionId ? ' active' : '')} onClick={() => go(s.id)} aria-current={s.id === sectionId ? 'page' : undefined}>
              <span className="adm-nav-icon" aria-hidden="true">{s.icon}</span>
              <span className="adm-nav-label">{s.label}</span>
              {countFor(s) !== null && <span className="adm-nav-count">{countFor(s)}</span>}
            </button>
          ))}
        </nav>

        <div className="adm-side-foot">
          <a href="#/" className="adm-side-link" target="_blank" rel="noreferrer">↗ View shop</a>
          {mode === 'supabase' ? (
            <>
              {email && <span className="adm-user" title={email}>{email}</span>}
              <button className="adm-side-link" onClick={() => supabase.auth.signOut()}>Sign out</button>
            </>
          ) : (
            <button className="adm-side-link adm-reset" onClick={resetTestData}>Reset test data</button>
          )}
        </div>
      </aside>

      <main className="adm-main">
        {mode === 'local' && (
          <div className="adm-banner">
            <strong>🧪 Test mode:</strong> changes are saved in this browser only. Connect Supabase to go live.{' '}
            <button className="link-btn" onClick={resetTestData}>Reset test data</button>
          </div>
        )}

        <header className="adm-head">
          <div>
            <h1>{section.icon} {section.label}</h1>
            <p>{section.help}</p>
          </div>
        </header>

        {section.id === 'overview' ? (
          <Overview all={all} go={go} onChanged={onChanged} notify={notify} />
        ) : section.id === 'settings' ? (
          <SettingsForm key={version} onChanged={onChanged} notify={notify} />
        ) : (
          <CrudTable key={section.id + version} {...section} openEdit={openEdit} onChanged={onChanged} notify={notify} />
        )}
      </main>
    </div>
  )
}
