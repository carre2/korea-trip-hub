// Still photography keeps the main action readable without automatic motion.
export default function HeroSlider({ locale, t, languageCount, image, imageLabel }) {
  return <section className="journey-hero"><div className="wrap journey-hero-grid">
    <div className="journey-intro"><span className="journey-kicker">KOREA TRIP HUB <span>— {t.languages.replace('{n}', languageCount)}</span></span>
      <h1>{t.heroTitle}</h1><p>{t.heroSub}</p>
      <div className="journey-hero-actions"><a className="btn" href="#plan">{t.start} ↗</a><a href="#planner">{t.myTrip} →</a></div><small>{t.free}</small>
    </div>
    <figure className="journey-cover"><a href={`/${locale}/destinations/gyeongbokgung/`}><img src={image.img} alt={imageLabel} width="1280" height="853" fetchPriority="high" /><span>{imageLabel} ↗</span></a>
      <figcaption><a href={image.creditUrl} target="_blank" rel="noopener noreferrer">{image.credit}</a></figcaption>
    </figure>
  </div></section>;
}
