// Language is not nationality. Offer a country change only where a language
// has an unambiguous matching guide that this site actually publishes.
export const languageVisaCountries = {ja:'japan',vi:'vietnam',zh:'china','zh-TW':'taiwan',th:'thailand',id:'indonesia',ms:'malaysia'};
export function languageSwitchOptions(pathname, code, locales, search='', hash='') {
  if (!locales.includes(code)) return null;
  const parts=pathname.split('/');
  if(locales.includes(parts[1]))parts[1]=code;else parts.splice(1,0,code);
  const languageUrl=parts.join('/')+search+hash;
  const country=languageVisaCountries[code];
  const isCountryGuide=parts[2]==='visa'&&!!parts[3]&&parts.slice(4).every(x=>!x);
  return {languageUrl,countryUrl:isCountryGuide&&country&&parts[3]!==country?`/${code}/visa/${country}/${search}`:null};
}
