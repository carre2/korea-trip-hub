import sharp from "sharp";
import path from "path";
const SRC = "C:/Users/minho/AppData/Local/Temp/claude/C--Users-minho--claude/d018befe-0c18-4ccd-a9c3-73d003fa7c7d/scratchpad/orig";
const DST = "C:/Users/minho/Projects/korea-trip-hub/public/img/dest";
const slugs = ["seomun-market","apsan-park","mudeungsan","gwangju-museum","hahoe-village","byeongsan-seowon"];
for (const s of slugs){
  const info = await sharp(path.join(SRC, s+".jpg"))
    .resize(1280,853,{fit:"cover",position:"attention"})
    .jpeg({quality:82,mozjpeg:true})
    .toFile(path.join(DST, s+".jpg"));
  console.log(s.padEnd(18), info.width+"x"+info.height, Math.round(info.size/1024)+"KB");
}
