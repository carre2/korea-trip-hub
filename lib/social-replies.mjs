// Pure draft router. No networking or credentials; never sends a message.
// A transport must verify the event/account and enforce persistent deduplication.
export const socialLocales = ['en','zh','zh-TW','ja','vi','th','id','es','ms','ko','ru','fr'];

const topics = [
  ['visa', 'plan/visa', /\b(?:visa|k[ -]?eta|e[ -]?arrival|entry card|passport)\b|비자|입국|여권|签证|簽證|入境|ビザ|査証|วีซ่า|hộ chiếu|thị thực/iu],
  ['airport', 'plan/airport', /\b(?:airport|incheon|arex)\b|공항|仁川|機場|机场|空港|sân bay|bandara|lapangan terbang|สนามบิน/iu],
  ['sim', 'plan/sim', /\b(?:e?sim|wifi|wi-fi|internet)\b|유심|와이파이|ซิม/iu],
  ['transit', 'plan/transit', /\b(?:subway|metro|t[ -]?money|transport|train|bus)\b|교통|지하철|交通|電車|รถไฟ|tàu điện|kereta/iu],
  ['money', 'plan/money', /\b(?:budget|money|exchange|currency|atm)\b|예산|환전|换钱|換錢|両替|đổi tiền|ngân sách|anggaran|bajet|แลกเงิน/iu],
  ['food', 'food', /\b(?:food|halal|restaurant|makan|makanan|comida|restaurant)\b|맛집|음식|美食|グルメ|ẩm thực|đồ ăn|อาหาร/iu],
  ['festivals', 'festivals', /\b(?:festival|concert|k[ -]?pop|lễ hội|konser)\b|축제|콘서트|音樂節|音乐节|演唱會|演唱会|祭り|ライブ|เทศกาล/iu],
  ['stay', 'stay', /\b(?:hotel|accommodation|hostel|penginapan|hôtel)\b|숙박|호텔|住宿|ホテル|khách sạn|โรงแรม/iu],
  ['itinerary', 'itinerary', /\b(?:itinerary|planner|trip plan|rencana|jadwal|itinéraire)\b|일정|行程|旅程|lịch trình|แพลน/iu],
];

const countries = [
  ['vietnam', /\b(?:vietnam(?:ese)?|việt nam)\b|베트남|越南|ベトナム/iu],
  ['indonesia', /\bindonesia(?:n)?\b|인도네시아|印尼|印度尼西亚|インドネシア/iu],
  ['philippines', /\b(?:philippines|filipino)\b|필리핀|菲律賓|菲律宾|フィリピン/iu],
  ['japan', /\b(?:japan(?:ese)?)\b|일본|日本/iu],
  ['taiwan', /\btaiwan(?:ese)?\b|대만|台灣|台湾/iu],
  ['thailand', /\b(?:thailand|thai)\b|태국|泰國|泰国|ประเทศไทย/iu],
  ['malaysia', /\bmalaysia(?:n)?\b|말레이시아|馬來西亞|马来西亚/iu],
  ['india', /\bindia(?:n)?\b|인도(?!네시아)|印度(?!尼西亚)/iu],
  ['china', /\b(?:china|chinese)\b|중국|中國|中国/iu],
];

const intro = {
  en: 'Automated guide suggestion 🌷 Here is a related Korea Trip Hub guide:',
  ko: '자동 안내 🌷 질문과 관련된 Korea Trip Hub 가이드예요:',
  ja: '自動案内 🌷 ご質問に関連するKorea Trip Hubのガイドです：',
  vi: 'Gợi ý tự động 🌷 Đây là hướng dẫn liên quan từ Korea Trip Hub:',
  id: 'Saran otomatis 🌷 Berikut panduan terkait dari Korea Trip Hub:',
  ms: 'Cadangan automatik 🌷 Ini panduan berkaitan daripada Korea Trip Hub:',
  th: 'คำแนะนำอัตโนมัติ 🌷 คู่มือที่เกี่ยวข้องจาก Korea Trip Hub:',
  zh: '自动推荐 🌷 这是相关的 Korea Trip Hub 指南：',
  'zh-TW': '自動推薦 🌷 這是相關的 Korea Trip Hub 指南：',
  es: 'Sugerencia automática 🌷 Aquí tienes una guía relacionada de Korea Trip Hub:',
  fr: 'Suggestion automatique 🌷 Voici un guide Korea Trip Hub sur ce sujet :',
  ru: 'Автоматическая подсказка 🌷 Подходящий путеводитель Korea Trip Hub:',
};
const visaNote = {
  en: 'Check the guide and its official sources for your passport and travel conditions.',
  ko: '여권 국적과 여행 조건에 맞게 가이드의 공식 출처를 확인하세요.',
  ja: 'パスポートの国籍と渡航条件に合わせて、ガイド内の公式情報をご確認ください。',
  vi: 'Hãy kiểm tra nguồn chính thức trong hướng dẫn theo quốc tịch hộ chiếu và điều kiện chuyến đi.',
  id: 'Periksa sumber resmi dalam panduan sesuai kewarganegaraan paspor dan kondisi perjalanan Anda.',
  ms: 'Semak sumber rasmi dalam panduan mengikut kewarganegaraan pasport dan syarat perjalanan anda.',
  th: 'ตรวจสอบแหล่งข้อมูลทางการในคู่มือตามสัญชาติในหนังสือเดินทางและเงื่อนไขการเดินทาง',
  zh: '请根据护照国籍和旅行条件，核对指南中的官方信息。',
  'zh-TW': '請依護照國籍和旅行條件，核對指南中的官方資訊。',
  es: 'Consulta las fuentes oficiales de la guía según tu pasaporte y las condiciones del viaje.',
  fr: 'Vérifiez les sources officielles du guide selon votre passeport et les conditions de voyage.',
  ru: 'Проверьте официальные источники в путеводителе с учетом гражданства и условий поездки.',
};

