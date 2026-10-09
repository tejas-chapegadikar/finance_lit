Narration scripts for the 12 lesson explainer videos, written for InVideo AI's script-to-video flow (or any similar AI video tool — HeyGen, Synthesia, Pictory, etc. all accept the same scene + narration format).

## How to use these

1. Open InVideo AI → "Script to video" (or equivalent).
2. Paste one file's **Narration** lines (just the spoken text, scene by scene) into the script box.
3. Use the **Visual** notes as your own scene-by-scene direction if the tool asks you to guide/edit each generated scene, or as B-roll/stock-footage search terms.
4. Target length is intentionally short (75–100 seconds) — this is a hook-and-highlights explainer that complements the full written lesson already in the app, not a narration of the entire markdown text.
5. Videos aren't part of V1, so the app has no place for them yet. If they come back, a video field gets added to the lessons in `prisma/content/level1.ts` and the database is reseeded.

## Shared style notes for every video

- **Tone:** upbeat, direct, peer-to-peer — like a smart senior explaining it to a junior, not a bank ad.
- **Audience:** Indian college students, most with little to no income yet.
- **Visual language:** match the app's brand — violet/indigo gradients, orange accent for money/XP, rounded friendly shapes, ₹ amounts on screen wherever a number is spoken.
- **Always end** on the same CTA beat (see each script's final scene): drive back to the app to take the quiz.

## Files

| Script | Lesson slug |
|---|---|
| 01-budgeting-basics.md | budgeting-basics |
| 02-compound-interest.md | compound-interest |
| 03-saving-vs-spending-psychology.md | saving-vs-spending-psychology |
| 04-upi-payment-safety.md | upi-payment-safety |
| 05-bank-accounts-savings-instruments.md | bank-accounts-savings-instruments |
| 06-credit-score-cibil.md | credit-score-cibil |
| 07-credit-cards-101.md | credit-cards-101 |
| 08-income-tax-basics.md | income-tax-basics |
| 09-investing-basics.md | investing-basics-stocks-mutual-funds-fds |
| 10-sip-starting-early.md | sip-starting-early |
| 11-insurance-basics.md | insurance-basics |
| 12-common-financial-scams-india.md | common-financial-scams-india |
