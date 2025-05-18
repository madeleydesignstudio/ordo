import { createFileRoute } from "@tanstack/react-router";
import { Contact, columns } from "~/components/content-manager/columns";
import { DataTable } from "~/components/content-manager/data-table";
import { getGoogleContacts } from "~/lib/services/google-contacts";
import { getWebRequest } from "@tanstack/react-start/server";

export const Route = createFileRoute("/content-manager/")({
  component: RouteComponent,
});

async function getData(): Promise<Contact[]> {
  try {
    // Get the web request to pass headers
    const request = getWebRequest();
    if (!request) {
      console.error("No request available");
      return [];
    }

    // Pass headers to the Google contacts service
    return await getGoogleContacts(request.headers);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
}

async function RouteComponent() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
