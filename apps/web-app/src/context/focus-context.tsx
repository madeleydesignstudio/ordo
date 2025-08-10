import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

interface FocusContextType {
  isFocused: boolean;
  toggleFocus: () => void;
  enterFocus: () => void;
  exitFocus: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

interface FocusProviderProps {
  children: ReactNode;
}

export function FocusProvider({ children }: FocusProviderProps) {
  const [isFocused, setIsFocused] = useState(false);

  const toggleFocus = useCallback(() => {
    setIsFocused((prev) => !prev);
  }, []);

  const enterFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const exitFocus = useCallback(() => {
    setIsFocused(false);
  }, []);

  const value: FocusContextType = {
    isFocused,
    toggleFocus,
    enterFocus,
    exitFocus,
  };

  return (
    <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
  );
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error("useFocus must be used within a FocusProvider");
  }
  return context;
}
