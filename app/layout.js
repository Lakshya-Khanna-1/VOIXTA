import './globals.css';

export const metadata = {
  title: 'Voixta | Check a suspicious call or SMS',
  description: 'Speak a sample call or paste a text message. Voixta analyzes the request on your device in English or Hindi.',
};

export const viewport = { themeColor: '#f6f1e7' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
