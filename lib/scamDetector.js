// VoiceGuard Scam Detection Engine — v2 (Fixed Scoring + Fuzzy Match)
// Root cause of v1 failure:
//   - Normalization divided raw score by total possible → single match = 14%, below 30% threshold
//   - Exact keyword match missed speech-recognition phonetic variants (CBR vs CBI)
// v2 fixes:
//   - Direct additive scoring: each match adds weight directly, no division
//   - Critical phrase shortcut: weight >= 80 match → minimum 65% confidence immediately
//   - Fuzzy single-word matching: Levenshtein distance <= 1 for short words
//   - Massively expanded keyword variants to cover speech-to-text mishearings
//   - Individual context word scoring (stacks on top of phrase scoring)

// ─────────────────────────────────────────────
//  Fuzzy Matching Utilities
// ─────────────────────────────────────────────

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Fuzzy includes: checks if text contains the phrase, allowing 1 character edit distance
 * per word for words >= 4 characters long (handles speech-to-text mishearings like CBR->CBI)
 */
function fuzzyIncludes(text, phrase) {
  // First try exact match (fastest path)
  if (text.includes(phrase)) return true;

  // For single short keywords, do fuzzy word match
  const phraseWords = phrase.trim().split(/\s+/);
  const textWords = text.split(/\s+/);

  if (phraseWords.length === 1) {
    const pw = phraseWords[0];
    if (pw.length < 4) return textWords.includes(pw);
    // Allow 1 edit for words 4-6 chars, 2 edits for 7+ chars
    const maxDist = pw.length >= 7 ? 2 : 1;
    return textWords.some((tw) => levenshtein(tw, pw) <= maxDist);
  }

  // For multi-word phrases, check if all words appear consecutively with fuzzy match
  // Slide a window over text words
  if (phraseWords.length > textWords.length) return false;
  outer: for (let i = 0; i <= textWords.length - phraseWords.length; i++) {
    for (let j = 0; j < phraseWords.length; j++) {
      const pw = phraseWords[j];
      const tw = textWords[i + j];
      const maxDist = pw.length >= 5 ? 1 : 0;
      if (levenshtein(pw, tw) > maxDist) continue outer;
    }
    return true;
  }
  return false;
}

// ─────────────────────────────────────────────
//  Scam Type Definitions
// ─────────────────────────────────────────────

