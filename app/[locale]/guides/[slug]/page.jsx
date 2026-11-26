import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { pageMeta, breadcrumbLd, articleLd, faqLd, SITE_NAME, REVIEWED } from "../../../../lib/seo";
import JsonLd from "../../../../components/JsonLd";
import { linkify } from "../../../../lib/linkify";
import BookCTA from "../../../../components/BookCTA";
import { klookSearch, withAff, creatripLocalize } from "../../../../lib/booking";
import BudgetCalculator from "../../../../components/BudgetCalculator";
import NextSteps from "../../../../components/NextSteps";
import BeautyFinder from "../../../../components/BeautyFinder";
import GuideVideos from "../../../../components/GuideVideos";
import PeekMascot from "../../../../components/PeekMascot";
import BloomTable from "../../../../components/BloomTable";
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
            dateModified: g.reviewed || REVIEWED.iso,
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
        <span className="art-read art-updated">🔄 {m.footer.updatedLabel} {g.reviewed || REVIEWED.iso}</span>
      </div>
      <p className="art-tagline">{g.metaDesc}</p>

      {/* Answer-first summary (GEO: gives AI engines a clean, citable answer up top) */}
      {g.answer && (
        <div className="art-tldr topic-answer travel-has-peek category-summary-peek"><PeekMascot animal="bunny"/>
          <span className="art-tldr-lbl">{gm.answer || "Quick answer"}</span>
          <p style={{ margin: 0 }}>{linkify(g.answer, locale)}</p>
        </div>
      )}

      {g.tldr && (
        <div className="art-tldr">
          <span className="art-tldr-lbl">TL;DR</span>
          <ul>{g.tldr.map((t, i) => <li key={i}>{linkify(t, locale)}</li>)}</ul>
        </div>
      )}

      {/* Action card: give visitors who land here (e.g. searching a brand) a concrete
          next step — find/verify/book — instead of only reading the guide. */}
      {g.actionCard && (
        <div className="actcard">
          <div className="actcard-head">
            <span className="actcard-ico" aria-hidden="true">{g.actionCard.icon || g.icon || "✨"}</span>
            <div>
              <h2 className="actcard-title">{g.actionCard.title}</h2>
              {g.actionCard.intro && <p className="actcard-intro">{g.actionCard.intro}</p>}
            </div>
          </div>
          {g.actionCard.buttons?.length > 0 && (
            <div className="actcard-actions">
              {g.actionCard.buttons.map((b, i) => {
                const href = b.partner ? withAff(b.url, b.partner) : b.url;
                const rel = b.partner ? "sponsored nofollow noopener" : "noopener noreferrer";
                return (
                  <a key={i} className="actcard-btn" href={href} target="_blank" rel={rel}>
                    {b.icon && <span className="actcard-btn-ico" aria-hidden="true">{b.icon}</span>}
                    <span className="actcard-btn-txt"><b>{b.label}</b>{b.sub && <small>{b.sub}</small>}</span>
                    <span className="actcard-btn-go" aria-hidden="true">↗</span>
                  </a>
                );
              })}
            </div>
          )}
          {g.actionCard.note && <p className="actcard-note">{linkify(g.actionCard.note, locale)}</p>}
        </div>
      )}

      {slug === "k-beauty-shopping" && <BeautyFinder locale={locale} />}

      {slug === "cherry-blossom" && <BloomTable locale={locale} />}

      {g.sections?.map((s, i) => (
        <section key={i} className="gv-sec">
          <h2>{s.h2}</h2>
          {s.body?.map((p, j) => <p key={j}>{linkify(p, locale)}</p>)}
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

      {g.oliveYoung && (
        <section className="gv-sec">
          <h2>{g.oliveYoung.h2}</h2>
          {g.oliveYoung.body.map((p, j) => <p key={j}>{linkify(p, locale)}</p>)}
        </section>
      )}

      {g.klook && (
        <BookCTA
          partner="klook"
          icon={g.icon || "🎟️"}
          label={g.bookLabel || "Book the experience"}
          sub={g.bookSub || "Experiences via Klook."}
          url={klookSearch(g.klook, locale)}
          disclose
        />
      )}

      {g.creatrip && (
        <BookCTA
          partner="creatrip"
          icon="🎀"
          label={g.creatripLabel || "Book a K-beauty experience"}
          sub={g.creatripSub || "Hair, makeup & skin studios for visitors — via Creatrip."}
          url={creatripLocalize(g.creatrip, locale)}
          disclose
        />
      )}

      {g.faq?.length > 0 && (
        <section className="gv-sec">
          <h2>{gm.faqTitle || "FAQ"}</h2>
          {g.faq.map((f, i) => (
            <details key={i} className="gv-faq">
              <summary>{f.q}</summary>
              <p>{linkify(f.a, locale)}</p>
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

      {slug.startsWith("korea-from-") && <BudgetCalculator key={slug} locale={locale} country={slug.slice('korea-from-'.length)} />}
      {slug === "idol-makeup" && <GuideVideos locale={locale} cats="kculture" />}
      {slug === "k-beauty-shopping" && <GuideVideos locale={locale} cats="beauty" />}
      <NextSteps locale={locale} m={m} heading={m.nextSteps?.heading} />
      <ArticleTrust reviewed={g.reviewed || REVIEWED.iso} locale={locale} />
      <p className="art-disclaimer">{m.footer.disclaimer}</p>
    </article>
  );
}
