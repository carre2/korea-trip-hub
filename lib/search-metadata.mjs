const regions = {india:'IN',vietnam:'VN',china:'CN',philippines:'PH',indonesia:'ID',usa:'US',japan:'JP',uk:'GB',canada:'CA',australia:'AU',taiwan:'TW',hongkong:'HK',singapore:'SG',malaysia:'MY',thailand:'TH',mongolia:'MN',bangladesh:'BD',nepal:'NP',uzbekistan:'UZ',srilanka:'LK',pakistan:'PK',kazakhstan:'KZ'};
export function visaSearchMetadata(guide, slug, locale, copy) {
  const country = regions[slug] ? new Intl.DisplayNames([locale], {type:'region',style:'short'}).of(regions[slug]) : guide.country;
  const fill = text => (text || '').replace('{country}', country);
  // CTR: lead the snippet with this page's own answer-first verdict (localized, specific
  // per country) plus a value hook, instead of one generic template shared by every
  // country. Falls back to the template if a verdict/hook isn't available for the locale.
  const headline = guide.verdict && guide.verdict.headline;
  let description;
  if (headline && copy.visaDescHook) {
    let h = String(headline).trim();
    // Some visa-free peers (the K-ETA-conditional trio Malaysia / Thailand / Kazakhstan)
    // share one generic verdict headline with no country name, so their snippets come out
    // byte-identical. When a visa-free verdict's headline doesn't name the country, lead
    // with the localized country so each page keeps a unique meta description for search.
    // Peers whose localized headline already names the country (Japan, USA, …) are left
    // untouched. This keys on the localized headline text, so it holds in every locale.
    const v = guide.verdict || {};
    if (v.need === false && country) {
      const longName = regions[slug]
        ? new Intl.DisplayNames([locale], { type: 'region' }).of(regions[slug])
        : country;
      if (!h.includes(country) && !h.includes(longName)) h = `${country}: ${h}`;
    }
    if (!/[.。！？!?」）)]$/.test(h)) h += /[぀-ヿ㐀-鿿]/.test(h) ? '。' : '.';
    const sep = /[。！？」）]$/.test(h) ? '' : ' ';
    description = (h + sep + copy.visaDescHook).slice(0, 180);
  } else {
    description = fill(copy.visaDescription);
  }
  return {
    // Preserve concise, individually written titles; replace verbose fallbacks.
    title: guide.metaTitle && guide.metaTitle.length <= 70 ? guide.metaTitle : fill(copy.visaTitle),
    description,
  };
}
