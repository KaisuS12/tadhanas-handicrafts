import Doodle from '../Doodle.jsx'
import Photo from '../Photo.jsx'

export const ABOUT_DEFAULTS = {
  about_title: 'Made by hand, with heart',
  about_text:
    'Every bouquet here is arranged by hand, one stem at a time. Birthdays, anniversaries, graduations, or a quiet “just because”, tell us the story behind your order and we’ll make something that fits it.',
}

// The owner edits this in Admin → Shop info (empty fields fall back to the defaults)
export default function AboutMaker({ settings }) {
  const title = settings.about_title?.trim() || ABOUT_DEFAULTS.about_title
  const text = settings.about_text?.trim() || ABOUT_DEFAULTS.about_text

  return (
    <section className="container section about reveal" aria-labelledby="about-title">
      <div className="about-photo polaroid tilt-left">
        <span className="tape" aria-hidden="true" />
        <Photo src={settings.about_photo} emoji="🧺" seed="about" alt={`The maker behind ${settings.name}`} />
        <span className="polaroid-caption hand">the maker ✿</span>
      </div>
      <div className="about-text kraft-panel">
        <Doodle name="sprig" size={46} className="about-doodle" />
        <p className="kicker hand">hello there!</p>
        <h2 id="about-title" className="section-title">{title}</h2>
        {text.split(/\n{2,}/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        <p className="signature hand">— {settings.name} ✿</p>
      </div>
    </section>
  )
}
