// Turn database errors into something the shop owner can act on
export function friendlyError(err) {
  const msg = err?.message ?? String(err)
  const missing = msg.match(/'(\w+)' column|column [\w.]*?(\w+) does not exist/)
  if (missing) {
    const col = missing[1] || missing[2]
    return `Your database is missing the new “${col}” field. In Supabase → SQL Editor, run the latest update from supabase/schema.sql, then try again.`
  }
  if (/row-level security|JWT|not authorized|permission denied/i.test(msg)) return 'You’ve been signed out. Please sign in again, then save.'
  if (/Failed to fetch|NetworkError|network/i.test(msg)) return 'Couldn’t reach the server. Check your internet connection and try again.'
  return 'Couldn’t save: ' + msg
}
