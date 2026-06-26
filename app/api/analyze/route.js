import { NextResponse } from "next/server";

const SCAM_KEYWORDS = {
  DIGITAL_ARREST: ["digital arrest","arrest warrant","cbi","money laundering","stay on call","don't tell anyone","ncb officer","ed officer"],
  OTP_BANK_FRAUD: ["share the otp","otp","account blocked","kyc update","bank customer care","verify your account","atm pin"],
  COURIER_CUSTOMS: ["illegal item","customs department","parcel in your name","drugs found","fedex","dhl","fine amount"],
  INVESTMENT_FRAUD: ["guaranteed return","double your money","whatsapp group","stock tips","crypto investment","sure shot profit"],
  LOTTERY_PRIZE: ["you have won","lucky draw","kbc","claim your prize","processing fee","amazon lucky draw"],
  TECH_SUPPORT: ["install anydesk","remote access","microsoft support","your computer has virus","ip address flagged"],
};

export async function POST(request) {
  try {
    const { transcript } = await request.json();
    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }
    const text = transcript.toLowerCase();
    const scores = {};
    for (const [type, keywords] of Object.entries(SCAM_KEYWORDS)) {
      let hits = 0;
      const matched = [];
      for (const kw of keywords) {
        if (text.includes(kw)) { hits++; matched.push(kw); }
      }
      scores[type] = {
        confidence: Math.min(100, Math.round((hits / keywords.length) * 100 * 2.5)),
        matched,
      };
    }
    const topEntry = Object.entries(scores).sort((a, b) => b[1].confidence - a[1].confidence)[0];
    return NextResponse.json({
      isScam: topEntry[1].confidence >= 30,
      topScamType: topEntry[0],
      topConfidence: topEntry[1].confidence,
      scores,
      matchedPhrases: topEntry[1].matched,
    });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
