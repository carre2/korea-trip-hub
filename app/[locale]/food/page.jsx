import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import { pageMeta, breadcrumbLd, SITE_NAME } from "../../../lib/seo";
import JsonLd from "../../../components/JsonLd";
import BookCTA from "../../../components/BookCTA";
import NearbyEats from "../../../components/NearbyEats";
import FindTopEats from "../../../components/FindTopEats";
import { klookSearch } from "../../../lib/booking";
import food from "../../../data/food.json";
import foodImages from "../../../data/food-images.json";
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
import foodTr from "../../../data/food.tr.json";
import foodFil from "../../../data/food.fil.json";
import foodMs from "../../../data/food.ms.json";
import foodHi from "../../../data/food.hi.json";
import foodAr from "../../../data/food.ar.json";
import foodBn from "../../../data/food.bn.json";

const foodI18n = { ja: foodJa, zh: foodZh, "zh-TW": foodZhTW, es: foodEs, fr: foodFr, de: foodDe, pt: foodPt, it: foodIt, ru: foodRu, ko: foodKo, vi: foodVi, th: foodTh, id: foodId, tr: foodTr, fil: foodFil, ms: foodMs, hi: foodHi, ar: foodAr, bn: foodBn };
const merge = (base, ov) => base.map((it, i) => ({ ...it, ...((ov && ov[i]) || {}) }));

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  return pageMeta({
    locale,
    path: "food",
    title: `${m.food.title} — ${SITE_NAME}`,
    description: m.food.sub,
  });
}

function Card({ item, tagBg, tagColor }) {
  const im = foodImages[item.key];
  return (
    <article className="card">
      <div className={`thumb${im ? " thumb-img" : ""}`} style={im ? undefined : { background: item.grad }}>
        {im ? <img src={im.img} alt={item.n} loading="lazy" /> : item.icon}
        {item.tag && (
          <span className="pill" style={{ position: "absolute", bottom: 12, left: 12, background: tagBg, color: tagColor }}>
            {item.tag}
          </span>
        )}
      </div>
      <div className="cbody">
        <h3>{item.n}</h3>
        <p>{item.d}</p>
        {item.mapq && <NearbyEats q={item.mapq} label={item.n} />}
      </div>
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
      <JsonLd
        data={breadcrumbLd(locale, [
          { name: m.brand, path: "" },
          { name: t.title, path: "food" },
        ])}
      />
      <div className="wrap">
        <div className="sec-head">
          <div>
            <span className="eyebrow">Eat &amp; make</span>
            <h2>{t.title}</h2>
            <p>{t.sub}</p>
          </div>
          <a className="btn ghost" href={`/${locale}/#planner`}>✨ {m.hero.build}</a>
        </div>

        <FindTopEats m={m} />

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

        <BookCTA
          partner="klook"
          icon="👩‍🍳"
          label="Book a Korean cooking class or food tour"
          sub="Make kimchi, tteokbokki & more — or join a market food tour"
          url={klookSearch("Korea cooking class food tour")}
          disclose
        />

        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "24px 0 10px" }}>{t.tips}</h2>
        <ul className="tips">{tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>

        <details className="photo-credits">
          <summary>📷 {t.photoCredits || "Photo credits"}</summary>
          <ul>
            {[...eat, ...make].filter((i) => foodImages[i.key]).map((i) => (
              <li key={i.key}>
                {i.n} — <a href={foodImages[i.key].creditUrl} target="_blank" rel="noopener noreferrer">{foodImages[i.key].credit}</a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
