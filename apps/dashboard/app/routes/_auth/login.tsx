import { Button } from "@ordo/ui-web/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import authClient from "../../auth/auth-client";

export const Route = createFileRoute("/_auth/login")({
  component: LoginForm,
});

function LoginForm() {
  const { redirectUrl } = Route.useRouteContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="text-center">
          <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
        </div>
        
        <Button
          variant="outline"
          className="w-full"
          type="button"
          disabled={isLoading}
          onClick={() => {
            // Determine the correct callback URL based on environment
            const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
            const callbackURL = isDevelopment 
              ? "http://localhost:3001/" 
              : "https://ordo-dashboard.netlify.app/";
            
            authClient.signIn.social(
              {
                provider: "google",
                callbackURL,
              },
              {
                onRequest: () => {
                  setIsLoading(true);
                  setErrorMessage("");
                },
                onError: (ctx) => {
                  setIsLoading(false);
                  setErrorMessage(ctx.error.message);
                },
              },
            )
          }}
        >
          {isLoading && <LoaderCircle className="animate-spin" />}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          {isLoading ? "Signing in..." : "Login with Google"}
        </Button>

        {errorMessage && (
          <span className="text-destructive text-center text-sm">
            {errorMessage}
          </span>
        )}
      </div>
    </div>
  );
}
