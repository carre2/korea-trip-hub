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
