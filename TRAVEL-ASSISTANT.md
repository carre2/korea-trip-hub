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
