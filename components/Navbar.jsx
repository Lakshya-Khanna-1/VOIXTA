"use client";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-void/90 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-lg bg-accent/20 animate-pulse" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accentOrange flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" opacity="0.3"/>
                <path d="M12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
                <circle cx="19" cy="5" r="3" fill="#FF3B3B"/>
                <path d="M19 3.5v1.25M19 6.5v.5M17.5 5h1.25M20.5 5h.5" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div>
            <span className="font-black text-lg text-text tracking-tight">
              Voice<span className="text-accent">Guard</span>
            </span>
            <span className="hidden sm:block text-[10px] text-sub font-mono tracking-widest uppercase leading-none">
              AI Scam Detector
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#detector" className="text-sm text-textDim hover:text-text transition-colors">Try It Live</a>
          <a href="#how-it-works" className="text-sm text-textDim hover:text-text transition-colors">How It Works</a>
          <a href="#scam-types" className="text-sm text-textDim hover:text-text transition-colors">Scam Types</a>
        </div>

        {/* CTA */}
        <a
          href="#detector"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm font-semibold hover:bg-accent/20 transition-all duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Live Demo
        </a>
      </div>
    </nav>
  );
}
