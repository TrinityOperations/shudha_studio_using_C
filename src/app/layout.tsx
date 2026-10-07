import type { Metadata } from "next";

import { LanguageProvider } from "@/components/language-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shudha Studio",
  description: "A bilingual gift shop catalog and meeting request application.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-white text-slate-950">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
