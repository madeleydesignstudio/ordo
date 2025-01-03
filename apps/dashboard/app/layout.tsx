import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import localFont from "next/font/local";

const nohemi = localFont({
  src: [
    {
      path: "./fonts/nohemilight.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/nohemiregular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/nohemimedium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/nohemibold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-nohemi",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={` font-sans antialiased font-nohemi ${nohemi.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
