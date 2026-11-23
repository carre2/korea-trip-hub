#!/usr/bin/env bash
# Kira lifestyle posts: 4:5 image(s) -> slow-zoom 1080x1350 video + original music + persistent virtual-character label.
set -e
IMG="/g/내 드라이브/AI influencer #2/01. Kira Avatar/2. Lifestyle/2026-12"
MUS=../music
LABEL="drawtext=fontfile=segoeui.ttf:text='AI virtual character':x=36:y=h-70:fontsize=30:fontcolor=white@0.9:box=1:boxcolor=black@0.35:boxborderw=10"
one() { # out img music secs
  local fr=$(( $4 * 30 ))
  ffmpeg -y -loglevel error -i "$IMG/$2.jpg" -i "$MUS/$3.m4a" -filter_complex \
   "[0:v]scale=2160:2700,zoompan=z='1+0.06*on/$fr':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$fr:s=1080x1350:fps=30,$LABEL,format=yuv420p[v];[1:a]atrim=0:$4,afade=t=out:st=$(( $4 - 1 )):d=1[a]" \
   -map "[v]" -map "[a]" -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 160k -movflags +faststart -t $4 "$1.mp4"
}
two() { # out imgA imgB music  (5s + 5s, 0.6s crossfade)
  ffmpeg -y -loglevel error -i "$IMG/$2.jpg" -i "$IMG/$3.jpg" -i "$MUS/$4.m4a" -filter_complex \
   "[0:v]scale=2160:2700,zoompan=z='1+0.05*on/150':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1080x1350:fps=30[a0];\
    [1:v]scale=2160:2700,zoompan=z='1+0.05*on/150':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1080x1350:fps=30[b0];\
    [a0][b0]xfade=transition=fade:duration=0.6:offset=4.4,$LABEL,format=yuv420p[v];[2:a]atrim=0:9.4,afade=t=out:st=8.4:d=1[a]" \
   -map "[v]" -map "[a]" -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 160k -movflags +faststart -t 9.4 "$1.mp4"
}
one l1124_t02_mama        kira_t02 cheerful_c_marimba_124 8
one l1126_t03_meringue    kira_t03 cheerful_d_whistle_104 8
one l1128_t01_scarf       kira_t01 cheerful_f_marimba_swing_112 8
one l1129_t04_pizzaseolgi kira_t04 cheerful_a_uke_120 8
one l1201_d10_kimjang     kira_d10 cheerful_c_marimba_124 8
one l1203_t05_skincare    kira_t05 cheerful_e_chip_128 8
two l1205_d02d03_snacks   kira_d02 kira_d03 cheerful_a_uke_120
one l1206_t06_musical     kira_t06 cheerful_b_uke_116 8
