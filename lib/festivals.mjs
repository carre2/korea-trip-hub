export function koreaDay(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function eventStatus(event, today) {
  if (event.end < today) return 'ended';
  return event.start > today ? 'upcoming' : 'ongoing';
}
export function filterEvents(events, {today, city='', type='', from='', until='', ended=false}) {
  if(from && until && from>until)return [];
  return events.filter(e => (!city || e.city === city) && (!type || e.type === type)
    && (ended || e.end >= today) && (!from || e.end >= from) && (!until || e.start <= until))
    .sort((a,b) => a.start.localeCompare(b.start));
}
export function eventShareUrl(locale, id) {
  return `https://ktriphub.com/${locale}/festivals/#${encodeURIComponent(id)}`;
}
const escapeText = value => String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
// RFC 5545 limits a content line to 75 octets, not 75 characters.
function fold(line) {
  const encoder = new TextEncoder(); let rows=[], current='', bytes=0;
  for (const character of line) {
    const size=encoder.encode(character).length;
    if(bytes+size>75){rows.push(current);current=' ';bytes=1;}
    current+=character;bytes+=size;
  }
  rows.push(current); return rows.join('\r\n');
}
export function eventCalendar(event, title, location, url) {
  const end=new Date(`${event.end}T00:00:00Z`);end.setUTCDate(end.getUTCDate()+1);
  const date=s=>s.replaceAll('-','');
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Korea Trip Hub//Festivals//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',
    `UID:${event.id}@ktriphub.com`,`DTSTAMP:${date(event.verified)}T000000Z`,
    `DTSTART;VALUE=DATE:${date(event.start)}`,`DTEND;VALUE=DATE:${date(end.toISOString().slice(0,10))}`,
    `SUMMARY:${escapeText(title)}`,`LOCATION:${escapeText(location)}`,`URL:${url}`,
    `DESCRIPTION:${escapeText(`${title}\n${event.source}\n${url}`)}`,
    'END:VEVENT','END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';
}
