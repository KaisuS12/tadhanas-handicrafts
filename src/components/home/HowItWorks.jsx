import Doodle from '../Doodle.jsx'

const STEPS = [
  { icon: 'bouquet', title: 'Pick or build', text: 'Choose one of our bouquets, or build your own flower by flower.' },
  { icon: 'receipt', title: 'Place your order', text: 'Add your name and the date you need it. You’ll get a receipt.' },
  { icon: 'chat', title: 'Send it on Messenger', text: 'Share the receipt with us and we’ll reply with the price and details.' },
]

export default function HowItWorks() {
  return (
    <section className="how reveal" aria-labelledby="how-title">
      <div className="container section">
        <p className="kicker hand">easy as 1, 2, 3</p>
        <h2 id="how-title" className="section-title">How ordering works</h2>
        <ol className="how-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="how-step">
              <span className="how-icon">
                <Doodle name={s.icon} size={42} />
                <span className="how-num hand">{i + 1}</span>
              </span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
