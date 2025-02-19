import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  BrowserRouter,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthForm } from "./components/AuthForm";
import { JournalEditor } from "./components/JournalEditor";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import DashboardHeader from "@workspace/ui/components/dashboard-header";
import { CalendarWeek } from "@workspace/ui/components/calendar-week";
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/signup" element={<AuthForm type="signup" />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <BrowserRouter>
                <DashboardHeader />
              </BrowserRouter>
              <JournalEditor />
              <CalendarWeek onDateChange={() => {}} selectedDate={new Date()} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
