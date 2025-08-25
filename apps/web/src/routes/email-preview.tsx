// src/routes/email-preview.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { WelcomeEmail, PasswordResetEmail } from "@ordo/emails";

export const Route = createFileRoute("/email-preview")({
  component: EmailPreview,
});

type EmailType = "welcome" | "password-reset";

function EmailPreview() {
  const [selectedEmail, setSelectedEmail] = useState<EmailType>("welcome");
  const [previewData, setPreviewData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    verificationUrl:
      "http://localhost:3001/auth/verify?email=john.doe@example.com",
    dashboardUrl: "http://localhost:3001/dashboard",
    resetUrl: "http://localhost:3001/reset-password?token=sample-token",
    expiresIn: "1 hour",
  });

  const renderEmailComponent = () => {
    switch (selectedEmail) {
      case "welcome":
        return (
          <WelcomeEmail
            name={previewData.name}
            email={previewData.email}
            verificationUrl={previewData.verificationUrl}
            dashboardUrl={previewData.dashboardUrl}
          />
        );
      case "password-reset":
        return (
          <PasswordResetEmail
            name={previewData.name}
            email={previewData.email}
            resetUrl={previewData.resetUrl}
            expiresIn={previewData.expiresIn}
          />
        );
      default:
        return <div>Select an email template to preview</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Email Template Preview
          </h1>
          <p className="text-gray-600">
            Preview email templates during development. This page is only
            available in development mode.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Email Templates
              </h2>

              {/* Template Selection */}
              <div className="space-y-2 mb-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="emailType"
                    value="welcome"
                    checked={selectedEmail === "welcome"}
                    onChange={(e) =>
                      setSelectedEmail(e.target.value as EmailType)
                    }
                    className="mr-3"
                  />
                  <span>Welcome Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="emailType"
                    value="password-reset"
                    checked={selectedEmail === "password-reset"}
                    onChange={(e) =>
                      setSelectedEmail(e.target.value as EmailType)
                    }
                    className="mr-3"
                  />
                  <span>Password Reset</span>
                </label>
              </div>

              {/* Preview Data */}
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Preview Data
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={previewData.name}
                    onChange={(e) =>
                      setPreviewData({ ...previewData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={previewData.email}
                    onChange={(e) =>
                      setPreviewData({ ...previewData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                {selectedEmail === "welcome" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Verification URL
                      </label>
                      <input
                        type="url"
                        value={previewData.verificationUrl}
                        onChange={(e) =>
                          setPreviewData({
                            ...previewData,
                            verificationUrl: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dashboard URL
                      </label>
                      <input
                        type="url"
                        value={previewData.dashboardUrl}
                        onChange={(e) =>
                          setPreviewData({
                            ...previewData,
                            dashboardUrl: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </>
                )}
                {selectedEmail === "password-reset" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reset URL
                      </label>
                      <input
                        type="url"
                        value={previewData.resetUrl}
                        onChange={(e) =>
                          setPreviewData({
                            ...previewData,
                            resetUrl: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expires In
                      </label>
                      <input
                        type="text"
                        value={previewData.expiresIn}
                        onChange={(e) =>
                          setPreviewData({
                            ...previewData,
                            expiresIn: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Email Preview:{" "}
                  {selectedEmail === "welcome"
                    ? "Welcome Email"
                    : "Password Reset Email"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  This is how the email will appear to recipients
                </p>
              </div>
              <div className="p-6">
                <div
                  className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                  style={{ minHeight: "600px" }}
                >
                  <div className="p-4">{renderEmailComponent()}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-4">
              <div className="text-sm text-gray-600 flex items-center">
                <svg
                  className="h-4 w-4 mr-2 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Preview shows React components. For HTML output, use the API
                endpoints.
              </div>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Development Only
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                This email preview shows React components for development
                purposes. For actual HTML email rendering, test the API
                endpoints at <code>/api/send-welcome-email</code> and{" "}
                <code>/api/send-reset-email</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
