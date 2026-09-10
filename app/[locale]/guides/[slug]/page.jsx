import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { pageMeta, breadcrumbLd, articleLd, faqLd, SITE_NAME, REVIEWED } from "../../../../lib/seo";
import JsonLd from "../../../../components/JsonLd";
import { linkify } from "../../../../lib/linkify";
import ArticleTrust from "../../../../components/ArticleTrust";
import topics from "../../../../data/topics.json";
import topicsZh from "../../../../data/topics.zh.json";
import topicsZhTW from "../../../../data/topics.zh-TW.json";
import topicsJa from "../../../../data/topics.ja.json";
import topicsVi from "../../../../data/topics.vi.json";
import topicsTh from "../../../../data/topics.th.json";
import topicsId from "../../../../data/topics.id.json";
import topicsEs from "../../../../data/topics.es.json";
import topicsMs from "../../../../data/topics.ms.json";
import topicsKo from "../../../../data/topics.ko.json";
import topicsRu from "../../../../data/topics.ru.json";
import topicsFr from "../../../../data/topics.fr.json";

const topicI18n = { zh: topicsZh, "zh-TW": topicsZhTW, ja: topicsJa, vi: topicsVi, th: topicsTh, id: topicsId, es: topicsEs, ms: topicsMs, ko: topicsKo, ru: topicsRu, fr: topicsFr };

// Locale override replaces whole fields (arrays/objects) onto the English base; missing = English fallback.
function localized(slug, locale) {
  const base = topics.items[slug];
  if (!base) return null;
  const ov = topicI18n[locale]?.items?.[slug];
  return ov ? { ...base, ...ov } : base;
}

export function generateStaticParams() {
  return locales.flatMap((locale) => topics.order.map((slug) => ({ locale, slug })));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const g = localized(params.slug, locale);
  if (!g) return pageMeta({ locale, path: `guides/${params.slug}`, title: `Guide — ${SITE_NAME}` });
  return pageMeta({
    locale,
    path: `guides/${params.slug}`,
    title: g.metaTitle || `${g.h1} — ${SITE_NAME}`,
    description: g.metaDesc,
    type: "article",
  });
}

export default function TopicGuide({ params }) {
  const locale = params?.locale || defaultLocale;
  const slug = params.slug;
  const m = getMessages(locale);
  const g = localized(slug, locale);
  if (!g) return null;
  const gm = m.guides || {};

  return (
    <article className="article">
      <JsonLd
        data={[
          breadcrumbLd(locale, [
            { name: m.brand, path: "" },
            { name: gm.title || "Guides", path: "guides" },
            { name: g.h1, path: `guides/${slug}` },
          ]),
          articleLd({
            locale,
            path: `guides/${slug}`,
            headline: g.h1,
            description: g.metaDesc,
            dateModified: REVIEWED.iso,
          }),
          faqLd(g.faq, locale),
        ]}
      />
      <a className="crumb" href={`/${locale}/guides/`}>← {gm.title || "Guides"}</a>

      <div className="art-head">
        <span className="aic" style={{ background: g.color }}>{g.icon}</span>
        <h1>{g.h1}</h1>
      </div>
      <div className="art-meta">
        {g.kicker && <span className="art-kicker">{g.kicker}</span>}
        {g.readingTime && <span className="art-read">⏱ {g.readingTime}</span>}
        <span className="art-read art-updated">🔄 Updated {REVIEWED.label}</span>
      </div>
      <p className="art-tagline">{g.metaDesc}</p>

      {/* Answer-first summary (GEO: gives AI engines a clean, citable answer up top) */}
      {g.answer && (
        <div className="art-tldr topic-answer">
          <span className="art-tldr-lbl">{gm.answer || "Quick answer"}</span>
          <p style={{ margin: 0 }}>{linkify(g.answer)}</p>
        </div>
      )}

      {g.tldr && (
        <div className="art-tldr">
          <span className="art-tldr-lbl">TL;DR</span>
          <ul>{g.tldr.map((t, i) => <li key={i}>{linkify(t)}</li>)}</ul>
        </div>
      )}

      {g.sections?.map((s, i) => (
        <section key={i} className="gv-sec">
          <h2>{s.h2}</h2>
          {s.body?.map((p, j) => <p key={j}>{linkify(p)}</p>)}
          {s.spots && (
            <div className="topic-spots">
              {s.spots.map((sp) => (
                <a key={sp.slug} className="topic-spot" href={`/${locale}/destinations/${sp.slug}/`}>
                  📍 {sp.name} →
                </a>
              ))}
            </div>
          )}
        </section>
      ))}

      {g.faq?.length > 0 && (
        <section className="gv-sec">
          <h2>{gm.faqTitle || "FAQ"}</h2>
          {g.faq.map((f, i) => (
            <details key={i} className="gv-faq">
              <summary>{f.q}</summary>
              <p>{linkify(f.a)}</p>
            </details>
          ))}
        </section>
      )}

      {g.official?.length > 0 && (
        <div className="official-links" style={{ marginTop: 18 }}>
          {g.official.map((o) => (
            <a key={o.url} href={o.url} target="_blank" rel="noopener noreferrer">🔗 {o.name}</a>
          ))}
        </div>
      )}

      <ArticleTrust locale={locale} />
      <p className="art-disclaimer">{m.footer.disclaimer}</p>
    </article>
  );
}
