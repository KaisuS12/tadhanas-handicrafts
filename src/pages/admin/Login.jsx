import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useShopData } from '../../lib/shopData.jsx'

export default function Login() {
  const { settings } = useShopData()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setError(error.message === 'Invalid login credentials' ? 'Wrong email or password. Please try again.' : error.message)
    setBusy(false)
  }

  return (
    <div className="adm-login-page">
      <form className="adm-login" onSubmit={submit}>
        <div className="adm-login-logo" aria-hidden="true">🌷</div>
        <h1>{settings.name}</h1>
        <p className="muted">Sign in to manage your shop</p>
        <label className="adm-field">
          <span className="adm-label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        </label>
        <label className="adm-field">
          <span className="adm-label">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {error && <p className="field-error">{error}</p>}
        <button className="btn btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <a href="#/" className="adm-login-back">← Back to the shop</a>
      </form>
    </div>
  )
}
