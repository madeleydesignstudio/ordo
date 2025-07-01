import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  children: React.ReactNode
}

function AuthCard({ 
  title, 
  description, 
  children, 
  className,
  ...props 
}: AuthCardProps) {
  return (
    <div 
      className={cn(
        "flex flex-col justify-center min-h-screen px-6 py-12 lg:px-8",
        className
      )}
      {...props}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        <div className="mt-10 space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export { AuthCard } 