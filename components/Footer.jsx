export default function Footer() {
  return (
    <footer className="border-t py-12 px-6" style={{ borderColor: "#1E1E35" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF3B3B, #FF7A00)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
              </svg>
            </div>
            <div>
              <div className="font-black text-text">Voice<span style={{ color: "#FF3B3B" }}>Guard</span></div>
              <div className="text-xs text-sub font-mono tracking-widest uppercase leading-none">Prototype v0.1</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-sub">Built for India. 1.7 crore fraud calls happen every year. This stops them.</p>
            <p className="text-xs mt-1" style={{ color: "#4B4B6B" }}>
              Report scams: <span style={{ color: "#FF3B3B" }}>cybercrime.gov.in</span> | Helpline: <span style={{ color: "#FF3B3B" }}>1930</span>
            </p>
          </div>

          <div className="text-xs text-right" style={{ color: "#4B4B6B" }}>
            <p>100% Private. No data collected.</p>
            <p className="mt-1">© 2025 VoiceGuard</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
