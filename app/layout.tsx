import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "../lib/hooks/useLanguage";

export const metadata: Metadata = {
  title: "TikTok Downloader - Free Video Download",
  description: "Download TikTok and Douyin videos without watermarks. Fast, free, and easy to use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
