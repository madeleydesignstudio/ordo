"use client";

import { Button } from "@ordo/ui/components/button";
import { Input } from "@ordo/ui/components/input";
import { useState } from "react";

interface WaitlistFormProps {
  initialCount?: number;
}

export function WaitlistForm({ initialCount = 1247 }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitlistCount] = useState(initialCount);

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        // Clear any previous errors on success
        setError(null);
      } else {
        setError(data.message || "Failed to join waitlist. Please try again.");
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setEmail("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-medium border-l-4 border-blue-500 pl-4">
        join waitlist
      </h2>

      <div className="space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          Get early access to the ultimate productivity platform designed to
          bring order to your digital life.
        </p>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Default Form State */}
        {!isSubmitted && (
          <div className="animate-in fade-in duration-500">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                  autoComplete="email"
                />
              </div>
              <Button
                type="submit"
                disabled={
                  isSubmitting || !email.trim() || !isValidEmail(email.trim())
                }
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900 text-white text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    joining...
                  </span>
                ) : (
                  "join waitlist"
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Already Subscribed State */}
        {isSubmitted && (
          <div className="border-2 border-green-200 bg-green-50 p-4 rounded space-y-3 animate-in slide-in-from-top duration-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                🎉 You're on the waitlist!
              </span>
            </div>
            <p className="text-xs text-green-700">
              Thanks for joining! We'll notify you at{" "}
              <span className="font-medium break-all sm:break-normal">
                {email}
              </span>{" "}
              when ordo is ready to organize your world.
            </p>
            <button
              onClick={resetForm}
              className="text-xs text-green-600 hover:text-green-800 underline transition-colors"
            >
              Use a different email
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 animate-in fade-in duration-700 delay-300">
          →{" "}
          <span className="font-medium">{waitlistCount.toLocaleString()}</span>{" "}
          people waiting
        </p>
      </div>
    </div>
  );
}
