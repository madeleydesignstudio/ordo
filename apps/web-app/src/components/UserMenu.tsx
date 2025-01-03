import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar";
import { useEffect } from "react";
import { UsernamePrompt } from "./UsernamePrompt";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (!data?.username) {
          setShowUsernamePrompt(true);
        }

        setUserData(user);
      }
    };
    getUserData();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      return;
    }
    navigate("/login");
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={userData?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {userData?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-20 py-1">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-medium text-sm">
                  {userData?.user_metadata?.full_name || "User"}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {userData?.email}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>

      {showUsernamePrompt && (
        <UsernamePrompt onComplete={() => setShowUsernamePrompt(false)} />
      )}
    </>
  );
}
