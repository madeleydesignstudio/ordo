import { createContext, useContext, useState, ReactNode } from "react";

interface FocusContextType {
  isFocused: boolean;
  toggleFocus: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function useFocus() {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error("useFocus must be used within a FocusProvider");
  }
  return context;
}

interface FocusProviderProps {
  children: ReactNode;
}

export function FocusProvider({ children }: FocusProviderProps) {
  const [isFocused, setIsFocused] = useState(false);

  const toggleFocus = () => {
    setIsFocused(prev => !prev);
  };

  return (
    <FocusContext.Provider value={{ isFocused, toggleFocus }}>
      {children}
    </FocusContext.Provider>
  );
}
