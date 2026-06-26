"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import WaveformVisualizer from "./WaveformVisualizer";
import ScamResultCard from "./ScamResultCard";
import { analyzeTranscript, getThreatLevel } from "../lib/scamDetector";

const EXAMPLE_SCRIPTS = [
  {
    label: "Digital Arrest",
    icon: "🚨",
    color: "#FF3B3B",
    script:
      "Hello, I am calling from CBI headquarters. Your Aadhaar number has been linked to a money laundering case. An arrest warrant has been issued. This is a digital arrest. Stay on call and do not tell anyone.",
  },
  {
    label: "OTP Fraud",
    icon: "🏦",
    color: "#FF7A00",
    script:
      "This is SBI bank customer care calling. Your account is blocked due to incomplete KYC verification. Please share the OTP you received on your mobile to unblock your account immediately.",
  },
  {
    label: "Courier Scam",
    icon: "📦",
    color: "#8B5CF6",
    script:
      "I am calling from FedEx customs department. A parcel registered in your name contains illegal drugs and a forged passport. You need to pay a fine immediately or police will arrest you.",
  },
  {
    label: "Lottery Scam",
    icon: "🎰",
    color: "#FFD600",
    script:
      "Congratulations! Your mobile number has been selected in KBC Amazon lucky draw. You have won 25 lakh rupees. To claim your prize pay a small processing fee and registration fee.",
  },
  {
    label: "Investment Fraud",
    icon: "💰",
    color: "#10B981",
    script:
      "I am a financial advisor with guaranteed 35 percent monthly returns investment scheme. Join our WhatsApp group where members are already doubling their money with sure shot profit.",
  },
  {
    label: "Tech Support",
    icon: "💻",
    color: "#3B82F6",
    script:
      "This is Microsoft technical support. We detected a serious virus on your computer. Your data is at risk from a hacker. You must install AnyDesk right now so our technician can fix it remotely.",
  },
];

