import Link from "next/link";

export default function Home() {
  return (
    <div className="">
      <h1 className="text-4xl font-bold">Ordo</h1>
      <Link href="/reports">Reports</Link>
    </div>
  );
}
