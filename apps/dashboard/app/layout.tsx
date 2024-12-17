import "./globals.css";
import "@repo/ui/styles.css";
import type { Metadata } from "next";
import DashboardHeader from "./components/dashboard-header";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
// });

export const metadata: Metadata = {
  title: "Ordo - Dashboard",
  description: "Bring order to complexity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#FBFEFB]">
        <DashboardHeader />
        {children}
      </body>
    </html>
  );
}
