#!/usr/bin/env bash
# 4:5 (1080x1350) variant: Business Suite feed composer only accepts 4:5-16:9 for an Instagram-only account.
# R1 reel "8 years of notes -> one site" (1080x1920, 30fps), from live-site screenshots in raw/.
# Captions stay inside the reels safe zone (memory: text <= y1400, width <= 820).
set -euo pipefail
cd "$(dirname "$0")"
# Fonts copied next to this script: a Windows drive-letter path breaks ffmpeg's filter parser.
F="segoeuib.ttf"
FR="segoeui.ttf"
BG="0x0d0f16"
mkdir -p seg45
enc=(-r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -an)

card () { # out, seconds, line1, line2, line3(small)
  ffmpeg -v error -y -f lavfi -i "color=c=${BG}:s=1080x1350:d=$2" -vf \
"drawtext=fontfile=$F:text='$3':fontcolor=white:fontsize=92:x=(w-tw)/2:y=470,\
drawtext=fontfile=$F:text='$4':fontcolor=0x2BC7B2:fontsize=92:x=(w-tw)/2:y=590,\
drawtext=fontfile=$FR:text='$5':fontcolor=0xC9D0E0:fontsize=44:x=(w-tw)/2:y=750,\
fade=t=in:st=0:d=0.3" "${enc[@]}" "seg45/$1.mp4"
}

pan () { # out, image, seconds, scroll_px, caption
  ffmpeg -v error -y -loop 1 -t "$3" -i "raw/$2.png" -vf \
"scale=1080:-1,crop=1080:1350:0:'min(ih-1350\,t/$3*$4)',\
drawbox=x=130:y=1110:w=820:h=150:color=black@0.62:t=fill,\
drawtext=fontfile=$F:text='$5':fontcolor=white:fontsize=50:x=(w-tw)/2:y=1160" "${enc[@]}" "seg45/$1.mp4"
}

# Kira is a virtual persona: never imply she built the site. Relation shown on the end card.
card s1 2.5 "What I’d tell" "a friend in Seoul" "visa · first day · food · festivals"
pan  s2 home      3   900  "It’s all on one free site"
pan  s3 report    3.5 1700 "Type a place → instant report"
pan  s4 visa      3   1300 "Visa notes + official sources"
pan  s5 festivals 2.5 900  "Festivals, food, first day"
card s6 3 "Link in bio" "ktriphub.com" "free · run by the team behind Kira"

printf "file '%s.mp4'\n" s1 s2 s3 s4 s5 s6 > seg45/list.txt  # paths are relative to list.txt
ffmpeg -v error -y -f concat -safe 0 -i seg45/list.txt \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k -shortest r1_kira_intro_4x5.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 r1_kira_intro_4x5.mp4
