import "./globals.scss";
import "./custom.css";
import { PHProvider } from "../components/analytics";
import { AuthContextProvider } from "@/components/AuthContextProvider";
import { UserInteractionContextProvider } from "@/components/UserInteractionContext";

export const metadata = {
  title: "Live Lab Broadcaster",
  description: "Realtime livestreaming venue",
  colorScheme: "dark light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="dark"></meta>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <UserInteractionContextProvider>
        <AuthContextProvider>
          <PHProvider>
            <body>{children}</body>
          </PHProvider>
        </AuthContextProvider>
      </UserInteractionContextProvider>
    </html>
  );
}
