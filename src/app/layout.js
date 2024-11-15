import "./globals.css";
import { PHProvider } from '../components/analytics';

export const metadata = {
  title: "Live Lab Broadcaster",
  description: "Realtime livestreaming venue",
  colorScheme: "dark light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <PHProvider>
      <body>{children}</body>
      </PHProvider>
    </html>
  );
}
