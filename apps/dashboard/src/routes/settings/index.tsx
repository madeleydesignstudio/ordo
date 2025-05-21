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
    return <div>Please log in to view your settings</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Toaster position="top-right" />
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account settings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-muted-foreground text-sm font-medium">
                  Email Verification
                </h3>
                <p className="text-sm">
                  {user.emailVerified ? "Verified" : "Not verified"}
                </p>
              </div>
              <div>
                <h3 className="text-muted-foreground text-sm font-medium">
                  Account Created
                </h3>
                <p className="text-sm">{format(new Date(user.createdAt), "PPP")}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-muted-foreground text-sm font-medium">
                  Last Updated
                </h3>
                <p className="text-sm">{format(new Date(user.updatedAt), "PPP")}</p>
              </div>
              <div>
                <h3 className="text-muted-foreground text-sm font-medium">User ID</h3>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account session and data.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <Button variant="outline" onClick={handleLogout}>
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
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Enter your full name to confirm</Label>
                  <Input
                    id="name"
                    value={confirmationName}
                    onChange={(e) => setConfirmationName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delete">Type DELETE to confirm</Label>
                  <Input
                    id="delete"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Type DELETE"
                  />
                </div>

                {confirmationError && (
                  <p className="text-sm text-red-500">{confirmationError}</p>
                )}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteAccountMutation.isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirmation}
                  disabled={deleteAccountMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteAccountMutation.isPending
                    ? "Deleting..."
                    : "Yes, delete account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
