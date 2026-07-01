import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ligtas-Larga | Accessible Commuter Navigator",
  description: "Crowdsourced hazard mapping and safe routing navigator for commuter inclusivity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
