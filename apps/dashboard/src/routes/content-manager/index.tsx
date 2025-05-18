import { createFileRoute } from "@tanstack/react-router";
import { columns } from "~/components/content-manager/columns";
import { DataTable } from "~/components/content-manager/data-table";

export const Route = createFileRoute("/content-manager/")({
  component: RouteComponent,
});



async function RouteComponent() {

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={[]} />
    </div>
  );
}