// Language hints select a reading language only, never a nationality.
export function replyLocale(text, preferred) {
  if (socialLocales.includes(preferred)) return preferred;
  if (/[가-힣]/u.test(text)) return 'ko';
  if (/[ぁ-ヿ]/u.test(text)) return 'ja';
  if (/[ก-๛]/u.test(text)) return 'th';
  if (/[А-Яа-яЁё]/u.test(text)) return 'ru';
  if (/[ếềệớờợưđĐấầậ]/u.test(text)) return 'vi';
  if (/[簽灣國請]/u.test(text)) return 'zh-TW';
  if (/[\p{Script=Han}]/u.test(text)) return 'zh';
  if (/\b(?:saya|bagaimana|bandara|jadwal|apakah)\b/iu.test(text)) return 'id';
  if (/\b(?:bajet|lapangan terbang|sila)\b/iu.test(text)) return 'ms';
  if (/\b(?:bonjour|passeport|itinéraire)\b/iu.test(text)) return 'fr';
  if (/\b(?:hola|necesito|pasaporte|itinerario)\b/iu.test(text)) return 'es';
  return 'en';
}

export function draftSocialReply({text, platform, kind, locale, own = false}) {
  const skip = reason => ({action:'skip',reason});
  if (!['instagram','threads'].includes(platform)) return skip('unsupported_platform');
  if (!['comment','dm'].includes(kind) || (platform === 'threads' && kind === 'dm')) return skip('unsupported_channel');
  if (own) return skip('own_event');
  if (typeof text !== 'string' || !text.trim() || text.length > 4000) return skip('invalid_text');
  if (/\b(?:stop|unsubscribe|opt out|do not reply|dont reply)\b|수신거부|답장하지|停止|不要回|返信不要/iu.test(text)) return skip('opt_out');
  if (/https?:\/\/|www\./iu.test(text)) return skip('link_requires_review');
  if (/\b(?:refund|complaint|emergency|suicide|passport number|credit card|scam)\b|환불|불만|긴급|사기|여권번호|救命|환급/iu.test(text) || /\b\d{6,}\b/u.test(text) || /\S+@\S+\.\S+/u.test(text)) return skip('human_review');
  const matches = topics.filter(([, , re]) => re.test(text));
  if (!matches.length) return skip('unknown_topic');
  const asks = /[?？]|\b(?:how|where|need|send|link|guide|help|please|info|can|apakah|bagaimana|bisa|panduan|sila)\b|알려|궁금|필요|어떻게|링크|안내|주세요|請問|请问|教えて|必要|hướng dẫn|cần|cho tôi|ขอ|ไหม/iu.test(text);
  const exactKeyword = /^(?:visa|k[ -]?eta|airport|sim|esim|itinerary|festival|hotel|비자|공항|일정)$/iu.test(text.trim());
  if (!asks && !exactKeyword) return skip('not_a_request');
  const [topic, path] = matches[0];
  // Several different topics need clarification rather than an arbitrary answer.
  if (matches.length > 1) return skip('multiple_topics');
  const lc = replyLocale(text, locale);
  const mentions = countries.filter(([, re]) => re.test(text));
  // A nationality guide is selected only on explicit passport/nationality wording.
  const explicitPassport = /\b(?:passport|citizen|nationality|warga negara)\b|여권|국적|護照|护照|パスポート|hộ chiếu|paspor|หนังสือเดินทาง/iu.test(text);
  const destination = topic === 'visa' && explicitPassport && mentions.length === 1 ? `visa/${mentions[0][0]}` : path;
  const url = new URL(`https://ktriphub.com/${lc}/${destination}/`);
  url.searchParams.set('utm_source',platform);
  url.searchParams.set('utm_medium',kind === 'dm' ? 'dm' : 'social');
  url.searchParams.set('utm_campaign','auto_reply');
  url.searchParams.set('utm_content',topic);
  return {action:'draft',topic,locale:lc,path:`/${lc}/${destination}/`,url:url.href,
    text:`${intro[lc]}\n${url.href}${topic === 'visa' ? `\n${visaNote[lc]}` : ''}`};
}
