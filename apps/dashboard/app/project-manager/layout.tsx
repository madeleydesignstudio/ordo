"use client";

import DashboardHeader from "@/components/dashboard-header";
import { supabase } from "@workspace/supabase";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ProjectManagerLayoutProps {
  children: ReactNode;
}

export default function ProjectManagerLayout({
  children,
}: ProjectManagerLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth");
      return;
    }
  };
  return (
    <div className="h-full w-full">
      <DashboardHeader />
      {children}
    </div>
  );
}
