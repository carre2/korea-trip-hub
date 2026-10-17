# Travel assistant — 2026-10-17

- Floating chat supports all 12 site languages. It finds guides, opens editable itinerary templates, and links to Stay22 hotel searches / Klook activity searches.
- Route destinations are controlled by lib/travel-assistant.mjs. Model output cannot introduce a new clickable URL.
- Itinerary previews use the existing trip query format and do not overwrite a saved trip until the visitor explicitly saves.
- Booking remains on the partner website. The assistant does not quote live prices or complete bookings.
- Do not infer passport nationality from language. No visa rules are supplied to the model; send visitors to maintained guides.
- The OpenAI key is server-only: local .env.local and Cloudflare OPENAI_API_KEY secret. Never commit or copy it to the static export or Drive mirror.
- OpenAI Responses uses store:false. The UI discloses AI processing and requests no personal/payment details. No chat text is sent to analytics.
- Same-origin JSON requests, 24KB body cap, bounded history, and Cloudflare per-location rate limit (10/minute/IP). This is abuse mitigation, not a global spending cap.
- Verification: node scripts/test-chat-provider.mjs; npm run build. Live OpenAI-only calls passed in Korean, Indonesian and Vietnamese.
- Facts ledger unchanged: navigation only, no new immigration or booking claims.

## PC and mobile-width QA — 2026-10-17
- Chrome desktop: live assistant generated a Seoul itinerary, opened its preview, saved it, and retained the saved itinerary after reload.
- Built site at 390px and 320px in an iframe harness: same-page itinerary selection works; save survives reload; same-locale guide navigation retains the conversation and booking actions.
- Stay22 links reached Seoul search results on Booking.com (desktop) and Expedia (mobile-width), including affiliate parameters. No reservation or payment was made. Dates and guests must be selected/confirmed on the partner site.
- Fixed internal navigation remounts, homepage itinerary selection, initial focus stealing, mobile panel/input sizing, touch close control, and assistant booking analytics placement.
- Mobile viewport resizing was unavailable in the browser extension, so responsive iframe testing was used. Physical phone, Safari and on-screen keyboard behavior remain unverified; visualViewport handling is implemented.
- Full build and all six chat-provider tests passed. Facts ledger unchanged.

## Keyboard-visible-area QA — 2026-10-17
- Compact mode follows visualViewport height, not only CSS media-query height; supports keyboard pan offset and short landscape screens. Composer remains outside the scrolling transcript. Disclosures remain readable in the transcript instead of being hidden.
- Mobile submit blurs the input so the OS can dismiss the keyboard. Safe-area bottom padding retained.
- Browser tests: 390x400, 320x320, 844x260 and restoration to 390x844. Input bottom positions stayed inside each viewport; focused input followed by hotel action opened a partner tab. At 844x260 the input bottom was 244px and the booking link occupied 65–117px.
- node scripts/test-chat-viewport.mjs verifies bounds for visualViewport offsets and heights down to 180px; chat-provider tests and full build passed.
- This is a reduced-viewport simulation, not an attached phone or a real OS keyboard. iOS Safari keyboard animations, Android IME and pinch zoom remain unverified. No mobile device is exposed by current browser tools.
- Facts ledger unchanged.

## Preference interview — 2026-10-17
- Planning asks destination, timing/duration, companions, interests, pace and lodging constraints before offering itinerary/booking actions. One or two questions per turn, with localized answer chips and free-text/undecided answers.
- Confirm the summarized brief before recommendations. Asking/confirming responses have itinerary, planner and booking actions removed server-side. Direct guide/hotel lookup does not force a full survey.
- Preferences are bounded, allowlisted fields carried in memory across same-locale navigation; no persistence or analytics collection. Restart clears the brief and conversation. The AI/provider privacy disclosure applies to questionnaire answers too.
- Existing saved itinerary templates remain templates, not generated custom routes. Recommendations explain fit and required edits; no live room prices/availability claims. Area-specific Stay22 links use site-owned destinations and the existing affiliate ID.
- Editorial area fit is copied from data/stay.json into lib/assistant-stay-context.mjs; a regression test detects drift.
- Live Korean dialogue passed asking → confirming → ready with a Seoul/cafes/shopping/Hongdae hotel brief. Full build, localization/SEO verification and provider tests passed. Facts ledger unchanged.
