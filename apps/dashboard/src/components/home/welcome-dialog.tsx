import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Icons } from "~/components/ui/icons";
import toast from "react-hot-toast";

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeDialog({ isOpen, onClose }: WelcomeDialogProps) {
  const navigate = useNavigate();
  const [workspaceName, setWorkspaceName] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createWorkspaceMutation = useMutation({
    mutationFn: async () => {
      // TODO: Replace with your actual API call
      const response = await fetch("/api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceName,
          username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create workspace");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Workspace created successfully!");
      onClose();
      navigate({ to: "/" });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create workspace");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    createWorkspaceMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
            <Icons.sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">Welcome to Ordo!</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Let's get started by creating your workspace and setting up your profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace" className="text-sm font-medium">
                Workspace Name
              </Label>
              <Input
                id="workspace"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Enter your workspace name"
                required
                className="bg-background border-input focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                This will be your team's workspace name
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                className="bg-background border-input focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                This will be your display name in the workspace
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Icons.rocket className="mr-2 h-4 w-4" />
                  Create Workspace
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 