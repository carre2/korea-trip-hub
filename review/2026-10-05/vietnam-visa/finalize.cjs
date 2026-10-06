const fs=require('fs');const root='C:/Users/user/Documents/Codex/korea-trip-hub';const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));const save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const p=root+'/data/visa/vietnam.i18n.json',all=read(p),base=read(root+'/data/visa/vietnam.json');
const viProcessing='Thời gian công bố cho hồ sơ du lịch cá nhân: Hà Nội 16 ngày làm việc, TP. Hồ Chí Minh 18 ngày làm việc. Không tính cuối tuần và ngày lễ; có thể kéo dài khi cần thẩm tra thêm. Đây là thời gian dự kiến, không phải cam kết. Hồ sơ Đà Nẵng cần xác nhận riêng.';
all.vi.highlights[0].body=viProcessing;all.vi.faq.items[8].a=viProcessing;
const hotels={ja:'ホテル予約',zh:'酒店预订','zh-TW':'飯店預訂',id:'Reservasi hotel',ms:'Tempahan hotel',th:'การจองโรงแรม',es:'Reserva de hotel',fr:'Réservation d’hôtel',ru:'Бронирование отеля'};
const itineraries={en:'Travel itinerary',vi:'Lịch trình du lịch',ko:'여행 일정표',ja:'旅行日程表',zh:'旅行行程','zh-TW':'旅行行程',id:'Rencana perjalanan',ms:'Jadual perjalanan',th:'แผนการเดินทาง',es:'Itinerario de viaje',fr:'Itinéraire de voyage',ru:'Маршрут поездки'};
for(const [loc,g]of Object.entries(all)){
if(loc.startsWith('_'))continue;
g.jurisdiction.title=g.ui?.where||g.entryNotice.title;
if(hotels[loc])g.documents.rows[5].doc=hotels[loc];
g.documents.rows[7].doc=itineraries[loc];
// Keep only overrides: base-only asset and structural fields need not be duplicated.
for(const key of Object.keys(g))if(JSON.stringify(g[key])===JSON.stringify(base[key]))delete g[key];
}
base.jurisdiction.title='Where to apply — Hanoi, HCMC or Da Nang';base.documents.rows[7].doc=itineraries.en;
save(root+'/data/visa/vietnam.json',base);save(p,all);
const fp=root+'/data/facts.json',f=read(fp);delete f.lastUpdated;save(fp,f);
