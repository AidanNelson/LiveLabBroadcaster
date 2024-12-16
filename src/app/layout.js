import "./globals.css";
import "./custom.css";
import { PHProvider } from '../components/analytics';
import { AuthContextProvider } from "@/components/AuthContextProvider";

export const metadata = {
  title: "Live Lab Broadcaster",
  description: "Realtime livestreaming venue",
  colorScheme: "dark light",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <AuthContextProvider>
        <PHProvider>
          <body>{children}</body>
        </PHProvider>
      </AuthContextProvider>
    </html>
  );
}
