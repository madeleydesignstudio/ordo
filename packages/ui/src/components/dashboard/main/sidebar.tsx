
const Sidebar = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Workspace Icon - Top */}
      <div className="p-3">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">W</span>
        </div>
      </div>

      {/* Main Navigation Links - Middle */}
      <nav className="flex-1 px-1 space-y-8 flex flex-col justify-center text-xs">
        
        <div className="w-full flex flex-col items-center justify-center gap-1 cursor-pointer">
          <img src="https://storage.dev-0af.workers.dev/cottage-home.png" alt="Project Manager" width={40} height={40} />
          <span className="text-[8px] text-center">Home</span>
        </div>
        
        <div className="w-full flex flex-col items-center justify-center gap-1 cursor-pointer">
          <img src="https://storage.dev-0af.workers.dev/project-manager.png" alt="Project Manager" width={40} height={40} />
          <span className="text-[8px] text-center">Project Manager</span>
        </div>
        
        <div className="w-full flex flex-col items-center justify-center gap-1 cursor-pointer">
          <img src="https://storage.dev-0af.workers.dev/content-manager.png" alt="Project Manager" width={40} height={40} />
          <span className="text-[8px] text-center">Content Manager</span>
        </div>

        <div className="w-full flex flex-col items-center justify-center gap-1 cursor-pointer">
          <img src="https://storage.dev-0af.workers.dev/finance-manager.png" alt="Project Manager" width={40} height={40} />
          <span className="text-[8px] text-center">Finance Manager</span>
        </div>
      
        
    
      </nav>

      {/* Home/Business Mode Toggle - Bottom */}
      <div className='p-2'>
      <div className="w-full flex flex-col items-center justify-center gap-1 cursor-pointer">
          <img src="https://storage.dev-0af.workers.dev/home.png" alt="Project Manager" width={40} height={40} />
          <span className="text-[8px] text-center">Home Mode</span>
        </div>
      </div>
      
     
    </div>
  )
}

export default Sidebar
