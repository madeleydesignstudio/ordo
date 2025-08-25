import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "@tanstack/react-router";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          maxWidth: "400px",
          margin: "2rem auto",
          padding: "2rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#fff",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Check Your Email
        </h2>

        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f0f9ff",
            border: "1px solid #0ea5e9",
            borderRadius: "6px",
            marginBottom: "1.5rem",
          }}
        >
          <p style={{ margin: 0, color: "#0c4a6e", fontSize: "0.875rem" }}>
            We've sent a password reset link to <strong>{email}</strong>. Please
            check your email and follow the instructions to reset your password.
          </p>
        </div>

        <div style={{ textAlign: "center" }}>
          <Link
            to="/login"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "2rem auto",
        padding: "2rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        Forgot Password
      </h2>

      <p
        style={{
          textAlign: "center",
          color: "#6b7280",
          fontSize: "0.875rem",
          marginBottom: "1.5rem",
        }}
      >
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
            placeholder="Enter your email"
          />
        </div>

        {error && (
          <div
            style={{
              color: "#dc2626",
              marginBottom: "1rem",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: loading ? "#9ca3af" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "1.5rem",
          }}
        >
          {loading ? "Sending Reset Link..." : "Send Reset Link"}
        </button>
      </form>

      <div style={{ textAlign: "center" }}>
        <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          Remember your password?{" "}
        </span>
        <Link
          to="/login"
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
