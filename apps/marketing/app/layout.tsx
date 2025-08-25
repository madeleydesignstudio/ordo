import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";

import "@ordo/ui/globals.css";
import { Providers } from "@/components/providers";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Ordo - Organize Your World",
  description:
    "Get early access to the ultimate productivity platform designed to bring order to your digital life.",
  keywords: [
    "productivity",
    "organization",
    "workspace",
    "automation",
    "collaboration",
  ],
  authors: [{ name: "Ordo Team" }],
  creator: "Ordo",
  openGraph: {
    title: "Ordo - Organize Your World",
    description:
      "Get early access to the ultimate productivity platform designed to bring order to your digital life.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ordo - Organize Your World",
    description:
      "Get early access to the ultimate productivity platform designed to bring order to your digital life.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
