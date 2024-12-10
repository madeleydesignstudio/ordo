import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="flex justify-between items-center border-b">
      <div className="flex items-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Ordo</h1>
        <h2>Project Manager</h2>
        <nav className="flex gap-4">
          <Link href="/">Home</Link>
          <Link href="/projects" legacyBehavior>
            <a>Projects</a>
          </Link>
          <Link href="/tasks" legacyBehavior>
            <a>Tasks</a>
          </Link>
          <Link href="/reports" legacyBehavior>
            <a>Reports</a>
          </Link>
        </nav>
      </div>
      <div>search</div>
    </header>
  );
};

export default Header;
