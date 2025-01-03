import DashboardHeader from "@/components/dashboard-header";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your application dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Suspense fallback={<div className="h-[40px]" />}>
        <DashboardHeader />
      </Suspense>
      {children}
    </div>
  );
}
