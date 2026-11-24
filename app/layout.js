import './globals.css';

export const metadata = {
  title: 'Voixta | Practise the call after the scam call',
  description: 'A three-minute scam-call rehearsal for you and someone you trust. Practise in English or Hindi.',
};

export const viewport = { themeColor: '#f6f1e7' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
