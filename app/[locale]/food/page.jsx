import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import food from "../../../data/food.json";
import foodJa from "../../../data/food.ja.json";
import foodZh from "../../../data/food.zh.json";
import foodEs from "../../../data/food.es.json";
import foodFr from "../../../data/food.fr.json";
import foodDe from "../../../data/food.de.json";
import foodPt from "../../../data/food.pt.json";
import foodIt from "../../../data/food.it.json";
import foodRu from "../../../data/food.ru.json";
import foodKo from "../../../data/food.ko.json";
import foodZhTW from "../../../data/food.zh-TW.json";
import foodVi from "../../../data/food.vi.json";
import foodTh from "../../../data/food.th.json";
import foodId from "../../../data/food.id.json";

const foodI18n = { ja: foodJa, zh: foodZh, "zh-TW": foodZhTW, es: foodEs, fr: foodFr, de: foodDe, pt: foodPt, it: foodIt, ru: foodRu, ko: foodKo, vi: foodVi, th: foodTh, id: foodId };
const merge = (base, ov) => base.map((it, i) => ({ ...it, ...((ov && ov[i]) || {}) }));

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata() {
  return { title: "Food & Experiences — Korea Trip Hub" };
}

function Card({ item, tagBg, tagColor }) {
  return (
    <article className="card">
      <div className="thumb" style={{ background: item.grad }}>{item.icon}
        {item.tag && (
          <span className="pill" style={{ position: "absolute", bottom: 12, left: 12, background: tagBg, color: tagColor }}>
            {item.tag}
          </span>
        )}
      </div>
      <div className="cbody"><h3>{item.n}</h3><p>{item.d}</p></div>
    </article>
  );
}

export default function Food({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  const t = m.food;
  const ov = foodI18n[locale] || {};
  const eat = merge(food.eat, ov.eat);
  const make = merge(food.make, ov.make);
  const tips = (ov.tips && ov.tips.length) ? ov.tips : food.tips;

  return (
    <section>
      <div className="wrap">
        <div className="sec-head">
          <div>
            <span className="eyebrow">Eat &amp; make</span>
            <h2>{t.title}</h2>
            <p>{t.sub}</p>
          </div>
          <a className="btn ghost" href={`/${locale}/#planner`}>✨ {m.hero.build}</a>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 800, margin: "8px 0 14px" }}>🍜 {t.eat}</h3>
        <div className="grid g4">
          {eat.map((i) => (
            <Card key={i.n} item={i} tagBg="var(--primary-soft)" tagColor="var(--primary)" />
          ))}
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 800, margin: "30px 0 14px" }}>🥢 {t.make}</h3>
        <div className="grid g4">
          {make.map((i) => (
            <Card key={i.n} item={i} tagBg="var(--amber-soft)" tagColor="var(--amber)" />
          ))}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "32px 0 12px" }}>{t.tips}</h2>
        <ul className="tips">{tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
      </div>
    </section>
  );
}
