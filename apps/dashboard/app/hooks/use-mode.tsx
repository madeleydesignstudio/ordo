import { createContext, useContext, useState, useEffect } from 'react'

type ModeType = 'business' | 'home'

interface ModeContextType {
  mode: ModeType
  toggleMode: () => void
  isHomeMode: boolean
  isBusinessMode: boolean
}

// Create the context with a default value
const ModeContext = createContext<ModeContextType | undefined>(undefined)

// Provider component that wraps your app and makes the mode available
export function ModeProvider({ children }: { children: React.ReactNode }) {
  // Get the initial mode from localStorage or default to 'business'
  const [mode, setMode] = useState<ModeType>('business')
  
  // Load the saved mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('appMode') as ModeType
    if (savedMode && (savedMode === 'business' || savedMode === 'home')) {
      setMode(savedMode)
    }
  }, [])
  
  // Save mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('appMode', mode)
  }, [mode])
  
  // Toggle between modes
  const toggleMode = () => {
    setMode(prevMode => prevMode === 'business' ? 'home' : 'business')
  }
  
  // Convenience booleans
  const isHomeMode = mode === 'home'
  const isBusinessMode = mode === 'business'
  
  // The value provided to consumers
  const modeContextValue = {
    mode,
    toggleMode,
    isHomeMode,
    isBusinessMode
  }
  
  return (
    <ModeContext.Provider value={modeContextValue}>
      {children}
    </ModeContext.Provider>
  )
}

// Hook for components to use the mode
export function useMode(): ModeContextType {
  const context = useContext(ModeContext)
  
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  
  return context
}