/**
 * VormiaQueryJS Usage Examples
 * This file demonstrates all current features and components
 */

import React, { useState } from "react";
import {
  VormiaProvider,
  useVormiaQuery,
  useVormiaQueryAuth,
  useVormiaQueryAuthMutation,
  useVormiaQuerySimple,
  SimpleNotification,
  NotificationPanel,
  ErrorDebugPanel,
} from "vormiaqueryjs";

// ============================================================================
// PROVIDER SETUP
// ============================================================================

function App() {
  return (
    <VormiaProvider
      config={{
        baseURL: import.meta.env.VITE_VORMIA_API_URL,
      }}
    >
      <YourApp />
    </VormiaProvider>
  );
}

// ============================================================================
// ENVIRONMENT VARIABLES (.env file)
// ============================================================================

/*
# API Configuration
VITE_VORMIA_API_URL=https://api.example.com

# Debug System (Single Control)
VITE_VORMIA_DEBUG=true                  # true = development mode, false = production mode

# Advanced Configuration (Optional)
VITE_VORMIA_AUTH_TOKEN_KEY=vormia_auth_token  # Custom auth token storage key
VITE_VORMIA_TIMEOUT=30000                     # Request timeout in milliseconds
VITE_VORMIA_WITH_CREDENTIALS=false            # Include credentials in requests
*/

// ============================================================================
// BASIC QUERY (No Auth)
// ============================================================================

