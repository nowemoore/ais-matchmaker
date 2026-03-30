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
      <body className="font-sans bg-cream text-brown antialiased">
        {children}
      </body>
    </html>
  );
}
