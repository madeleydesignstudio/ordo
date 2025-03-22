import { createContext, useContext, useState } from "react";

interface DateContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <DateContext.Provider value={{ currentDate, setCurrentDate }}>
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error("useDate must be used within a DateProvider");
  }
  return context;
}
