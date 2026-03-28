import type { Metadata } from "next";
import "./globals.css";

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
      <body className="font-sans bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
