import { Link } from "@tanstack/react-router";
import {
  InboxIcon,
  FolderIcon,
  CircleCheckBig,
  BadgeAlert,
  StickyNoteIcon,
  BookCopyIcon,
  PresentationIcon,
  LucideIcon,
} from "lucide-react";

// Define menu item type
type MenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

// Define menu items configuration
const menuItems: MenuItem[] = [
  { icon: InboxIcon, label: "Inbox", path: "/project-manager/inbox" },
  { icon: FolderIcon, label: "Projects", path: "/project-manager/projects" },
  { icon: CircleCheckBig, label: "Tasks", path: "/project-manager/tasks" },
  { icon: BadgeAlert, label: "My Issues", path: "/project-manager/my-issues" },
  { icon: StickyNoteIcon, label: "Notes", path: "/project-manager/notes" },
  {
    icon: BookCopyIcon,
    label: "Notebooks",
    path: "/project-manager/notebooks",
  },
  { icon: PresentationIcon, label: "Canvas", path: "/project-manager/canvas" },
];

const ProjectManagerLinks = () => {
  // Render menu item
  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;

    return (
      <Link key={item.path} to={item.path}>
        <div className="text-neutral-300 text-xs flex items-center gap-2 hover:bg-neutral-800 p-2 rounded-md cursor-pointer">
          <span>
            <Icon size={12} />
          </span>
          <h2>{item.label}</h2>
        </div>
      </Link>
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-2">{menuItems.map(renderMenuItem)}</div>
    </div>
  );
};

export default ProjectManagerLinks;
