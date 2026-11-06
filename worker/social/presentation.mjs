// A guide request in a public comment is the opt-in for one private guide reply.
// Ordinary questions and reactions must not start unsolicited private messages.
export function requestsPrivateGuide(text) {
  return /\b(?:guide|link|send|dm|panduan|tautan|pautan|kirim|hantar|enlace|env[ií]a|lien|envoy|ссылк\w*|пришл\w*)\b|가이드|링크|보내|リンク|送って|私信|链接|連結|連接|指南|hướng dẫn|gửi|คู่มือ|ลิงก์|ส่ง/iu.test(text);
}
const notices={
  en:['Automated reply 🌷 I sent the guide link by DM. Check Message Requests too.','Automated reply 🌷 Please DM us your travel question for a clickable guide link.'],
  ko:['자동 안내 🌷 가이드 링크를 DM으로 보냈어요. 메시지 요청함도 확인해주세요.','자동 안내 🌷 클릭 가능한 가이드 링크는 DM으로 여행 질문을 보내주세요.'],
  ja:['自動案内 🌷 ガイドのリンクをDMで送りました。メッセージリクエストもご確認ください。','自動案内 🌷 クリックできるガイドのリンクをご希望の場合は、旅行の質問をDMでお送りください。'],
  vi:['Trả lời tự động 🌷 Đã gửi liên kết hướng dẫn qua DM. Hãy kiểm tra cả mục tin nhắn đang chờ.','Trả lời tự động 🌷 Hãy gửi câu hỏi du lịch qua DM để nhận liên kết hướng dẫn có thể nhấn.'],
  id:['Balasan otomatis 🌷 Tautan panduan sudah dikirim lewat DM. Periksa juga Permintaan Pesan.','Balasan otomatis 🌷 Kirim pertanyaan perjalanan lewat DM untuk mendapat tautan panduan yang bisa diklik.'],
  ms:['Balasan automatik 🌷 Pautan panduan telah dihantar melalui DM. Semak juga Permintaan Mesej.','Balasan automatik 🌷 Hantar soalan perjalanan melalui DM untuk pautan panduan yang boleh diklik.'],
  th:['ตอบกลับอัตโนมัติ 🌷 ส่งลิงก์คู่มือทาง DM แล้ว โปรดตรวจสอบคำขอส่งข้อความด้วย','ตอบกลับอัตโนมัติ 🌷 ส่งคำถามท่องเที่ยวทาง DM เพื่อรับลิงก์คู่มือที่กดได้'],
  zh:['自动回复 🌷 指南链接已通过私信发送，请同时查看消息请求。','自动回复 🌷 请私信您的旅行问题，以获取可点击的指南链接。'],
  'zh-TW':['自動回覆 🌷 指南連結已透過私訊傳送，請也查看訊息邀請。','自動回覆 🌷 請私訊您的旅行問題，以取得可點擊的指南連結。'],
  es:['Respuesta automática 🌷 Te envié el enlace por mensaje privado. Revisa también las solicitudes de mensajes.','Respuesta automática 🌷 Envíanos tu pregunta de viaje por mensaje privado para recibir un enlace que puedas abrir.'],
  fr:['Réponse automatique 🌷 Le lien du guide a été envoyé par message privé. Vérifiez aussi les invitations par message.','Réponse automatique 🌷 Envoyez votre question de voyage par message privé pour recevoir un lien cliquable.'],
  ru:['Автоответ 🌷 Ссылка на путеводитель отправлена в личные сообщения. Проверьте также запросы на переписку.','Автоответ 🌷 Напишите вопрос о поездке в личные сообщения, чтобы получить ссылку на путеводитель.'],
};
export const commentNotice=(locale,sent)=> (notices[locale]||notices.en)[sent?0:1];
