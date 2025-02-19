import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthForm } from "./components/AuthForm";
import { JournalEditor } from "./components/JournalEditor";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import { UIDashboardHeader } from "./components/DashboardHeader";
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
          path="/*"
          element={
            <ProtectedRoute>
              <UIDashboardHeader />
              <div className="mt-[40px]">
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/project-manager" />}
                  />
                  <Route path="/project-manager" element={<JournalEditor />} />
                  <Route
                    path="/project-manager/calendar"
                    element={
                      <CalendarWeek
                        onDateChange={() => {}}
                        selectedDate={new Date()}
                      />
                    }
                  />
                  <Route
                    path="/project-manager/projects"
                    element={<div>Projects Page</div>}
                  />
                  <Route
                    path="/project-manager/tasks"
                    element={<div>Tasks Page</div>}
                  />
                  <Route
                    path="/project-manager/journal"
                    element={<JournalEditor />}
                  />
                  <Route
                    path="/knowledge-hub"
                    element={<div>Knowledge Hub</div>}
                  />
                </Routes>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
