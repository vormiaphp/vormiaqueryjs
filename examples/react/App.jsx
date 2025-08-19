import React, { useState, useEffect } from "react";
import {
  useVormiaQueryAuthMutation,
  SimpleNotification,
  NotificationPanel,
  ErrorDebugPanel,
} from "vormiaqueryjs";

export default function App() {
  // State management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [notification, setNotification] = useState(null);

  // Set debug panel visibility on component mount
  useEffect(() => {
    const isDebugEnabled = import.meta.env.VITE_VORMIA_DEBUG === "true";
    setShowDebug(isDebugEnabled);

    // Show welcome notification
    setNotification({
      type: "success",
      title: "System Ready",
      message: "Welcome to VormiaQueryJS Debug & Notification System!",
      variant: "banner",
    });
  }, []);

  // VormiaQueryJS mutation with integrated error handling
  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/api/register",
    method: "POST",
    
    // Automatic form data transformation
    formdata: {
      rename: {
        confirmPassword: "password_confirmation",
      },
      add: {
        terms: true,
        source: "web",
      },
      remove: ["confirmPassword"],
    },
    
    // Enable notifications and debug
    enableNotifications: { toast: true, panel: true },
    showDebug: true,
    
    onSuccess: (data) => {
      // Handle success
      setNotification({
        type: "success",
        title: "Success",
        message: "User registered successfully!",
        variant: "banner",
      });

      // Set debug info for debug panel
      const debugInfo = {
        status: 200,
        message: "Operation successful",
        response: {
          response: {
            data: {
              success: true,
              message: data?.data?.message || "Operation completed successfully",
              data: data?.data,
              debug: data?.debug,
            },
          },
          debug: data?.debug,
        },
        errorType: "success",
        timestamp: new Date().toISOString(),
      };

      setDebugInfo(debugInfo);
      setShowDebug(true);

      // Clear errors and reset form
      setFieldErrors({});
      setGeneralError("");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    },

    onError: (error) => {
      // Handle error
      setNotification({
        type: "error",
        title: "Error",
        message: error.message || "Registration failed",
        variant: "banner",
      });

      // Set debug info
      const debugInfo = {
        status: error.status || 500,
        message: error.message || "Registration failed",
        response: error.response,
        errorType: "error",
        timestamp: new Date().toISOString(),
      };

      setDebugInfo(debugInfo);
      setShowDebug(true);

      // Handle field errors if available
      if (error.response?.errors) {
        setFieldErrors(error.response.errors);
        setGeneralError("");
      } else {
        setGeneralError(error.message || "Registration failed");
        setFieldErrors({});
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFieldErrors({});
    setGeneralError("");
    
    // Just pass formData - package handles transformation automatically!
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        VormiaQueryJS Example
      </h1>

      {/* Notification Display */}
      {notification && (
        <NotificationPanel
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Debug Panel */}
      {debugInfo && showDebug && (
        <ErrorDebugPanel
          debugInfo={debugInfo}
          showDebug={showDebug}
          onClose={() => setDebugInfo(null)}
        />
      )}

      {/* Registration Form */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">User Registration</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors.name && (
              <SimpleNotification
                type="error"
                message={fieldErrors.name}
                onClose={() => setFieldErrors(prev => ({ ...prev, name: "" }))}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors.email && (
              <SimpleNotification
                type="error"
                message={fieldErrors.email}
                onClose={() => setFieldErrors(prev => ({ ...prev, email: "" }))}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors.password && (
              <SimpleNotification
                type="error"
                message={fieldErrors.password}
                onClose={() => setFieldErrors(prev => ({ ...prev, password: "" }))}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              placeholder="Confirm your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* General Error Display */}
        {generalError && (
          <div className="mt-4">
            <SimpleNotification
              type="error"
              message={generalError}
              onClose={() => setGeneralError("")}
            />
          </div>
        )}
      </div>

      {/* Debug Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {showDebug ? "Hide Debug Panel" : "Show Debug Panel"}
        </button>
      </div>

      {/* Status Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Form Status</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>Loading: {mutation.isPending ? "Yes" : "No"}</p>
          <p>Has Data: {mutation.data ? "Yes" : "No"}</p>
          <p>Has Error: {mutation.error ? "Yes" : "No"}</p>
          <p>Field Errors: {Object.keys(fieldErrors).length}</p>
          <p>General Error: {generalError ? "Yes" : "No"}</p>
          <p>Debug Enabled: {showDebug ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
  );
}
