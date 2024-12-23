"use client";

import { Button } from "../../../components/ui/button";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export function DashboardHeader() {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Tasks</h1>
      <div className="space-x-4">
        <Button variant="outline" onClick={() => router.push("/calendar")}>
          <Calendar className="w-4 h-4 mr-2" />
          Calendar View
        </Button>
      </div>
    </div>
  );
}
