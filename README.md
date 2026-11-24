# Voixta

Voixta is a three-minute scam-call rehearsal for two people. Practise ending a suspicious call, telling someone you trust, and verifying the caller independently. The web app offers English and Hindi, a captions-only mode, and a downloadable family call plan.

## Run locally

Use Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

`npm run build` exports a static site to `out/`. Serve that directory with any static file server or deploy its contents to Embarko. The rehearsal uses bundled audio and runs without accounts, microphone access, or an AI service.

The call is fictional. Its prevention guidance is based on [CERT-In’s advisory](https://www.csk.gov.in/documents/CERT-In-AI-Booklet-NCSAM-2026.pdf) and [the Department of Telecommunications’ reporting guidance](https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2067113). The English and Hindi practice voices were synthesized with [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M). The font licenses are in `public/fonts/`.
