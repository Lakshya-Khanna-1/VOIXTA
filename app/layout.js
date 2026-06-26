import "./globals.css";

export const metadata = {
  title: "VoiceGuard — AI Scam Call Detector",
  description:
    "Real-time AI-powered scam call detection. No recordings. No uploads. 100% private, runs on your device.",
  keywords: ["scam detector", "AI call detection", "voice fraud protection", "digital arrest scam", "OTP fraud"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-void text-text antialiased">
        {children}
      </body>
    </html>
  );
}
