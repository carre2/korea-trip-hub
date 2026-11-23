#!/usr/bin/env bash
# 12/07-12/21 lifestyle videos (same recipe as build_lifestyle.sh)
set -e
source <(sed -n '/^IMG=/,/^}$/p;/^two()/,/^}$/p' build_lifestyle.sh)
one l1207_d08_subway        kira_d08 cheerful_c_marimba_124 8
two l1208_d04d05_nightshift kira_d04 kira_d05 cheerful_d_whistle_104
one l1209_d11_jjimjilbang   kira_d11 cheerful_e_chip_128 8
one l1211_d06_lantern       kira_d06 cheerful_a_uke_120 8
one l1212_t07_myeongdong    kira_t07 cheerful_b_uke_116 8
one l1214_d16_hanokcafe     kira_d16 cheerful_d_whistle_104 8
two l1215_d14d15_model      kira_d14 kira_d15 cheerful_e_chip_128
one l1217_d13_bank          kira_d13 cheerful_a_uke_120 8
one l1218_d23_postoffice    kira_d23 cheerful_b_uke_116 8
one l1220_d21_bukhansan     kira_d21 cheerful_d_whistle_104 8
one l1221_d19_cooking       kira_d19 cheerful_e_chip_128 8
