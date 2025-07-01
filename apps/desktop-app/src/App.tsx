import { useState, useEffect } from "react";
import { auth, db } from "./lib/db";
import {Login} from "./Login";
import { TaskList } from "@workspace/ui/components/task-list";
import { Button } from "@workspace/ui/components/button";
import type { User } from '@supabase/supabase-js';
import "./App.css";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check current session
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);
        setLoading(false);

        // If user exists, create/update their profile
        if (currentUser) {
          await auth.upsertUserProfile(currentUser);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (newUser) => {
      setUser(newUser);
      if (newUser) {
        try {
          await auth.upsertUserProfile(newUser);
        } catch (err) {
          console.error('Profile update error:', err);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    // The useEffect will handle the user state update
    console.log('Login successful');
  };

  const handleSignOut = async () => {
    try {
      setAuthLoading(true);
      await auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Failed to sign out:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Ordo Desktop</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.user_metadata?.avatar_url && (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                disabled={authLoading}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <TaskList user={user} db={db} />
      </div>
    </div>
  );
}

export default App;
