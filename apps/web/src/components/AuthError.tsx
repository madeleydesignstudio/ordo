import { AlertCircle, X } from "lucide-react";

interface AuthErrorProps {
  message: string;
  onDismiss: () => void;
}

export const AuthError = ({ message, onDismiss }: AuthErrorProps) => {
  if (!message) return null;

  const isError =
    message.toLowerCase().includes("error") ||
    message.toLowerCase().includes("invalid") ||
    message.toLowerCase().includes("failed");

  return (
    <div
      className={`mt-4 p-4 rounded-md border ${
        isError
          ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
          : "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isError ? (
            <AlertCircle className="h-5 w-5 mt-0.5" />
          ) : (
            <div className="h-5 w-5 mt-0.5 rounded-full bg-green-400 flex items-center justify-center">
              <svg
                className="h-3 w-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            type="button"
            onClick={onDismiss}
            className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isError
                ? "text-red-500 hover:bg-red-100 focus:ring-red-600 dark:text-red-400 dark:hover:bg-red-900/30 dark:focus:ring-red-500"
                : "text-green-500 hover:bg-green-100 focus:ring-green-600 dark:text-green-400 dark:hover:bg-green-900/30 dark:focus:ring-green-500"
            }`}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
