import "./globals.scss";
import "./custom.css";
import { PHProvider } from "../components/analytics";
import { AuthContextProvider } from "@/components/AuthContextProvider";
import { UserInteractionContextProvider } from "@/components/UserInteractionContext";

export const metadata = {
  title: "Live Lab Broadcaster",
  description: "Realtime livestreaming venue",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <UserInteractionContextProvider>
        <AuthContextProvider>
          <PHProvider>
            <body className="bg-background text-foreground">{children}</body>
          </PHProvider>
        </AuthContextProvider>
      </UserInteractionContextProvider>
    </html>
  );
}
