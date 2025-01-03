import { Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loader({ size = "md", className }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2
        className={cn(
          "animate-spin text-blue-500",
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
}
