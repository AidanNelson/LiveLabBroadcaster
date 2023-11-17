import "./globals.css";
import { Inter } from "next/font/google";
import { PHProvider } from '../components/analytics';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Virtual Venue",
  description: "Realtime livestreaming venue",
  colorScheme: "dark light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <PHProvider>
      <body className={inter.className}>{children}</body>
      </PHProvider>
    </html>
  );
}
