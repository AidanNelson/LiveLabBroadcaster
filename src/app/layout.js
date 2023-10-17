import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Virtual Venue",
  description: "Realtime livestreaming venue",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous"></link> */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}
