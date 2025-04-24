import { Link } from "@tanstack/react-router";
import { SettingsIcon } from "lucide-react";

const SettingsLink = () => {
  return (
    <div className="w-fit">
      <Link
        to="/"
        className="flex gap-2 items-center text-neutral-300 cursor-pointer"
      >
        <SettingsIcon size={12} />
        <h3 className=" text-xs ">Settings</h3>
      </Link>
    </div>
  );
};

export default SettingsLink;
