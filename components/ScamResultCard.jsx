"use client";

export default function ScamResultCard({ result, onReset }) {
  if (!result) return null;

  const { topScam, overallConfidence, matchedPhrases, isScam } = result;

  if (!isScam && overallConfidence < 30) return null;

  const confidenceColor =
    overallConfidence >= 75
      ? "#FF3B3B"
      : overallConfidence >= 50
      ? "#FF7A00"
      : "#FFD600";

  const threatLabel =
    overallConfidence >= 75
      ? "CRITICAL THREAT"
      : overallConfidence >= 50
      ? "HIGH THREAT"
      : "SUSPICIOUS";

  return (
    <div
      className="result-card-enter rounded-2xl overflow-hidden border"
      style={{
        borderColor: topScam?.borderColor || "rgba(255,214,0,0.4)",
        background: topScam?.bgGlow
          ? `linear-gradient(135deg, ${topScam.bgGlow}, rgba(13,13,24,0.95))`
          : "rgba(13,13,24,0.95)",
        boxShadow: `0 0 40px ${topScam?.bgGlow || "rgba(255,214,0,0.1)"}`,
      }}
    >
      {/* Header bar */}
      <div
        className="px-6 py-3 flex items-center justify-between"
        style={{
          background: `linear-gradient(90deg, ${topScam?.color || confidenceColor}22, transparent)`,
          borderBottom: `1px solid ${topScam?.borderColor || "rgba(255,214,0,0.2)"}`,
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{topScam?.icon || "⚠️"}</span>
          <div>
            <div
              className="text-xs font-mono font-bold tracking-widest tag-flash"
              style={{ color: topScam?.color || confidenceColor }}
            >
              {threatLabel} DETECTED
            </div>
            <div className="text-base font-bold text-text">
              {topScam?.name || "Suspicious Activity"}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black" style={{ color: confidenceColor }}>
            {overallConfidence}%
          </div>
          <div className="text-xs text-sub font-mono">confidence</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* Description */}
        <p className="text-sm text-textDim leading-relaxed">
          {topScam?.description || "Suspicious speech patterns detected matching known scam scripts."}
        </p>

        {/* Confidence bar */}
        <div>
          <div className="flex justify-between text-xs text-sub mb-2">
            <span className="font-mono">THREAT CONFIDENCE</span>
            <span className="font-bold" style={{ color: confidenceColor }}>{overallConfidence}%</span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full rounded-full meter-fill transition-all duration-500"
              style={{
                width: `${overallConfidence}%`,
                background: `linear-gradient(90deg, ${topScam?.color || confidenceColor}, ${confidenceColor})`,
                boxShadow: `0 0 8px ${confidenceColor}80`,
              }}
            />
          </div>
        </div>

        {/* Triggered keywords */}
        {matchedPhrases && matchedPhrases.length > 0 && (
          <div>
            <div className="text-xs text-sub font-mono mb-2 uppercase tracking-wider">
              Triggered Phrases
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedPhrases.map((phrase, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg text-xs font-mono font-semibold border"
                  style={{
                    color: topScam?.color || confidenceColor,
                    borderColor: `${topScam?.color || confidenceColor}40`,
                    background: `${topScam?.color || confidenceColor}15`,
                  }}
                >
                  "{phrase}"
                </span>
              ))}
            </div>
          </div>
        )}

        {/* What to do */}
        {topScam?.whatToDo && (
          <div className="bg-surface/60 rounded-xl p-4 border border-border">
            <div className="text-xs text-sub font-mono mb-3 uppercase tracking-wider flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-accentGreen">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              What To Do Right Now
            </div>
            <ul className="space-y-2">
              {topScam.whatToDo.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-textDim">
                  <span className="text-accentGreen mt-0.5 flex-shrink-0">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button
            className="cut-btn flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #FF3B3B, #CC0000)",
              boxShadow: "0 0 20px rgba(255,59,59,0.4)",
            }}
            onClick={onReset}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 22.73L17.11 19c-.49.33-1.01.61-1.55.84-.54.22-1.1.4-1.69.51-.06.01-.11.01-.17.01-.47 0-.89-.33-.98-.8-.1-.55.26-1.08.8-1.17.42-.08.83-.2 1.22-.37.36-.15.71-.33 1.03-.55l-2.39-2.39c-.21.04-.42.08-.63.1-.21.02-.42.03-.64.03-1.54 0-2.89-.5-4.08-1.52C7.82 13.57 7 12.28 7 10.69v-.13l-2.5-2.5C3.96 9.04 3.5 9.85 3.5 10.69v.62C3.5 14.64 5.06 17.44 7.89 19c2.83 1.57 6.07 2.01 9.23 1.24l1.99 1.99c.39.39 1.02.39 1.41 0 .21-.2.32-.45.32-.5zM16.5 10.69c0 .28-.04.56-.1.82l1.52 1.52c.39-.71.58-1.51.58-2.34V6.5L16.5 4.5v6.19zM10.49 3.27L4.27 1 3 2.27l18.73 18.73 1.27-1.27L12.37 9.01l-1.88-5.74z"/>
            </svg>
            CUT CALL — It's a Scam
          </button>
          <button
            onClick={onReset}
            className="px-5 py-3 rounded-xl font-semibold text-sm border border-border text-textDim hover:border-border hover:text-text transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
