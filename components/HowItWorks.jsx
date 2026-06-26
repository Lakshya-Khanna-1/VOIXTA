"use client";

const STEPS = [
  {
    number: "01",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
      </svg>
    ),
    title: "Audio Captured Locally",
    description: "The moment a call comes in, the on-device model starts listening to the caller's voice. Zero bytes of audio are ever sent to any server.",
    color: "#3B82F6",
  },
  {
    number: "02",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    ),
    title: "Speech Transcribed On-Device",
    description: "The Web Speech API converts the caller's voice to text in real-time, entirely within your browser. No cloud transcription service involved.",
    color: "#8B5CF6",
  },
  {
    number: "03",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
    ),
    title: "Pattern Engine Fires",
    description: "The transcript is instantly matched against 60+ weighted scam phrase patterns across 6 scam categories — Digital Arrest, OTP Fraud, Courier Scam, Investment Fraud, Lottery, and Tech Support.",
    color: "#FF7A00",
  },
  {
    number: "04",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    title: "Verdict in Under 8 Seconds",
    description: "A confidence score from 0–100% is calculated. Above 30% triggers a Suspicious warning. Above 75% fires a Critical Threat alert with the exact scam type identified.",
    color: "#FF3B3B",
  },
];

const PRIVACY_POINTS = [
  { icon: "🔒", text: "No audio recording stored anywhere" },
  { icon: "📡", text: "No data sent to any server" },
  { icon: "🧠", text: "All AI runs inside your browser" },
  { icon: "🗑️", text: "Transcript cleared when you reset" },
  { icon: "👁️", text: "No account or login required" },
  { icon: "⚡", text: "Works offline after first page load" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6" style={{ background: "rgba(13,13,24,0.4)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono font-semibold tracking-wider mb-4" style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.2)", color: "#8B5CF6" }}>
            UNDER THE HOOD
          </div>
          <h2 className="text-4xl font-black text-text mb-4">How VoiceGuard Works</h2>
          <p className="text-textDim max-w-xl mx-auto">
            Built for privacy first. The detection model runs entirely on your device. Your voice never leaves your phone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="relative rounded-2xl p-6 transition-all duration-300 overflow-hidden"
              style={{ background: "#12121F", border: "1px solid #1E1E35" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = step.color + "50"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1E1E35"; }}
            >
              <div className="absolute top-4 right-4 text-6xl font-black opacity-5 select-none" style={{ color: step.color }}>
                {step.number}
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: step.color + "20", color: step.color }}>
                  {step.icon}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold mb-1" style={{ color: step.color }}>STEP {step.number}</div>
                  <h3 className="text-base font-bold text-text mb-2">{step.title}</h3>
                  <p className="text-sm text-textDim leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-8" style={{ background: "#12121F", border: "1px solid rgba(0,230,118,0.2)" }}>
          <div className="text-center mb-8">
            <div className="text-2xl mb-2">🛡️</div>
            <h3 className="text-xl font-bold text-text mb-2">Privacy Guarantee</h3>
            <p className="text-textDim text-sm">We built this because scam detection tools shouldn't themselves be a privacy risk.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PRIVACY_POINTS.map((point, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(13,13,24,0.6)" }}>
                <span className="text-lg">{point.icon}</span>
                <span className="text-xs text-textDim">{point.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
