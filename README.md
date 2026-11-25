# Voixta

Voixta analyzes a spoken call sample or pasted SMS in your browser. It shows warning signs, distinguishes suspicious requests from common safety advice, and suggests what to verify. The secondary family rehearsal covers hanging up, telling someone you trust, and verifying independently.

## Run locally

Use Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

`npm run build` exports a static site to `out/`. Serve that directory with any static file server or deploy its contents to Embarko. Speech input needs HTTPS or localhost and microphone permission.

## Detection

- The detector uses a trained linear classifier with word and character features, alongside checks for explicit requests, threats, secrecy, and precautions. Its three verdicts describe evidence in the sample. Caller and sender identities need independent verification.
- For ambiguous English text without a concrete demand, quantized [DeBERTa natural-language inference](https://huggingface.co/Xenova/nli-deberta-v3-xsmall) checks whether the sentence gives safety advice. The browser downloads and runs the model locally. When it is unavailable or uncertain, the previous cautious verdict is retained.
- Speech transcription runs in the browser with quantized [Whisper Tiny](https://huggingface.co/onnx-community/whisper-tiny) for English and the [Hinglish Whisper Tiny fine-tune](https://huggingface.co/MaybeSomeone19/whisper-tiny-hinglish-onnx) for Hindi. The Hindi model produces Roman-script transcripts. The first recording in a language may need a model download. Audio and messages are processed locally.
- The classifier was trained on 1,068 English, Hindi and Hinglish rows from the CC BY 4.0 [Indian Scam SMS Synthetic Audited dataset](https://huggingface.co/datasets/Ridham115/indian-scam-sms-synthetic-audited). A stratified 267-row synthetic holdout for the classifier had 120 true negatives, 126 true positives, 13 false positives and 8 false negatives. These numbers precede the context checks and do not measure real-world fraud or live call performance.
- Run the regression checks with `node model/detector.test.mjs`. Regenerate the weights with `python model/train.py` after installing scikit-learn.

The rehearsal call is fictional. Its prevention guidance is based on [CERT-In’s advisory](https://www.csk.gov.in/documents/CERT-In-AI-Booklet-NCSAM-2026.pdf) and [the Department of Telecommunications’ reporting guidance](https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2067113). The practice voices were synthesized with [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M). The font licenses are in `public/fonts/`.