export default function LiveDetector() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [result, setResult] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [threatInfo, setThreatInfo] = useState(null);
  const [error, setError] = useState("");
  const [analyserNode, setAnalyserNode] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [mode, setMode] = useState("voice"); // 'voice' | 'text'

  const recognitionRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const fullTranscriptRef = useRef("");

  // Run analysis on every transcript change
  const runAnalysis = useCallback((text) => {
    if (!text || text.trim().length < 5) {
      setResult(null);
      setConfidence(0);
      setThreatInfo(null);
      return;
    }
    const detection = analyzeTranscript(text);
    setResult(detection);
    setConfidence(detection.overallConfidence);
    setThreatInfo(getThreatLevel(detection.overallConfidence));
  }, []);

  useEffect(() => {
    const combined = (fullTranscriptRef.current + " " + interimText).trim();
    runAnalysis(combined);
  }, [interimText, runAnalysis]);

  const startListening = async () => {
    setError("");
    setResult(null);
    setConfidence(0);
    setThreatInfo(null);
    setTranscript("");
    setInterimText("");
    fullTranscriptRef.current = "";

    // Check for SpeechRecognition support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Your browser doesn't support Speech Recognition. Please use Chrome or Edge. Or use Text Mode below."
      );
      return;
    }

    // Setup Audio Context for waveform
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      setAnalyserNode(analyser);
    } catch (e) {
      // Waveform won't work without mic permission, but speech recognition might still
      console.warn("Mic access for waveform denied:", e);
    }

    // Setup Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += transcript + " ";
        } else {
          interim += transcript;
        }
      }

      if (finalChunk) {
        fullTranscriptRef.current = (fullTranscriptRef.current + " " + finalChunk).trim();
        setTranscript(fullTranscriptRef.current);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow mic access and try again, or use Text Mode.");
      } else if (event.error !== "no-speech") {
        setError(`Speech error: ${event.error}. Try Text Mode instead.`);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        // Auto-restart if still supposed to be listening
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setAnalyserNode(null);
    setIsListening(false);
    setInterimText("");
  };

  const handleReset = () => {
    stopListening();
    setResult(null);
    setConfidence(0);
    setThreatInfo(null);
    setTranscript("");
    setInterimText("");
    setTextInput("");
    fullTranscriptRef.current = "";
    setError("");
  };

  const handleTextAnalyze = () => {
    if (!textInput.trim()) return;
    runAnalysis(textInput);
    setTranscript(textInput);
  };

  const loadExample = (script) => {
    setMode("text");
    setTextInput(script);
    handleReset();
    // Small delay then analyze
    setTimeout(() => {
      const detection = analyzeTranscript(script);
      setResult(detection);
      setConfidence(detection.overallConfidence);
      setThreatInfo(getThreatLevel(detection.overallConfidence));
      setTranscript(script);
    }, 200);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayText = (fullTranscriptRef.current + " " + interimText).trim() || transcript;
  const meterColor =
    confidence >= 75
      ? "#FF3B3B"
      : confidence >= 50
      ? "#FF7A00"
      : confidence >= 30
      ? "#FFD600"
      : "#3B82F6";

  return (
    <section id="detector" className="py-24 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(59,130,246,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accentBlue/10 border border-accentBlue/20 text-accentBlue text-xs font-mono font-semibold tracking-wider mb-4">
            LIVE DETECTION ENGINE
          </div>
          <h2 className="text-4xl font-black text-text mb-3">
            Try It Yourself
          </h2>
          <p className="text-textDim">
            Speak or type what a scammer might say. Watch the AI flag it in real-time.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-panel border border-border rounded-xl p-1">
            <button
              onClick={() => { setMode("voice"); handleReset(); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === "voice"
                  ? "bg-accent text-white shadow-lg"
                  : "text-textDim hover:text-text"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
              </svg>
              Voice Mode
            </button>
            <button
              onClick={() => { setMode("text"); handleReset(); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === "text"
                  ? "bg-accent text-white shadow-lg"
                  : "text-textDim hover:text-text"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/>
              </svg>
              Text Mode
            </button>
          </div>
        </div>

        {/* Main Detector Card */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: "rgba(13,13,24,0.9)",
            borderColor: isListening && confidence >= 30
              ? meterColor + "80"
              : confidence >= 30 && result?.isScam
              ? meterColor + "60"
              : "#1E1E35",
            boxShadow: isListening && confidence >= 50
              ? `0 0 40px ${meterColor}25`
              : "none",
            transition: "border-color 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          {/* Top bar */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isListening ? "bg-accent animate-pulse" : "bg-muted"
                }`}
              />
              <span className="text-xs font-mono text-sub uppercase tracking-wider">
                {isListening ? "Listening — Analyzing in real time" : "Ready to analyze"}
              </span>
            </div>
            {confidence > 0 && (
              <div
                className="text-xs font-mono font-bold px-3 py-1 rounded-full"
                style={{
                  color: meterColor,
                  background: meterColor + "20",
                  border: `1px solid ${meterColor}40`,
                }}
              >
                {threatInfo?.label || "MONITORING"}
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Waveform */}
            {mode === "voice" && (
              <WaveformVisualizer isListening={isListening} analyserNode={analyserNode} />
            )}

            {/* Confidence Meter */}
            <div>
              <div className="flex justify-between text-xs text-sub mb-2">
                <span className="font-mono uppercase tracking-wider">Scam Confidence</span>
                <span className="font-bold font-mono" style={{ color: confidence > 0 ? meterColor : "#4B4B6B" }}>
                  {confidence}%
                </span>
              </div>
              <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${confidence}%`,
                    background:
                      confidence >= 75
                        ? "linear-gradient(90deg, #FF7A00, #FF3B3B)"
                        : confidence >= 50
                        ? "linear-gradient(90deg, #FFD600, #FF7A00)"
                        : confidence >= 30
                        ? "linear-gradient(90deg, #3B82F6, #FFD600)"
                        : "#3B82F6",
                    boxShadow: confidence >= 30 ? `0 0 8px ${meterColor}80` : "none",
                  }}
                />
              </div>
              {/* Threshold markers */}
              <div className="relative h-3 mt-1">
                <div className="absolute left-[30%] top-0 w-px h-2 bg-muted" />
                <div className="absolute left-[50%] top-0 w-px h-2 bg-muted" />
                <div className="absolute left-[75%] top-0 w-px h-2 bg-accent/60" />
                <span className="absolute left-[27%] top-0.5 text-[9px] text-sub font-mono">Suspicious</span>
                <span className="absolute left-[72%] top-0.5 text-[9px] text-accent font-mono">Critical</span>
              </div>
            </div>

            {/* Voice Mode Controls */}
            {mode === "voice" && (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isListening ? "mic-listening" : "mic-idle hover:scale-105"
                  }`}
                  style={{
                    background: isListening
                      ? "linear-gradient(135deg, #FF3B3B, #CC0000)"
                      : "linear-gradient(135deg, #1E1E35, #2a2a45)",
                    border: `2px solid ${isListening ? "#FF3B3B" : "#2a2a45"}`,
                    boxShadow: isListening
                      ? "0 0 0 0 rgba(255,59,59,0.6)"
                      : "none",
                  }}
                >
                  {isListening ? (
                    /* Stop icon */
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                  ) : (
                    /* Mic icon */
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#E0E0FF">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
                    </svg>
                  )}
                  {/* Pulse rings */}
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-accent" />
                    </>
                  )}
                </button>
                <p className="text-sm text-sub text-center">
                  {isListening
                    ? "Listening... speak like a scammer would call you"
                    : "Click to start voice analysis"}
                </p>
              </div>
            )}

            {/* Text Mode Input */}
            {mode === "text" && (
              <div className="space-y-3">
                <textarea
                  value={textInput}
                  onChange={(e) => {
                    setTextInput(e.target.value);
                    // Live analyze as typing
                    runAnalysis(e.target.value);
                    setTranscript(e.target.value);
                  }}
                  placeholder="Paste or type a scam call script here... e.g. 'I am calling from CBI. Your Aadhaar is linked to money laundering case. This is digital arrest.'"
                  rows={4}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-muted resize-none focus:outline-none focus:border-accent/50 transition-colors font-mono"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleTextAnalyze}
                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all"
                    style={{
                      background: "linear-gradient(135deg, #FF3B3B, #FF7A00)",
                      boxShadow: "0 0 20px rgba(255,59,59,0.3)",
                    }}
                  >
                    Analyze Text
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-5 py-3 rounded-xl font-semibold text-sm border border-border text-textDim hover:text-text transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-surface border border-accentOrange/30 rounded-xl p-4 text-sm text-accentOrange">
                ⚠️ {error}
              </div>
            )}

            {/* Live Transcript */}
            {displayText && (
              <div className="bg-surface/60 rounded-xl p-4 border border-border">
                <div className="text-xs text-sub font-mono uppercase tracking-wider mb-2">
                  {mode === "voice" ? "Live Transcript" : "Input Text"}
                </div>
                <p className="text-sm text-textDim leading-relaxed font-mono">
                  {fullTranscriptRef.current && (
                    <span className="text-text">{fullTranscriptRef.current} </span>
                  )}
                  {interimText && mode === "voice" && (
                    <span className="text-sub italic">{interimText}</span>
                  )}
                  {mode === "text" && (
                    <span className="text-text">{textInput}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Result Card */}
        {result && result.isScam && (
          <div className="mt-6">
            <ScamResultCard result={result} onReset={handleReset} />
          </div>
        )}

        {/* Clean result */}
        {transcript && result && !result.isScam && (
          <div className="mt-6 rounded-2xl border border-accentGreen/30 bg-accentGreen/5 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accentGreen/20 flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#00E676">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <div className="text-accentGreen font-bold text-sm mb-1">No Scam Patterns Detected</div>
              <div className="text-textDim text-sm">The speech analyzed doesn't match known scam scripts. Confidence: {result.overallConfidence}%</div>
            </div>
          </div>
        )}

        {/* Example Scripts */}
        <div id="scam-types" className="mt-12">
          <div className="text-sm text-sub font-mono uppercase tracking-wider mb-4">
            Try These Real Scam Scripts →
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EXAMPLE_SCRIPTS.map((ex, i) => (
              <button
                key={i}
                onClick={() => loadExample(ex.script)}
                className="text-left p-4 rounded-xl border border-border bg-panel hover:border-opacity-60 transition-all duration-200 group"
                style={{ "--hover-color": ex.color }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ex.color + "60";
                  e.currentTarget.style.background = ex.color + "10";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#1E1E35";
                  e.currentTarget.style.background = "#12121F";
                }}
              >
                <div className="text-xl mb-2">{ex.icon}</div>
                <div className="text-sm font-semibold text-text mb-1">{ex.label}</div>
                <div className="text-xs text-sub line-clamp-2">{ex.script.slice(0, 60)}...</div>
                <div
                  className="text-xs font-semibold mt-2"
                  style={{ color: ex.color }}
                >
                  Test this script →
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
