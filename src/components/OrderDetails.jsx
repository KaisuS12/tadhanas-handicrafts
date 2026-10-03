// Today's date as YYYY-MM-DD in the customer's local time
export const today = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

// Returns { field: message } for anything missing or invalid
export function validateDetails(details) {
  const errors = {}
  if (!details.name.trim()) errors.name = 'Please enter your name'
  if (!details.date) errors.date = 'Please pick the date you need it'
  else if (details.date < today()) errors.date = 'This date has already passed'
  return errors
}

// Name / pickup-or-delivery / date fields shown before placing an order.
export default function OrderDetails({ details, onChange, showErrors }) {
  const set = (key) => (e) => onChange({ ...details, [key]: e.target.value })
  const errors = showErrors ? validateDetails(details) : {}
  return (
    <div className="order-details">
      <label>
        Your name *
        <input value={details.name} onChange={set('name')} placeholder="Juan Dela Cruz" aria-invalid={Boolean(errors.name)} />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </label>
      <div className="row">
        <label>
          Pickup or delivery *
          <select value={details.method} onChange={set('method')}>
            <option>Pickup</option>
            <option>Delivery</option>
          </select>
        </label>
        <label>
          Date needed *
          <input type="date" min={today()} value={details.date} onChange={set('date')} aria-invalid={Boolean(errors.date)} />
          {errors.date && <span className="field-error">{errors.date}</span>}
        </label>
      </div>
    </div>
  )
}
