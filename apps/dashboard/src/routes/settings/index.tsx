import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import authClient from "~/lib/auth-client";

export const Route = createFileRoute("/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [confirmationError, setConfirmationError] = useState("");

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      console.log("[Debug] deleteAccountMutation: mutationFn started");
      await authClient.deleteUser();
      console.log("[Debug] deleteAccountMutation: authClient.deleteUser() finished");
    },
    onSuccess: async () => {
      console.log("[Debug] deleteAccountMutation: onSuccess");
      
      // Clear all local storage and session data
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out to clear any auth tokens
      await authClient.signOut();
      
      toast.success("Account deleted successfully. Redirecting to signup...");
      
      // Force reload and redirect to signup
      setTimeout(() => {
        // Clear any remaining auth state
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Redirect to signup with a clean state
        window.location.href = "/signup";
        window.location.reload();
      }, 2000);
    },
    onError: (error: Error) => {
      console.log("[Debug] deleteAccountMutation: onError");
      console.error("Error deleting account:", error);
      toast.error(`Error deleting account: ${error.message || "Unknown error"}`);
      setIsDeleteDialogOpen(false);
    },
  });

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      let message = "Failed to logout.";
      if (error instanceof Error) {
        message = `Logout failed: ${error.message}`;
      } else if (typeof error === "string") {
        message = `Logout failed: ${error}`;
      } else if (error && typeof error === "object" && "message" in error) {
        message = `Logout failed: ${String(error.message)}`;
      }
      alert(message);
    }
  };

  const handleDeleteConfirmation = () => {
    setConfirmationError("");
    
    if (!confirmationName || !confirmationText) {
      setConfirmationError("Please fill in all fields");
      return;
    }

    if (confirmationName.toLowerCase() !== user?.name?.toLowerCase()) {
      setConfirmationError("Name does not match your account name");
      return;
    }

    if (confirmationText !== "DELETE") {
      setConfirmationError("Please type DELETE in all caps");
      return;
    }

    deleteAccountMutation.mutate();
  };

  const resetConfirmationForm = () => {
    setConfirmationName("");
    setConfirmationText("");
    setConfirmationError("");
  };

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Please log in to view your settings</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-neutral-900 dark:text-neutral-100',
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
          },
        }}
      />
      
      <Card className="bg-neutral-950/50 border-neutral-800 transition-colors">
        <CardHeader className="border-b border-neutral-800">
          <CardTitle className="text-2xl">Profile Settings</CardTitle>
          <CardDescription className="text-neutral-400">Manage your account settings and preferences</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-8 flex items-center space-x-6">
            <Avatar className="h-24 w-24 ring-2 ring-neutral-800 transition-all hover:ring-neutral-700">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="bg-neutral-800 text-neutral-200 text-2xl">
                {user.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold text-neutral-100">{user.name}</h2>
              <p className="text-neutral-400 mt-1">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                <h3 className="text-neutral-400 text-sm font-medium mb-1">
                  Email Verification
                </h3>
                <p className="text-neutral-200 text-sm">
                  {user.emailVerified ? "Verified" : "Not verified"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                <h3 className="text-neutral-400 text-sm font-medium mb-1">
                  Account Created
                </h3>
                <p className="text-neutral-200 text-sm">{format(new Date(user.createdAt), "PPP")}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                <h3 className="text-neutral-400 text-sm font-medium mb-1">
                  Last Updated
                </h3>
                <p className="text-neutral-200 text-sm">{format(new Date(user.updatedAt), "PPP")}</p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                <h3 className="text-neutral-400 text-sm font-medium mb-1">User ID</h3>
                <p className="font-mono text-sm text-neutral-200">{user.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-neutral-950/50 border-neutral-800 transition-colors">
        <CardHeader className="border-b border-neutral-800">
          <CardTitle className="text-2xl">Account Actions</CardTitle>
          <CardDescription className="text-neutral-400">Manage your account session and data.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-neutral-800 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
            >
              Log Out
            </Button>

            <AlertDialog 
              open={isDeleteDialogOpen} 
              onOpenChange={(open) => {
                setIsDeleteDialogOpen(open);
                if (!open) resetConfirmationForm();
              }}
            >
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  className="bg-red-950/50 text-red-400 border-red-900 hover:bg-red-900/50 transition-colors"
                >
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-neutral-950 border-neutral-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl text-neutral-100">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-neutral-400">
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-neutral-300">Enter your full name to confirm</Label>
                    <Input
                      id="name"
                      value={confirmationName}
                      onChange={(e) => setConfirmationName(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delete" className="text-neutral-300">Type DELETE to confirm</Label>
                    <Input
                      id="delete"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="Type DELETE"
                      className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500"
                    />
                  </div>

                  {confirmationError && (
                    <p className="text-sm text-red-400">{confirmationError}</p>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel 
                    disabled={deleteAccountMutation.isPending}
                    className="bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirmation}
                    disabled={deleteAccountMutation.isPending}
                    className="bg-red-950/50 text-red-400 border-red-900 hover:bg-red-900/50"
                  >
                    {deleteAccountMutation.isPending
                      ? "Deleting..."
                      : "Yes, delete account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
