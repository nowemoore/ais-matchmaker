import type { Metadata } from "next";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Effective Matching",
  description:
    "Connect with people who share your passion for AI safety, biosecurity, and effective altruism.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Badeen+Display&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-cream text-brown antialiased">
        {children}
      </body>
    </html>
  );
}
