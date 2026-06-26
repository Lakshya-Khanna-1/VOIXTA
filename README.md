# VoiceGuard — AI Scam Call Detector (Prototype v0.1)

Real-time AI-powered scam call detection. Speak like a scammer. Watch it get caught. Zero data leaves your device.

## Quick Start

### Mac / Linux
```bash
chmod +x setup.sh && ./setup.sh
```

### Windows
Double-click `setup.bat`

Open: **http://localhost:3000** in Chrome or Edge.

## Manual Start
```bash
npm install
npm run dev
```

## What It Detects

| Scam | Type |
|------|------|
| 🚨 Digital Arrest | CBI/ED fake arrest threats |
| 🏦 OTP / Bank Fraud | Fake bank KYC calls |
| 📦 Courier Scam | Fake customs/FedEx calls |
| 💰 Investment Fraud | Guaranteed returns schemes |
| 🎰 Lottery Scam | KBC/Amazon fake prizes |
| 💻 Tech Support | Fake Microsoft/Apple calls |

## How to Use

- **Voice Mode:** Click mic → speak a scam script → watch it get flagged
- **Text Mode:** Paste any scam script → click Analyze
- **Example Scripts:** Click any of the 6 presets to test instantly

## Tech Stack

- Next.js 14 (App Router)
- React 18 + Tailwind CSS
- Web Speech API (on-device transcription)
- Web Audio API + Canvas (waveform)

## Privacy

No audio recorded. No data sent anywhere. All AI runs in your browser.

## Browser Support

Chrome and Edge only for voice mode (Web Speech API).
Firefox/Safari → use Text Mode.

## Report Real Scams

- Website: cybercrime.gov.in
- Helpline: **1930**
