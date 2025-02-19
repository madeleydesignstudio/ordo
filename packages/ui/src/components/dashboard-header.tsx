"use client";

import { Link } from "react-router-dom";
import { Bell, Search, User, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleSectionChange = (section: string) => {
    navigate(`/${section.toLowerCase().replace(" ", "-")}`);
  };

  return (
    <div className="flex justify-between h-[40px] border-b border-[#6B9CA9] items-center text-[#6B9CA9] px-4 fixed top-0 left-0 right-0">
      <div className="flex items-center ">
        <div className="text-xl font-bold pr-4 border-r border-[#6B9CA9]">
          Orbo
        </div>
        <div className="relative group px-4 border-r border-[#6B9CA9] font-light">
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
        {pathname !== "/knowledge-hub" && (
          <div className="flex gap-4 text-xs px-4 font-normal">
            <Link
              to="/project-manager"
              className={
                pathname === "/project-manager"
                  ? "border-b border-[#6B9CA9]"
                  : ""
              }
            >
              Home
            </Link>
            <Link
              to="/project-manager/calendar"
              className={
                pathname === "/project-manager/calendar"
                  ? "border-b border-[#6B9CA9]"
                  : ""
              }
            >
              Calendar
            </Link>
            <Link
              to="/project-manager/projects"
              className={
                pathname === "/project-manager/projects"
                  ? "border-b border-[#6B9CA9]"
                  : ""
              }
            >
              Projects
            </Link>
            <Link
              to="/project-manager/tasks"
              className={
                pathname === "/project-manager/tasks"
                  ? "border-b border-[#6B9CA9]"
                  : ""
              }
            >
              Tasks
            </Link>
            <Link
              to="/project-manager/journal"
              className={
                pathname === "/project-manager/journal"
                  ? "border-b border-[#6B9CA9]"
                  : ""
              }
            >
              Journal
            </Link>
          </div>
        )}
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
