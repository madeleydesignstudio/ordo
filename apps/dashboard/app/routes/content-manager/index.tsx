import { createFileRoute } from "@tanstack/react-router";
import { Contact, columns } from "@/components/content-manager/columns";
import { DataTable } from "@/components/content-manager/data-table";

export const Route = createFileRoute("/content-manager/")({
  component: RouteComponent,
});

function generateMockData(): Contact[] {
  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Sarah",
    "David",
    "Emma",
    "James",
    "Emily",
    "Robert",
    "Lisa",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
  ];
  const companies = [
    "Acme Corp",
    "Globex",
    "Soylent Corp",
    "Initech",
    "Umbrella Corp",
    "Hooli",
    "Stark Industries",
    "Wayne Enterprises",
    "Cyberdyne",
    "Oscorp",
  ];
  const domains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "company.com",
  ];
  const statuses: Contact["status"][] = [
    "active",
    "inactive",
    "lead",
    "customer",
  ];

  return Array.from({ length: 100 }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];

    return {
      id: `${Math.random().toString(36).substring(2, 10)}${index}`,
      firstName,
      lastName,
      company,
      phone: `+1${Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(10, "0")}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  });
}

async function getData(): Promise<Contact[]> {
  return generateMockData();
}

async function RouteComponent() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
