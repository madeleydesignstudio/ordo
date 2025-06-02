import { Maximize, Minimize, Focus } from 'lucide-react'
import { useEffect, useState } from 'react'
import React from 'react'

// Focus mode context
const FocusModeContext = React.createContext<{
  isFocusMode: boolean
  toggleFocusMode: () => void
}>({
  isFocusMode: false,
  toggleFocusMode: () => {}
})

export const useFocusMode = () => React.useContext(FocusModeContext)

export const FocusModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isFocusMode, setIsFocusMode] = useState(false)
  
  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode)
  }
  
  return (
    <FocusModeContext.Provider value={{ isFocusMode, toggleFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  )
}

const BottomNav = () => {
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [userCity, setUserCity] = useState('Loading...')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { isFocusMode, toggleFocusMode } = useFocusMode()

  // Update time and date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      
      // Format time (HH:MM)
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }))
      
      // Format date (Monday 2nd June)
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
      const day = now.getDate()
      const monthName = now.toLocaleDateString('en-US', { month: 'long' })
      
      const dayWithSuffix = day + getDaySuffix(day)
      setCurrentDate(`${dayName} ${dayWithSuffix} ${monthName}`)
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Get user's city
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              
              // Using a reverse geocoding service (you might want to use a different one)
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              )
              const data = await response.json()
              setUserCity(data.city || data.locality || 'Unknown Location')
            },
            () => {
              setUserCity('Location unavailable')
            }
          )
        } else {
          setUserCity('Geolocation not supported')
        }
      } catch (error) {
        setUserCity('Location error')
      }
    }

    getUserLocation()
  }, [])

  // Helper function for day suffix
  const getDaySuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th'
    switch (day % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div className="h-full flex items-center justify-end px-4 gap-4 text-[10px]">
      {/* Focus Mode */}
      <button
        onClick={toggleFocusMode}
        className={`h-6 text-xs transition-colors ${
          isFocusMode ? 'text-blue-500' : 'text-stone-400 hover:text-stone-600'
        }`}
        title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
      >
        <Focus className="h-3 w-3" />
      </button>

      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="h-6"
      >
        {isFullscreen ? <Minimize className="h-3 w-3 text-stone-400" /> : <Maximize className="h-3 w-3 text-stone-400" />}
      </button>
      {/* User City */}
      <span className="text-stone-400">
        {userCity}
      </span>
      {/* Vertical Border */}
      <div className="h-4 w-px bg-stone-400" />
      {/* Current Date */}
      <span className="text-stone-400">
        {currentDate}
      </span>
       {/* Current Time */}
       <span className=" text-stone-400">
        {currentTime}
      </span>
    </div>
  )
}

export default BottomNav
