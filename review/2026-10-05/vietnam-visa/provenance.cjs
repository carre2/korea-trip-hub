const fs=require('fs');const p='C:/Users/user/Documents/Codex/korea-trip-hub/data/facts.json';const d=JSON.parse(fs.readFileSync(p,'utf8'));const by=id=>d.facts.find(f=>f.id==='visa-vietnam-'+id);
by('fees').sources.push({name:'Korean Embassy · Vietnamese reciprocal visa fees',url:'https://overseas.mofa.go.kr/us-en/brd/m_4502/view.do?page=1&seq=715889'});
by('jeju').sources=[{name:'Korean Embassy · Jeju eligibility and mainland restrictions',url:'https://overseas.mofa.go.kr/gr-en/brd/m_22348/view.do?seq=59'}];
by('jurisdiction').notes='Da Nang Vietnamese FAQ names Hue, Da Nang and Quang Ngai; residence exceptions need proof. Hanoi guidance covers Quang Tri northwards. Confirm current province coverage and appointment requirements with the receiving office.';
by('transit').notes='Official notice dated 2026-03-31. Qualifying US/Canada/Australia/New Zealand or specified European documents, onward ticket within 30 days, permitted route, visa verification, immigration history and stopover limits all apply. Japan alone is not listed. This is not a general visa waiver for a Vietnam–Korea return trip.';
fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
