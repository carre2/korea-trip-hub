#!/usr/bin/env bash
# 5 slides (1080x1350) -> 16s slideshow, slideleft xfade, original music, -16 LUFS track already.
set -e
mk() { d=$1; mus=$2; out=$3
  ffmpeg -y -loglevel error $(for i in 1 2 3 4 5; do echo -loop 1 -t 3.6 -i $d/${d}_slide$i.png; done) -i ../music/$mus.m4a -filter_complex \
  "[0:v]format=yuv420p,setsar=1[v0];[1:v]format=yuv420p,setsar=1[v1];[2:v]format=yuv420p,setsar=1[v2];[3:v]format=yuv420p,setsar=1[v3];[4:v]format=yuv420p,setsar=1[v4];\
   [v0][v1]xfade=transition=slideleft:duration=0.5:offset=3.1[x1];[x1][v2]xfade=transition=slideleft:duration=0.5:offset=6.2[x2];\
   [x2][v3]xfade=transition=slideleft:duration=0.5:offset=9.3[x3];[x3][v4]xfade=transition=slideleft:duration=0.5:offset=12.4,fps=30[v];\
   [5:a]atrim=0:16,afade=t=out:st=15:d=1[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart -t 16 $out
}
mk c2 cheerful_e_chip_128 c2/c2_kvac_checklist_music.mp4
mk r4 cheerful_b_uke_116 r4/r4_airport_music.mp4
