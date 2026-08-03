# Native-speaker review sheets

Machine-assisted UI translations that should be checked by a native speaker for fluency.
The verifier (`npm run verify:i18n`) guarantees structure and that numbers/facts are preserved,
but it can't judge fluency — that's what these sheets are for.

## How to use
1. Regenerate anytime: `npm run review:export` (or `node scripts/export-review.mjs hi ar bn`).
2. Upload a `<locale>.csv` to Google Sheets (File → Import → Upload). UTF-8 is preserved (BOM included).
3. Ask a native speaker to fix the wording in the **"Reviewer fix"** column (leave blank if the current text is fine).
4. Paste the approved fixes back into `messages/<locale>.json` at the matching `key`.
5. Run `npm run verify:i18n` and deploy.

## Columns
`key` · `English (source)` · `<locale> (current)` · **`Reviewer fix`** · `Notes`

## Priority for review
Recommended first: **hi, ar, bn** (non-Latin, lower machine confidence), then **tr, fil, ms, vi, th, id**.
Higher-confidence (still welcome to review): ja, zh, ko, es, fr, de, pt, it, ru.