export const SCAM_TYPES = {
  DIGITAL_ARREST: {
    id: "DIGITAL_ARREST",
    name: "Digital Arrest Scam",
    shortName: "Digital Arrest",
    description:
      "Fake law enforcement (CBI/ED/Customs) threatening 'digital arrest' to extort money via video call.",
    color: "#FF3B3B",
    bgGlow: "rgba(255,59,59,0.15)",
    borderColor: "rgba(255,59,59,0.5)",
    icon: "🚨",
    severity: "CRITICAL",
    whatToDo: [
      "Hang up immediately — real agencies NEVER call like this.",
      "CBI, ED, Narcotics Bureau NEVER conduct video call arrests.",
      "Report to cybercrime.gov.in or call 1930.",
      "Do NOT share Aadhaar, screen, or pay any amount.",
    ],
    // CRITICAL phrases (weight >= 80): a SINGLE match locks 65% minimum confidence
    patterns: [
      { phrases: ["digital arrest", "digitally arrested", "digital custody", "digital detention"], weight: 95, critical: true },
      { phrases: ["arrest warrant", "warrant issued", "warrant in your name", "arrest order"], weight: 85, critical: true },
      { phrases: ["money laundering", "hawala transaction", "illegal money transfer", "black money"], weight: 65 },
      { phrases: ["stay on call", "stay on video", "don't disconnect", "do not hang up", "remain on line"], weight: 70 },
      { phrases: ["don't tell anyone", "don't call anyone", "keep this confidential", "inform nobody"], weight: 75 },
      { phrases: ["cbi officer", "ed officer", "ncb officer", "cybercrime cell", "crime branch officer", "enforcement directorate"], weight: 70 },
      { phrases: ["your aadhaar", "your aadhar", "your aadhaar number", "aadhaar linked", "aadhar card linked"], weight: 60 },
      { phrases: ["case registered against you", "fir against you", "fir filed", "case filed against"], weight: 65 },
      { phrases: ["drug trafficking", "narcotics case", "illegal parcel in your name"], weight: 60 },
      { phrases: ["supreme court order", "high court notice", "court summons"], weight: 55 },
    ],
    // Individual context words: each match adds a small amount (stacks)
    contextWords: [
      { word: "cbi", weight: 35 },
      { word: "cbr", weight: 30 }, // common speech-to-text mishearing of "CBI"
      { word: "cbc", weight: 25 },
      { word: "ncb", weight: 30 },
      { word: "arrested", weight: 30 },
      { word: "arrest", weight: 25 },
      { word: "warrant", weight: 30 },
      { word: "headquarters", weight: 20 },
      { word: "aadhaar", weight: 25 },
      { word: "aadhar", weight: 25 },
      { word: "officer", weight: 15 },
      { word: "enforcement", weight: 25 },
      { word: "bureau", weight: 15 },
      { word: "custody", weight: 20 },
      { word: "illegal", weight: 15 },
      { word: "cybercrime", weight: 25 },
    ],
    exampleScript:
      "I am calling from CBI headquarters. Your Aadhaar number has been linked to a money laundering case. An arrest warrant has been issued in your name. This is a digital arrest. Stay on video call. Do not tell anyone.",
  },

  OTP_BANK_FRAUD: {
    id: "OTP_BANK_FRAUD",
    name: "OTP / Bank Fraud",
    shortName: "OTP Fraud",
    description: "Impersonating bank customer care to steal OTP and drain accounts.",
    color: "#FF7A00",
    bgGlow: "rgba(255,122,0,0.15)",
    borderColor: "rgba(255,122,0,0.5)",
    icon: "🏦",
    severity: "HIGH",
    whatToDo: [
      "NEVER share OTP with anyone, not even your bank.",
      "Real bank employees never ask for OTP over a call.",
      "Hang up and call your bank's official number from the back of your card.",
      "Report to 1930.",
    ],
    patterns: [
      { phrases: ["share the otp", "tell me otp", "batao otp", "give me otp", "read the otp", "bata do otp"], weight: 95, critical: true },
      { phrases: ["account blocked", "account suspended", "account will be blocked", "account deactivated"], weight: 60 },
      { phrases: ["kyc update", "kyc verification", "kyc incomplete", "update your kyc", "kyc expired"], weight: 75, critical: true },
      { phrases: ["bank customer care", "calling from your bank", "bank helpline", "from the bank"], weight: 55 },
      { phrases: ["verify your account", "re-verification required", "account verification pending"], weight: 55 },
      { phrases: ["debit card blocked", "credit card suspended", "card expired"], weight: 55 },
      { phrases: ["suspicious transaction", "unauthorized transaction", "transaction blocked"], weight: 50 },
      { phrases: ["upi blocked", "net banking suspended", "mobile banking blocked"], weight: 50 },
      { phrases: ["atm pin", "card number", "cvv number", "card details"], weight: 70, critical: true },
    ],
    contextWords: [
      { word: "otp", weight: 45 },
      { word: "kyc", weight: 40 },
      { word: "bank", weight: 20 },
      { word: "account", weight: 15 },
      { word: "blocked", weight: 20 },
      { word: "verify", weight: 15 },
      { word: "sbi", weight: 25 },
      { word: "hdfc", weight: 25 },
      { word: "icici", weight: 25 },
      { word: "paytm", weight: 20 },
      { word: "transaction", weight: 15 },
    ],
    exampleScript:
      "This is SBI bank customer care. Your account is blocked due to incomplete KYC. Please share the OTP you received to unblock your account immediately.",
  },

  COURIER_CUSTOMS: {
    id: "COURIER_CUSTOMS",
    name: "Fake Courier / Customs Scam",
    shortName: "Courier Scam",
    description: "Claiming illegal items found in a package registered in your name.",
    color: "#8B5CF6",
    bgGlow: "rgba(139,92,246,0.15)",
    borderColor: "rgba(139,92,246,0.5)",
    icon: "📦",
    severity: "HIGH",
    whatToDo: [
      "Hang up — courier companies never call about illegal items.",
      "Customs officials never demand money over phone.",
      "Check the official courier site directly.",
      "Report on 1930 or nearest police station.",
    ],
    patterns: [
      { phrases: ["illegal item", "illegal drugs", "narcotics found", "drugs in parcel", "illegal goods"], weight: 85, critical: true },
      { phrases: ["your parcel", "your package", "parcel in your name", "package registered in your name"], weight: 50 },
      { phrases: ["customs department", "customs officer", "customs authority", "customs official"], weight: 60 },
      { phrases: ["passport found", "fake documents", "illegal passport", "forged documents"], weight: 75, critical: true },
      { phrases: ["registered in your name", "booked with your id", "your aadhaar on parcel"], weight: 65 },
      { phrases: ["pay fine", "clear the case", "settle the matter", "pay penalty"], weight: 65 },
      { phrases: ["arrested at airport", "customs penalty", "detained at customs"], weight: 70 },
    ],
    contextWords: [
      { word: "parcel", weight: 25 },
      { word: "package", weight: 20 },
      { word: "customs", weight: 35 },
      { word: "fedex", weight: 30 },
      { word: "dhl", weight: 30 },
      { word: "drugs", weight: 30 },
      { word: "courier", weight: 20 },
      { word: "intercepted", weight: 25 },
      { word: "detained", weight: 20 },
    ],
    exampleScript:
      "I am calling from FedEx customs department. A parcel in your name contains illegal narcotics and a forged passport. Pay a fine immediately or police will arrest you.",
  },

  INVESTMENT_FRAUD: {
    id: "INVESTMENT_FRAUD",
    name: "Fake Investment Scam",
    shortName: "Investment Fraud",
    description: "Promising guaranteed high returns through fake stock tips or Ponzi schemes.",
    color: "#10B981",
    bgGlow: "rgba(16,185,129,0.15)",
    borderColor: "rgba(16,185,129,0.5)",
    icon: "💰",
    severity: "HIGH",
    whatToDo: [
      "No legitimate investment guarantees fixed returns — it's illegal.",
      "Never join Telegram/WhatsApp 'investment groups' from strangers.",
      "Verify any investment firm on SEBI's website.",
      "Report to SEBI SCORES or 1930.",
    ],
    patterns: [
      { phrases: ["guaranteed return", "guaranteed profit", "guaranteed earning", "sure shot profit", "fixed return"], weight: 90, critical: true },
      { phrases: ["double your money", "triple your investment", "double the amount", "10x returns"], weight: 90, critical: true },
      { phrases: ["whatsapp group", "telegram group", "join our group", "signal group", "join the channel"], weight: 65 },
      { phrases: ["stock tips", "stock market tips", "insider tips", "hot tips"], weight: 60 },
      { phrases: ["crypto investment", "bitcoin investment", "forex trading", "crypto profit"], weight: 55 },
      { phrases: ["limited time", "only today", "last chance", "limited slots"], weight: 50 },
      { phrases: ["30 percent return", "20 percent monthly", "daily profit", "weekly profit"], weight: 80, critical: true },
    ],
    contextWords: [
      { word: "invest", weight: 15 },
      { word: "profit", weight: 20 },
      { word: "returns", weight: 20 },
      { word: "trading", weight: 15 },
      { word: "earning", weight: 15 },
      { word: "scheme", weight: 20 },
      { word: "advisor", weight: 15 },
    ],
    exampleScript:
      "I am a financial advisor with a guaranteed 35 percent monthly returns scheme. Join our WhatsApp group where members are already doubling their money.",
  },

  LOTTERY_PRIZE: {
    id: "LOTTERY_PRIZE",
    name: "Lottery / Prize Scam",
    shortName: "Lottery Scam",
    description: "Fake lottery wins requiring fees to release non-existent prizes.",
    color: "#FFD600",
    bgGlow: "rgba(255,214,0,0.15)",
    borderColor: "rgba(255,214,0,0.5)",
    icon: "🎰",
    severity: "MEDIUM",
    whatToDo: [
      "You cannot win a lottery you never entered.",
      "Legitimate prizes never require upfront fees.",
      "KBC, Amazon, Jio never announce winners via unsolicited calls.",
      "Report on 1930.",
    ],
    patterns: [
      { phrases: ["you have won", "you are the winner", "congratulations you won", "you are selected winner"], weight: 70 },
      { phrases: ["kbc", "kaun banega crorepati", "amazon lucky draw", "jio lottery", "flipkart lucky draw"], weight: 85, critical: true },
      { phrases: ["claim your prize", "collect your reward", "receive your prize", "collect the prize"], weight: 65 },
      { phrases: ["processing fee", "registration fee", "tax payment", "advance tax required"], weight: 85, critical: true },
      { phrases: ["1 crore", "50 lakh", "25 lakh", "cash prize", "car prize", "iphone prize"], weight: 60 },
      { phrases: ["your mobile number selected", "number selected in draw", "lucky number selected"], weight: 60 },
    ],
    contextWords: [
      { word: "lottery", weight: 35 },
      { word: "prize", weight: 25 },
      { word: "winner", weight: 25 },
      { word: "lucky", weight: 15 },
      { word: "draw", weight: 15 },
      { word: "congratulations", weight: 20 },
      { word: "reward", weight: 15 },
      { word: "crore", weight: 20 },
      { word: "lakh", weight: 15 },
    ],
    exampleScript:
      "Congratulations! Your mobile number was selected in KBC lucky draw. You have won 25 lakh rupees. Pay a small processing fee to claim your prize.",
  },

  TECH_SUPPORT: {
    id: "TECH_SUPPORT",
    name: "Fake Tech Support Scam",
    shortName: "Tech Support",
    description: "Pretending to be Microsoft/Apple to gain remote access to your device.",
    color: "#3B82F6",
    bgGlow: "rgba(59,130,246,0.15)",
    borderColor: "rgba(59,130,246,0.5)",
    icon: "💻",
    severity: "HIGH",
    whatToDo: [
      "Microsoft, Apple, Google NEVER call you about viruses.",
      "NEVER install AnyDesk or TeamViewer for an unknown caller.",
      "Giving remote access = full control of your device and bank accounts.",
      "Report to cybercrime.gov.in or 1930.",
    ],
    patterns: [
      { phrases: ["install anydesk", "install teamviewer", "install remote app", "install this software"], weight: 90, critical: true },
      { phrases: ["your computer has virus", "your device infected", "device hacked", "phone infected with virus"], weight: 80, critical: true },
      { phrases: ["microsoft support", "apple support", "google support", "windows technical support"], weight: 65 },
      { phrases: ["remote access", "remote session", "connect remotely", "we will fix remotely"], weight: 75, critical: true },
      { phrases: ["your ip address flagged", "ip address suspicious", "ip address blocked"], weight: 65 },
      { phrases: ["windows license expired", "antivirus expired", "security certificate expired"], weight: 70 },
      { phrases: ["hacker accessing your data", "data at risk", "personal data stolen"], weight: 60 },
    ],
    contextWords: [
      { word: "microsoft", weight: 30 },
      { word: "anydesk", weight: 45 },
      { word: "teamviewer", weight: 45 },
      { word: "virus", weight: 30 },
      { word: "hacker", weight: 30 },
      { word: "remote", weight: 20 },
      { word: "technician", weight: 15 },
      { word: "infected", weight: 25 },
      { word: "firewall", weight: 15 },
    ],
    exampleScript:
      "This is Microsoft technical support. We detected a serious virus on your computer. Install AnyDesk now so our technician can fix it remotely.",
  },
};

