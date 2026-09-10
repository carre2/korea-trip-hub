import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import { pageMeta, breadcrumbLd, SITE_NAME } from "../../../lib/seo";
import JsonLd from "../../../components/JsonLd";
import topics from "../../../data/topics.json";
import topicsZh from "../../../data/topics.zh.json";
import topicsZhTW from "../../../data/topics.zh-TW.json";
import topicsJa from "../../../data/topics.ja.json";
import topicsVi from "../../../data/topics.vi.json";
import topicsTh from "../../../data/topics.th.json";
import topicsId from "../../../data/topics.id.json";
import topicsEs from "../../../data/topics.es.json";
import topicsMs from "../../../data/topics.ms.json";
import topicsKo from "../../../data/topics.ko.json";
import topicsRu from "../../../data/topics.ru.json";
import topicsFr from "../../../data/topics.fr.json";

const topicI18n = { zh: topicsZh, "zh-TW": topicsZhTW, ja: topicsJa, vi: topicsVi, th: topicsTh, id: topicsId, es: topicsEs, ms: topicsMs, ko: topicsKo, ru: topicsRu, fr: topicsFr };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const gm = getMessages(locale).guides || {};
  return pageMeta({
    locale,
    path: "guides",
    title: `${gm.title || "Korea travel guides"} — ${SITE_NAME}`,
    description: gm.sub || "Seasonal and topic guides for visiting Korea.",
  });
}

export default function GuidesHub({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  const gm = m.guides || {};
  return (
    <section>
      <JsonLd
        data={breadcrumbLd(locale, [
          { name: m.brand, path: "" },
          { name: gm.title || "Guides", path: "guides" },
        ])}
      />
      <div className="wrap">
        <div className="sec-head">
          <div>
            <span className="eyebrow">{gm.eyebrow || "Seasons & topics"}</span>
            <h2>{gm.title || "Korea travel guides"}</h2>
            <p>{gm.sub || "Seasonal and topic guides to help you time and plan your trip."}</p>
          </div>
        </div>
        <div className="grid g4">
          {topics.order.map((slug) => {
            const base = topics.items[slug];
            const ov = topicI18n[locale]?.items?.[slug];
            const g = ov ? { ...base, ...ov } : base;
            return (
              <a key={slug} className="card" href={`/${locale}/guides/${slug}/`}>
                <div className="thumb" style={{ background: `linear-gradient(135deg, ${g.color}, ${g.color}bb)` }}>
                  <span style={{ fontSize: 44 }}>{g.icon}</span>
                  {g.kicker && (
                    <span className="pill" style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(255,255,255,.85)", color: "#333" }}>
                      {g.kicker}
                    </span>
                  )}
                </div>
                <div className="cbody">
                  <h3>{g.h1}</h3>
                  <p>{g.metaDesc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
