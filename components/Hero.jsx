"use client";
import { useEffect, useState } from "react";

const STATS = [
  { value: "1.7Cr+", label: "Cyber Frauds in India (2023)" },
  { value: "₹11,333Cr", label: "Lost to Scam Calls" },
  { value: "<8s", label: "Detection Time" },
  { value: "0 bytes", label: "Data Sent to Server" },
];

export default function Hero() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev < 1700000 ? prev + 47312 : 0));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden grid-bg">
      {/* Radial glow behind heading */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,59,59,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Scan lines overlay */}
      <div className="absolute inset-0 scan-overlay pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-mono font-semibold tracking-wider mb-8">
          <span className="w-2 h-2 rounded-full bg-accent tag-flash" />
          PROTOTYPE v0.1 — DEMO BUILD
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
          <span className="text-text">Your First Line</span>
          <br />
          <span className="text-text">of Defense Against</span>
          <br />
          <span
            className="glitch"
            style={{
              background: "linear-gradient(90deg, #FF3B3B, #FF7A00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Scam Calls.
          </span>
        </h1>

        <p className="text-lg text-textDim max-w-2xl mx-auto mb-4 leading-relaxed">
          An AI model that listens live to any call. Detects Digital Arrest, OTP fraud, 
          fake courier scams and more — <strong className="text-text">in real time.</strong>{" "}
          No recording. No upload. 100% private.
        </p>

        <p className="text-sm text-sub font-mono mb-12">
          {">"} Speak below like a scammer would. Watch it get caught.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <a
            href="#detector"
            className="group relative px-8 py-4 rounded-xl font-bold text-base overflow-hidden transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #FF3B3B, #FF7A00)",
              boxShadow: "0 0 30px rgba(255,59,59,0.3)",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
              </svg>
              Try Live Demo
            </span>
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-xl font-bold text-base border border-border text-textDim hover:border-accent/30 hover:text-text transition-all duration-200"
          >
            How It Works →
          </a>
        </div>

        {/* Live fraud counter */}
        <div className="mb-16 flex items-center justify-center gap-3">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-sub font-mono">
            Estimated fraud calls in India this year:{" "}
            <span className="text-accent font-bold">{count.toLocaleString("en-IN")}</span>
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="bg-panel/60 border border-border rounded-xl p-5 backdrop-blur-sm hover:border-accent/30 transition-colors"
            >
              <div className="text-2xl font-black text-text mb-1">{stat.value}</div>
              <div className="text-xs text-sub leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #05050A)" }}
      />
    </section>
  );
}