// ─────────────────────────────────────────────
//  Core Detection Engine v2
// ─────────────────────────────────────────────

/**
 * v2 Scoring Logic:
 * 1. For each pattern, fuzzy-match any of its phrases against the transcript
 * 2. If match found: add pattern weight to scam type's raw score
 * 3. If pattern is CRITICAL (weight >= 80): lock minimum confidence at 65%
 * 4. For context words: fuzzy single-word match, add word weight (capped at 100 total from context)
 * 5. Final confidence = min(100, raw_score) — NO division by max, score is direct
 * 6. Apply a mild diminishing returns curve above 80%
 */
export function analyzeTranscript(transcript) {
  if (!transcript || transcript.trim().length < 3) {
    return { topScam: null, scores: {}, overallConfidence: 0, isScam: false, matchedPhrases: [] };
  }

  const text = transcript.toLowerCase().trim();
  const scores = {};
  const allMatchedPhrases = [];

  for (const [typeId, scamType] of Object.entries(SCAM_TYPES)) {
    let rawScore = 0;
    let criticalMatch = false;
    const matchedPhrases = [];

    // ── Phrase pattern matching ──
    for (const pattern of scamType.patterns) {
      for (const phrase of pattern.phrases) {
        if (fuzzyIncludes(text, phrase.toLowerCase())) {
          rawScore += pattern.weight;
          matchedPhrases.push(phrase);
          if (pattern.critical) criticalMatch = true;
          break; // one match per pattern pattern is enough
        }
      }
    }

    // ── Context word scoring (single words, stacks up to 100) ──
    let contextScore = 0;
    for (const cw of (scamType.contextWords || [])) {
      if (fuzzyIncludes(text, cw.word.toLowerCase())) {
        contextScore += cw.weight;
        if (!matchedPhrases.includes(cw.word)) matchedPhrases.push(cw.word);
      }
    }
    rawScore += Math.min(100, contextScore);

    // ── Multi-match bonus ──
    const matchCount = matchedPhrases.length;
    if (matchCount >= 3) rawScore += 15;
    if (matchCount >= 5) rawScore += 15;

    // ── Compute confidence ──
    let confidence;
    if (criticalMatch) {
      // Critical phrase hit → floor at 65%, then add extra from raw score
      confidence = Math.max(65, Math.min(100, rawScore));
    } else {
      // No critical match — direct raw score but capped at 100
      confidence = Math.min(100, rawScore);
    }

    scores[typeId] = { confidence, matchedPhrases, rawScore, criticalMatch };
    allMatchedPhrases.push(...matchedPhrases);
  }

  // ── Pick top scam type ──
  let topScamId = null;
  let topScore = 0;
  for (const [typeId, result] of Object.entries(scores)) {
    if (result.confidence > topScore) {
      topScore = result.confidence;
      topScamId = typeId;
    }
  }

  const SCAM_THRESHOLD = 25; // Lower threshold: catch more real scams, miss fewer
  const isScam = topScore >= SCAM_THRESHOLD;

  return {
    topScam: isScam ? SCAM_TYPES[topScamId] : null,
    topScamScore: topScore,
    scores,
    overallConfidence: topScore,
    isScam,
    matchedPhrases: [...new Set(allMatchedPhrases)],
  };
}

/**
 * Returns a human-readable threat level.
 */
export function getThreatLevel(confidence) {
  if (confidence >= 75) return { label: "CRITICAL THREAT", color: "#FF3B3B" };
  if (confidence >= 50) return { label: "HIGH THREAT", color: "#FF7A00" };
  if (confidence >= 25) return { label: "SUSPICIOUS", color: "#FFD600" };
  return { label: "MONITORING", color: "#7070A0" };
}
