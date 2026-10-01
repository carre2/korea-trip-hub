const regions = {india:'IN',vietnam:'VN',china:'CN',philippines:'PH',indonesia:'ID',usa:'US',japan:'JP',uk:'GB',canada:'CA',australia:'AU',taiwan:'TW',hongkong:'HK',singapore:'SG',malaysia:'MY',thailand:'TH',mongolia:'MN',bangladesh:'BD',nepal:'NP',uzbekistan:'UZ',srilanka:'LK',pakistan:'PK',kazakhstan:'KZ'};
export function visaSearchMetadata(guide, slug, locale, copy) {
  const country = regions[slug] ? new Intl.DisplayNames([locale], {type:'region',style:'short'}).of(regions[slug]) : guide.country;
  const fill = text => text.replace('{country}', country);
  return {
    // Preserve concise, individually written titles; replace verbose fallbacks.
    title: guide.metaTitle && guide.metaTitle.length <= 70 ? guide.metaTitle : fill(copy.visaTitle),
    description: fill(copy.visaDescription),
  };
}
