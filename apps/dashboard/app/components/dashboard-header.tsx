"use client";

import Link from "next/link";
import { Bell, Search, User, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const DashboardHeader = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleSectionChange = (section: string) => {
    router.push(`/${section.toLowerCase().replace(" ", "-")}`);
  };

  return (
    <div className="flex justify-between h-[40px] border-b border-[#6B9CA9] items-center text-[#6B9CA9] px-4">
      <div className="flex items-center ">
        <div className="text-xl font-bold pr-4 border-r border-[#6B9CA9]">
          Orbo
        </div>
        <div className="relative group px-4 border-r border-[#6B9CA9]">
          <button className="flex items-center text-xl px-2 hover:bg-gray-100 rounded">
            <span>
              {pathname === "/knowledge-hub"
                ? "Knowledge Hub"
                : "Project Manager"}
            </span>
            <ChevronDown className="ml-1 w-4 h-4" />
          </button>
          <div className="absolute hidden group-hover:block w-48 bg-white border rounded-md shadow-lg">
            <button
              onClick={() => handleSectionChange("project-manager")}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Project Manager
            </button>
            <button
              onClick={() => handleSectionChange("knowledge-hub")}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Knowledge Hub
            </button>
          </div>
        </div>
        <div className="flex gap-4 text-xs px-4">
          <Link href="/">Home</Link>
          <Link href="/">Calendar</Link>
          <Link href="/">Projects</Link>
          <Link href="/">Tasks</Link>
          <Link href="/">Journal</Link>
        </div>
      </div>
      <div className="flex items-center ">
        <div>Search</div>
        <div>
          <Bell />
        </div>
        <div>
          <Search />
        </div>
        <div>
          <User />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
