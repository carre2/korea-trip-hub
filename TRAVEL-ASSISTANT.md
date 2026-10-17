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
- Mobile survey UI verified against the deployed API: city answer chip advances to travel dates/duration; restart is visible. Latest-answer scrolling now anchors the start of the question, so long choices/disclosures do not hide the question on short screens.

## Generated custom itineraries — 2026-10-17
- Supersedes the template-only limitation above: after the preference interview and confirmation, the assistant produces a new structured itinerary with up to 14 days, lodging base per day, rationale, ordered catalog places, suggested periods/activities, meals/rest and arrival/departure notes.
- Known place/base IDs only; reject unknown locations, cross-city day/base mismatches, duplicate daily stops, oversized fields and arbitrary URLs. No invented journey duration, opening hours, room availability or prices. Actual directions are checked in Google Maps; this is not a shortest-route engine.
- CustomTripWorkspace supports area changes, stop reorder/removal, derived per-leg and return directions, area-specific Stay22 affiliate searches, explicit local save and restoration in home My Trip. Replacing a custom save is disclosed. Existing template saves stay separate.
- Saved key: kth_custom_trip_v1. Survey data stays in conversation memory; the visitor's saved itinerary includes the generated brief. The API receives the current bounded itinerary for follow-up revisions. Save/affiliate events carry generic identifiers, not the travel brief.
- Catalog snapshot is derived from data/destinations.json and data/stay.json; test-custom-trip detects source drift. Twelve locales have UI labels. Facts ledger unchanged.
- Validation: live Korean survey/confirmation generated 4 days with Hongdae bases. Browser verified generation, save, reload restoration, changing second-day base to Insadong/Jongno, reordered places and corresponding URL updates. Responsive iframe at 320px and 390px showed no horizontal card overflow; not a physical-device test.
- One browser generation attempt failed; retry returned a valid four-day plan. This remains an external-provider reliability limitation, and errors do not create or overwrite saved plans. Full build, localization, SEO and focused tests passed before deployment.
- Production deployed and returned a validated four-day Hongdae itinerary. A separate probe returned an extra clarification question despite populated preferences; the interview remains model-driven and can still ask follow-up questions. Do not claim deterministic interview completion.
- Safe provider diagnostics log only provider name and a fixed error code (timeout/invalid response/provider status), never user text, full model output or credentials.
- Browser opened the Stay22 Insadong/Jongno affiliate link and verified Booking.com selected Jongno-gu; dates and occupancy remain for the visitor to confirm there.

## Localized welcome — 2026-10-17
- Clicking the guide opens an immediate, locally rendered welcome and asks what the visitor would like to know, in all 12 supported page languages. No API request or message transmission is needed for the greeting.
- Welcome precedes the emergency notice on an empty conversation; existing conversations remain intact when closed/reopened. Topic buttons continue into the existing survey/navigation flow.
- Language behavior is unchanged: root entry prefers saved explicit choice, then browser language, country fallback, then English. Explicit locale URLs and manual selection are honored. Language is not proof of passport nationality; no nationality-based eligibility assumptions.
- Facts ledger unchanged. Entry-language regression tests and full build/localization/SEO verification required before release.
- Release verification: build and entry-language tests passed; Chrome UI confirmed Indonesian and Vietnamese welcome/question text immediately on guide click. Screenshot: review/2026-10-17/welcome-indonesian.png.

## Spoken guide welcome — 2026-10-17
- Guide opening invokes browser speech synthesis directly in the user's click handler, reading localized welcome + opening question. No speech on page load; no microphone or API key needed. Browser/OS speech services may vary by device.
- Mute immediately cancels and persists kth-guide-muted in localStorage. Unmute enables future playback; Replay explicitly starts again. Closing, Escape, navigation, hiding the tab, sending a question and unmount stop this guide's speech.
- Matching language voice required, with separate simplified/traditional Chinese matching. Missing/blocked voice shows localized text fallback and keeps chat usable. Voices are warmed on mount and re-read on every replay, so later-loaded voices can be used. No fabricated cross-language voice fallback.
- Greeting speech only; assistant replies are not automatically read. Text and actual synthesis start/end/error state remain visible. Unit tests cover matching, replay cancellation, stale events and unsupported browser fallback. Facts ledger unchanged.

Voice QA: production build passed on 2026-10-17. Chrome UI checks passed for opening the guide, replay control, mute disabling replay, and mute persistence after reload; Indonesian UI labels also checked. Responsive iframe checks at 390x400 and 320x320 retained voice controls and input. Speech loading state was observed, but a sustained speech-start state and audible output were not independently confirmed by the automation environment. Physical Android/iOS audio and keyboard testing remains manual; do not describe responsive checks as physical-device validation. Unit tests cover language selection, cancellation/stale callbacks, and unsupported API fallback. Travel facts unchanged.

## Announcer-style recordings — 2026-10-17
Supersedes device speech synthesis above. User approved reuse of the existing OpenAI key. Generated 12 static MP3 greetings with gpt-4o-mini-tts / marin, requesting clear articulation, calm broadcast-announcer delivery and restrained warmth, without impersonating a person. The exact localized welcome and question are recorded in data/guide-audio.json. No visitor-time AI call, credential, microphone or device voice is required. AI-generated voice disclosure is localized in the controls.

Generate with `node --env-file=.env.local scripts/generate-guide-audio.mjs`; content/config hashes prevent unnecessary regeneration. Never print credentials. Changed greeting text requires regenerating audio and running scripts/test-greeting-audio.mjs. Only generated audio and public metadata ship to the browser.

Audio uses a DOM media element with click-triggered playback, persisted mute, replay from zero, close/navigation/question/tab-hide cancellation, rejection/error feedback and startup timeout. No fallback to an unrelated device voice.

Validation: 12 MP3 files parsed by ffprobe, Korean decoded with non-silent waveform; focused tests and full build passed. Chrome PC and responsive 320x320/390x400 checks observed playing media and advancing currentTime, mute pauses/reset to zero, replay starts again, and closing stops playback. Korean, Vietnamese and Indonesian selected their matching MP3s. Physical Android/iOS and subjective native-speaker voice quality remain unverified. Facts ledger unchanged.
