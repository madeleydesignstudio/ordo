import { Button } from "@ordo/ui/components/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <Link href="https://app.getordo.co">Dashboard</Link>
      </div>
    </div>
  );
}
