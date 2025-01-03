import { Github, Mail } from "lucide-react";

interface SocialLoginButtonProps {
  provider: "github" | "google";
  onClick: () => void;
  isLoading?: boolean;
}

export function SocialLoginButton({
  provider,
  onClick,
  isLoading,
}: SocialLoginButtonProps) {
  const Icon = provider === "github" ? Github : Mail;
  const text = `Continue with ${provider === "github" ? "GitHub" : "Google"}`;

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon className="w-5 h-5" />
      {isLoading ? "Loading..." : text}
    </button>
  );
}
