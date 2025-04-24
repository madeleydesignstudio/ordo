import BorderBreak from "../border-break";
import { SidebarTrigger } from "../ui/sidebar";

const WorkspaceSettings = () => {
  return (
    <>
      <div className="flex flex-col h-[30px] justify-center px-2">
        <div className="flex items-center justify-between">
          <h1 className="text-neutral-300 text-xs">madeleydesignstudio</h1>
          <SidebarTrigger className="h-3.5 w-3.5" />
        </div>
      </div>
      <BorderBreak />
    </>
  );
};

export default WorkspaceSettings;
