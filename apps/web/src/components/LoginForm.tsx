import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "@tanstack/react-router";
import { toast } from "@ordo/ui/components/sonner";
import { Button } from "@ordo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ordo/ui/components/form";
import { Input } from "@ordo/ui/components/input";
import { Loader2, Mail, Lock } from "lucide-react";

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Social login button component
interface SocialLoginButtonProps {
  provider: "google" | "github";
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onClick,
  loading,
  disabled,
}) => {
  const config = {
    google: {
      name: "Google",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
    },
    github: {
      name: "GitHub",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
  };

  const { name, icon } = config[provider];

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="w-full relative"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <span className="mr-2">{icon}</span>
      )}
      <span>{loading ? `Signing in...` : name}</span>
    </Button>
  );
};

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [githubLoading, setGithubLoading] = React.useState(false);
  const { signIn, signInWithGoogle, signInWithGitHub } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  const isAnyLoading = isSubmitting || googleLoading || githubLoading;

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        // Different error types can be handled differently
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error(
            "Please check your email and confirm your account first.",
          );
        } else if (error.message.includes("Too many requests")) {
          toast.error(
            "Too many login attempts. Please wait a moment and try again.",
          );
        } else {
          toast.error(error.message || "Failed to sign in. Please try again.");
        }

        // Reset password field on error for security
        form.setValue("password", "");
        form.setFocus("password");
      } else {
        toast.success("Welcome back! You've been signed in successfully.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An unexpected error occurred. Please try again.");
      form.setValue("password", "");
      form.setFocus("password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (
    provider: "google" | "github",
    signInFunction: () => Promise<{ error: any }>,
  ) => {
    const setLoading =
      provider === "google" ? setGoogleLoading : setGithubLoading;

    setLoading(true);

    try {
      const { error } = await signInFunction();

      if (error) {
        if (error.message.includes("popup_closed")) {
          toast.error("Sign in was cancelled. Please try again.");
        } else if (error.message.includes("network")) {
          toast.error(
            "Network error. Please check your connection and try again.",
          );
        } else {
          toast.error(`Failed to sign in with ${provider}. Please try again.`);
        }
      } else {
        toast.success(`Successfully signed in with ${provider}!`);
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
      toast.error(`An unexpected error occurred with ${provider} sign in.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () =>
    handleSocialLogin("google", signInWithGoogle);

  const handleGitHubSignIn = () =>
    handleSocialLogin("github", signInWithGitHub);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-8 pt-8 pb-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in to your account to continue
          </p>
        </div>

        {/* Main Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        disabled={isAnyLoading}
                        className="pl-10 py-3 bg-gray-50 border-gray-300 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        autoComplete="email"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Password
                    </FormLabel>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your password"
                        disabled={isAnyLoading}
                        className="pl-10 py-3 bg-gray-50 border-gray-300 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        autoComplete="current-password"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isAnyLoading}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <SocialLoginButton
            provider="google"
            onClick={handleGoogleSignIn}
            loading={googleLoading}
            disabled={isAnyLoading}
          />
          <SocialLoginButton
            provider="github"
            onClick={handleGitHubSignIn}
            loading={githubLoading}
            disabled={isAnyLoading}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
