import React from 'react'
import { User } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Tooltip, TooltipTrigger, TooltipContent } from '@workspace/ui/components/tooltip'

interface UserProfileImageProps {
  user?: {
    name?: string
    image?: string
  }
}

const UserProfileImage = ({ user }: UserProfileImageProps) => {
  console.log('UserProfileImage received user:', user)
  console.log('User image URL:', user?.image)
  
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)
  
  // Reset states when user changes
  React.useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [user?.image])
  
  // Modify Google image URL to try to avoid rate limiting
  const getOptimizedImageUrl = (url: string) => {
    if (url.includes('googleusercontent.com')) {
      // Try different size parameters to avoid rate limits
      return url.replace(/=s\d+-c$/, '=s32-c').replace(/=w\d+-h\d+/, '=w32-h32')
    }
    return url
  }
  
  if (user?.image && !imageError) {
    const optimizedImageUrl = getOptimizedImageUrl(user.image)
    
    return (
      <div className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center bg-primary relative">
        <img 
          src={optimizedImageUrl} 
          alt={user.name || 'User'} 
          className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => {
            console.log('Image loaded successfully')
            setImageLoaded(true)
          }}
          onError={(e) => {
            console.log('Image failed to load:', optimizedImageUrl)
            console.log('This might be due to Google rate limiting (429 error)')
            console.log('Falling back to user initial')
            setImageError(true)
          }}
          // Add loading="lazy" and referrerPolicy to help with Google's restrictions
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
        {/* Show fallback while loading or on error */}
        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 w-full h-full bg-primary rounded-md flex items-center justify-center">
            {user?.name ? (
              <span className="text-primary-foreground font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="h-4 w-4 text-primary-foreground" />
            )}
          </div>
        )}
      </div>
    )
  }
  
  // Fallback when no image or permanent error
  return (
    <div className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center bg-primary">
      <div className="w-full h-full bg-primary rounded-md flex items-center justify-center">
        {user?.name ? (
          <span className="text-primary-foreground font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </span>
        ) : (
          <User className="h-4 w-4 text-primary-foreground" />
        )}
      </div>
    </div>
  )
}

const Sidebar = ({ user }: { user?: UserProfileImageProps['user'] }) => {
  const [isHomeMode, setIsHomeMode] = React.useState(false)
  
  const businessModeNav = [
    { icon: "https://storage.dev-0af.workers.dev/cottage-home.png", label: "Home", href: "/", alt: "Home" },
    { icon: "https://storage.dev-0af.workers.dev/project-manager.png", label: "Project Manager", href: "/project-manager", alt: "Project Manager" },
    { icon: "https://storage.dev-0af.workers.dev/content-manager.png", label: "Content Manager", href: "/content-manager", alt: "Content Manager" },
    { icon: "https://storage.dev-0af.workers.dev/finance-manager.png", label: "Finance Manager", href: "/finance-manager", alt: "Finance Manager" }
  ]
  
  const homeModeNav = [
    { icon: "https://storage.dev-0af.workers.dev/home-dashboard.png", label: "Dashboard", href: "/home/dashboard", alt: "Home Dashboard" },
    { icon: "https://storage.dev-0af.workers.dev/home-tasks.png", label: "Tasks", href: "/home/tasks", alt: "Home Tasks" },
    { icon: "https://storage.dev-0af.workers.dev/home-calendar.png", label: "Calendar", href: "/home/calendar", alt: "Home Calendar" },
    { icon: "https://storage.dev-0af.workers.dev/home-notes.png", label: "Notes", href: "/home/notes", alt: "Home Notes" }
  ]
  
  const currentNav = isHomeMode ? homeModeNav : businessModeNav
  
  return (
    <div className="h-full flex flex-col">
      {/* Workspace Icon - Top */}
      <div className="p-3">
        <Link to="/settings" className="block">
          <UserProfileImage user={user} />
        </Link>
      </div>

      {/* Main Navigation Links - Middle */}
      <nav className="flex-1 px-1 space-y-16 flex flex-col justify-center text-xs">
        {currentNav.map((item, index) => (
          <Tooltip key={`${isHomeMode ? 'home' : 'business'}-${index}`}>
            <TooltipTrigger asChild>
              <Link to={item.href}>
                <div className="w-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-125">
                  <img src={item.icon} alt={item.alt} width={40} height={40} />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10} className="text-xs bg-stone-100 border border-stone-300 rounded-md text-stone-600">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>

      {/* Home/Business Mode Toggle - Bottom */}
      <div className='p-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="w-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-125"
              onClick={() => setIsHomeMode(!isHomeMode)}
            >
              <img 
                src={isHomeMode ? "https://storage.dev-0af.workers.dev/business.png" : "https://storage.dev-0af.workers.dev/home.png"} 
                alt={isHomeMode ? "Switch to Business Mode" : "Switch to Home Mode"} 
                width={40} 
                height={40} 
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            <p>{isHomeMode ? "Switch to Business Mode" : "Switch to Home Mode"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export default Sidebar
