#!/usr/bin/env bash
# R1 reel "8 years of notes -> one site" (1080x1920, 30fps), from live-site screenshots in raw/.
# Captions stay inside the reels safe zone (memory: text <= y1400, width <= 820).
set -euo pipefail
cd "$(dirname "$0")"
# Fonts copied next to this script: a Windows drive-letter path breaks ffmpeg's filter parser.
F="segoeuib.ttf"
FR="segoeui.ttf"
BG="0x0d0f16"
mkdir -p seg
enc=(-r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -an)

card () { # out, seconds, line1, line2, line3(small)
  ffmpeg -v error -y -f lavfi -i "color=c=${BG}:s=1080x1920:d=$2" -vf \
"drawtext=fontfile=$F:text='$3':fontcolor=white:fontsize=92:x=(w-tw)/2:y=760,\
drawtext=fontfile=$F:text='$4':fontcolor=0x2BC7B2:fontsize=92:x=(w-tw)/2:y=880,\
drawtext=fontfile=$FR:text='$5':fontcolor=0xC9D0E0:fontsize=44:x=(w-tw)/2:y=1040,\
fade=t=in:st=0:d=0.3" "${enc[@]}" "seg/$1.mp4"
}

pan () { # out, image, seconds, scroll_px, caption
  ffmpeg -v error -y -loop 1 -t "$3" -i "raw/$2.png" -vf \
"scale=1080:-1,crop=1080:1920:0:'min(ih-1920\,t/$3*$4)',\
drawbox=x=130:y=1230:w=820:h=150:color=black@0.62:t=fill,\
drawtext=fontfile=$F:text='$5':fontcolor=white:fontsize=50:x=(w-tw)/2:y=1280" "${enc[@]}" "seg/$1.mp4"
}

# Kira is a virtual persona: never imply she built the site. Relation shown on the end card.
card s1 2.5 "What I’d tell" "a friend in Seoul" "visa · first day · food · festivals"
pan  s2 home      3   900  "It’s all on one free site"
pan  s3 report    3.5 1700 "Type a place → instant report"
pan  s4 visa      3   1300 "Visa notes + official sources"
pan  s5 festivals 2.5 900  "Festivals, food, first day"
card s6 3 "Link in bio" "ktriphub.com" "free · run by the team behind Kira"

printf "file '%s.mp4'\n" s1 s2 s3 s4 s5 s6 > seg/list.txt  # paths are relative to list.txt
ffmpeg -v error -y -f concat -safe 0 -i seg/list.txt \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k -shortest r1_kira_intro.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 r1_kira_intro.mp4
