import FinanceDashboard from "@/components/finance-dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/finance-manager/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex items-center justify-center h-full w-full rounded-md flex-col">
      <FinanceDashboard />
    </div>
  );
}
