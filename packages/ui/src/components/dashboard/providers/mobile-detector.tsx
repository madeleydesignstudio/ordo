import { useEffect, useState } from 'react'

// Mobile detection hook
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      // Function to check if device is mobile
      const checkMobile = () => {
        const userAgent = 
          navigator.userAgent || navigator.vendor || (window as any).opera
        
        // Regular expression to check for mobile devices
        const mobileRegex = 
          /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i
        
        const tabletRegex = 
          /android|ipad|playbook|silk/i
        
        // Check user agent and screen width
        const isMobileDevice = 
          mobileRegex.test(userAgent) || 
          tabletRegex.test(userAgent) || 
          (window.innerWidth <= 768)
        
        setIsMobile(isMobileDevice)
      }
      
      // Check on initial load
      checkMobile()
      
      // Add event listener for resize
      window.addEventListener('resize', checkMobile)
      
      // Clean up
      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [])
  
  return isMobile
}

// Component that shows app store download screen on mobile
export function MobileRedirect({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  
  if (!isMobile) {
    return <>{children}</>
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 mb-8 bg-stone-800 rounded-2xl flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-4">Ordo Mobile</h1>
      <p className="text-stone-600 mb-8">
        For the best experience, please download our mobile app
      </p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <a 
          href="#" 
          className="bg-black text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2"
          onClick={(e) => {
            e.preventDefault()
            window.location.href = "https://apps.apple.com/app/ordo"
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"></path>
          </svg>
          App Store
        </a>
        <a 
          href="#" 
          className="bg-stone-900 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2"
          onClick={(e) => {
            e.preventDefault()
            window.location.href = "https://play.google.com/store/apps/details?id=com.ordo"
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"></path>
          </svg>
          Google Play
        </a>
      </div>
      <button 
        className="mt-8 text-stone-500 underline"
        onClick={() => {
          // Store preference in local storage
          localStorage.setItem('continue-to-web', 'true')
          window.location.reload()
        }}
      >
        Continue to web version anyway
      </button>
    </div>
  )
}