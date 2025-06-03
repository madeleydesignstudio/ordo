import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useAuthHybrid } from "../../hooks/use-auth-hybrid";

export const Route = createFileRoute("/_auth/login")({
  component: LoginForm,
});

function LoginForm() {
  const { signInWithGoogle, isLoading } = useAuthHybrid();
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setErrorMessage("");
      const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const callbackURL = isDevelopment 
        ? import.meta.env.VITE_DASHBOARD_DEV_URL
        : import.meta.env.VITE_DASHBOARD_PROD_URL;
      
      await signInWithGoogle(callbackURL);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Sign in failed');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Form Section - Left Half */}
      <div className="flex w-full items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to your account to continue
            </p>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
          >
            {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>

          {errorMessage && (
            <div className="text-destructive text-center text-sm">
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* Image Section - Right Half */}
      <div className="hidden w-1/2 bg-gray-100 lg:block">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://storage.dev-0af.workers.dev/ordo-logo.png')" }}
        >
        </div>
      </div>
    </div>
  );
}