function PublicDataComponent() {
  const query = useVormiaQuery({
    endpoint: "/public/data",
    method: "GET",
    
    // Override debug settings per-query
    showDebug: true,
    
    // Cache configuration
    retry: 3,
    cacheTime: 10 * 60 * 1000, // 10 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use enhanced utilities
  const handleSuccess = () => {
    // Show custom notification
    query.showSuccessNotification("Data loaded successfully!", "Success");
    
    // Get notification HTML for other frameworks
    const notificationHtml = query.getNotificationHtml(
      "success",
      "Success",
      "Data loaded!"
    );
    
    // Get debug panel HTML
    const debugHtml = query.getDebugHtml(query.data);
    
    // Log for debugging
    query.logForDebug(query.data, "Public Data Loaded");
  };

  return (
    <div>
      {query.isLoading && <p>Loading...</p>}
      {query.error && <p>Error: {query.error.message}</p>}
      {query.data && (
        <div>
          <h3>Public Data</h3>
          <pre>{JSON.stringify(query.data, null, 2)}</pre>
          <button onClick={handleSuccess}>Show Notifications</button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// AUTHENTICATED QUERY
// ============================================================================

function UserProfileComponent() {
  const query = useVormiaQueryAuth({
    endpoint: "/user/profile",
    method: "GET",
    
    // Override debug settings per-query
    showDebug: true,
    
    // Cache configuration
    retry: 3,
    cacheTime: 10 * 60 * 1000, // 10 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div>
      {query.isLoading && <p>Loading profile...</p>}
      {query.error && <p>Error: {query.error.message}</p>}
      {query.data && (
        <div>
          <h3>User Profile</h3>
          <pre>{JSON.stringify(query.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// AUTHENTICATED MUTATION WITH FORM TRANSFORMATION
// ============================================================================

function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [notification, setNotification] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/register",
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
    
    // Override global settings per-query
    showDebug: true,
    
    // Custom success/error handlers
    onSuccess: (data) => {
      console.log("Registration successful:", data);
      
      // Show success notification
      setNotification({
        type: "success",
        title: "Success",
        message: "Account created successfully!",
        variant: "banner",
      });
      
      // Set debug info
      setDebugInfo({
        status: 200,
        message: "Registration successful",
        response: data,
        errorType: "success",
        timestamp: new Date().toISOString(),
      });
      
      // Clear errors and reset form
      setFieldErrors({});
      setGeneralError("");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    },
    
    onError: (error) => {
      console.log("Registration failed:", error);
      
      // Show error notification
      setNotification({
        type: "error",
        title: "Error",
        message: error.message || "Registration failed",
        variant: "banner",
      });
      
      // Set debug info
      setDebugInfo({
        status: error.status || 500,
        message: error.message || "Registration failed",
        response: error.response,
        errorType: "error",
        timestamp: new Date().toISOString(),
      });
      
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
    <div>
      {/* Notification Display */}
      {notification && (
        <NotificationPanel
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Debug Panel */}
      {debugInfo && (
        <ErrorDebugPanel
          debugInfo={debugInfo}
          showDebug={true}
          onClose={() => setDebugInfo(null)}
        />
      )}
      
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Full Name"
        />
        {fieldErrors.name && (
          <SimpleNotification
            type="error"
            message={fieldErrors.name}
            onClose={() => setFieldErrors(prev => ({ ...prev, name: "" }))}
          />
        )}
        
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="Email"
        />
        {fieldErrors.email && (
          <SimpleNotification
            type="error"
            message={fieldErrors.email}
            onClose={() => setFieldErrors(prev => ({ ...prev, email: "" }))}
          />
        )}
        
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          placeholder="Password"
        />
        {fieldErrors.password && (
          <SimpleNotification
            type="error"
            message={fieldErrors.password}
            onClose={() => setFieldErrors(prev => ({ ...prev, password: "" }))}
          />
        )}
        
        <input
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
          }
          placeholder="Confirm Password"
        />
        
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating Account..." : "Create Account"}
        </button>
        
        {/* General Error Display */}
        {generalError && (
          <SimpleNotification
            type="error"
            message={generalError}
            onClose={() => setGeneralError("")}
          />
        )}
      </form>
    </div>
  );
}

// ============================================================================
// MANUAL TRANSFORMATION EXAMPLE
// ============================================================================

function ManualTransformationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [notification, setNotification] = useState(null);

  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/register",
    method: "POST",
    
    // Disable automatic transformation
    manualTransformation: true,
    
    // Override global settings per-query
    showDebug: false,
    
    onSuccess: (data) => {
      setNotification({
        type: "success",
        title: "Success",
        message: "Account created successfully!",
        variant: "banner",
      });
    },
    
    onError: (error) => {
      setNotification({
        type: "error",
        title: "Error",
        message: error.message || "Registration failed",
        variant: "banner",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Manual transformation (your current way)
    const registrationData = {
      ...formData,
      password_confirmation: formData.confirmPassword,
      confirmPassword: undefined,
      terms: true,
    };
    
    mutation.mutate(registrationData);
  };

  return (
    <div>
      {/* Notification Display */}
      {notification && (
        <NotificationPanel
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
      
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Full Name"
        />
        
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="Email"
        />
        
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          placeholder="Password"
        />
        
        <input
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
          }
          placeholder="Confirm Password"
        />
        
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// SIMPLE NOTIFICATION EXAMPLES
// ============================================================================

function NotificationExamples() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message, title = "") => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
      title,
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div>
      <h3>Notification Examples</h3>
      
      <div className="space-y-4">
        <button onClick={() => addNotification("success", "Operation completed successfully!")}>
          Show Success
        </button>
        
        <button onClick={() => addNotification("error", "Something went wrong!")}>
          Show Error
        </button>
        
        <button onClick={() => addNotification("warning", "Please check your input")}>
          Show Warning
        </button>
        
        <button onClick={() => addNotification("info", "Here's some information")}>
          Show Info
        </button>
        
        <button onClick={() => addNotification("announce", "Important announcement")}>
          Show Announcement
        </button>
      </div>
      
      <div className="mt-6 space-y-2">
        {notifications.map(notification => (
          <SimpleNotification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            title={notification.title}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SIMPLE TEST QUERY
// ============================================================================

function TestComponent() {
  const testQuery = useVormiaQuerySimple({
    endpoint: "/test",
    method: "POST",
    
    // Override debug settings per-query
    showDebug: true,
    
    onSuccess: (data) => {
      console.log("Test successful:", data);
    },
    
    onError: (error) => {
      console.log("Test failed:", error);
    },
  });

  const handleTest = () => {
    // Execute with data
    testQuery.execute({ test: "data" });
  };

  return (
    <div>
      <button onClick={handleTest} disabled={testQuery.isPending}>
        {testQuery.isPending ? "Testing..." : "Run Test"}
      </button>

      {testQuery.data && (
        <div>
          <h3>Test Result</h3>
          <pre>{JSON.stringify(testQuery.data, null, 2)}</pre>
        </div>
      )}

      {testQuery.error && (
        <div>
          <h3>Test Error</h3>
          <pre>{JSON.stringify(testQuery.error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPREHENSIVE EXAMPLE
// ============================================================================

function ComprehensiveExample() {
  return (
    <div className="space-y-8">
      <h2>VormiaQueryJS Comprehensive Examples</h2>
      
      <section>
        <h3>1. Basic Query (No Auth)</h3>
        <PublicDataComponent />
      </section>
      
      <section>
        <h3>2. Authenticated Query</h3>
        <UserProfileComponent />
      </section>
      
      <section>
        <h3>3. Form with Automatic Transformation</h3>
        <RegistrationForm />
      </section>
      
      <section>
        <h3>4. Form with Manual Transformation</h3>
        <ManualTransformationForm />
      </section>
      
      <section>
        <h3>5. Notification Examples</h3>
        <NotificationExamples />
      </section>
      
      <section>
        <h3>6. Simple Test Query</h3>
        <TestComponent />
      </section>
    </div>
  );
}

export default ComprehensiveExample;
