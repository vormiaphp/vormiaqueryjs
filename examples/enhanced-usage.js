/**
 * Enhanced VormiaQueryJS Usage Examples
 * This file demonstrates all the new features implemented
 */

import {
  VormiaProvider,
  useVormiaQuery,
  useVormiaQueryAuth,
  useVormiaQueryAuthMutation,
  useVormiaQuerySimple,
} from "vormiaqueryjs";

// ============================================================================
// Enhanced Usage Examples for VormiaQueryJS
// ============================================================================

import {
  VormiaProvider,
  useVormiaQuery,
  useVormiaQueryAuth,
  useVormiaQueryAuthMutation,
  useVormiaQuerySimple,
} from "vormiaqueryjs";

// ============================================================================
// SIMPLIFIED PROVIDER SETUP
// ============================================================================

function App() {
  return (
    <VormiaProvider config={{ 
      baseURL: import.meta.env.VITE_VORMIA_API_URL 
    }}>
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

# Notification System (enabled by default)
VITE_VORMIA_NOTIFICATION_TOAST=true      # Enable toast notifications
VITE_VORMIA_NOTIFICATION_PANEL=true      # Enable notification panels
VITE_VORMIA_NOTIFICATION_DURATION=5000   # Toast duration in milliseconds

# Debug System (disabled by default)
VITE_VORMIA_DEBUG=false                  # Enable debug panel
VITE_VORMIA_ENV=local                   # Environment (local/production)
*/

// ============================================================================
// BASIC QUERY (No Auth)
// ============================================================================

function PublicDataComponent() {
  const query = useVormiaQuery({
    endpoint: "/public/data",
    method: "GET",
    
    // Override notification settings per-query
    enableNotifications: { toast: true, panel: false },
    
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
    
    // Override global settings per-query
    enableNotifications: { toast: false, panel: true },
    showDebug: false,
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

  // PER-QUERY FORM DATA TRANSFORMATION (not global)
  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/register",
    method: "POST",
    
    // Form data transformation per-query
    formdata: {
      // Rename fields
      rename: {
        confirmPassword: "password_confirmation",
        user_name: "name",
      },
      
      // Add fields
      add: {
        terms: true,
        source: "registration_form",
      },
      
      // Remove fields
      remove: ["confirmPassword", "tempField"],
    },
    
    // Override global settings per-query
    enableNotifications: { toast: true, panel: true },
    showDebug: true,
    
    // Custom success/error handlers
    onSuccess: (data) => {
      console.log("Registration successful:", data);
      // Navigate to login
      navigate("/login");
    },
    
    onError: (error) => {
      console.log("Registration failed:", error);
      // Handle field errors automatically
      const hasFieldErrors =
        error.response?.errors || error.response?.response?.data?.errors;
      if (hasFieldErrors) {
        // Package automatically handles field error mapping
        // based on the formdata configuration
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
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
        }
        placeholder="Full Name"
      />
      {fieldErrors.name && <span className="error">{fieldErrors.name}</span>}
      
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, email: e.target.value }))
        }
        placeholder="Email"
      />
      {fieldErrors.email && <span className="error">{fieldErrors.email}</span>}
      
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
        <span className="error">{fieldErrors.password}</span>
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
      {fieldErrors.confirmPassword && (
        <span className="error">{fieldErrors.confirmPassword}</span>
      )}
      
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating Account..." : "Create Account"}
      </button>
      
      {generalError && <p className="error">{generalError}</p>}
    </form>
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

  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/register",
    method: "POST",
    
    // Disable automatic transformation
    manualTransformation: true,
    
    // Override global settings per-query
    enableNotifications: { toast: false, panel: true },
    showDebug: false,
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
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}

// ============================================================================
// SIMPLE TEST QUERY
// ============================================================================

function TestComponent() {
  const testQuery = useVormiaQuerySimple({
    endpoint: "/test",
    method: "POST", // or GET, PATCH, PUT, DELETE
    
    // Override global settings per-query
    enableNotifications: { toast: true, panel: false },
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
    
    // Or execute asynchronously
    // testQuery.executeAsync({ test: "data" }).then(result => {
    //   console.log("Async result:", result);
    // });
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
// FRAMEWORK AGNOSTIC USAGE
// ============================================================================

function getFrameworkAgnosticContent() {
  // Example mutation with form transformation
  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/register",
    formdata: {
      confirmPassword: "password_confirmation",
      add: { terms: true },
      remove: ["confirmPassword"],
    },
  });

  // Get notification HTML for any framework
  const successNotificationHtml = mutation.getNotificationHtml(
    "success",
    "Success",
    "Account created successfully!"
  );

  // Usage in different frameworks:
  
  // Vue
  // <div v-html="successNotificationHtml"></div>
  
  // Svelte
  // {@html successNotificationHtml}
  
  // Vanilla JS
  // document.getElementById('notifications').innerHTML = successNotificationHtml;
  
  // Angular
  // <div [innerHTML]="successNotificationHtml"></div>
  
  // SolidJS
  // <div innerHTML={successNotificationHtml}></div>
}

// ============================================================================
// ENHANCED NOTIFICATION EXAMPLES
// ============================================================================

import {
  NotificationPanel,
  showSuccessBanner,
  showSuccessInApp,
  showSuccessModal,
  showErrorBanner,
  showErrorInApp,
  showErrorModal,
  showWarningBanner,
  showWarningInApp,
  showWarningModal,
  showInfoBanner,
  showInfoInApp,
  showInfoModal,
} from "vormiaqueryjs";

// ============================================================================
// BANNER NOTIFICATIONS (Top of page)
// ============================================================================

function BannerNotificationExample() {
  const [bannerNotification, setBannerNotification] = useState(null);

  const showBanner = (type) => {
    let notification;
    switch (type) {
      case "success":
        notification = showSuccessBanner(
          "Your changes have been saved successfully!",
          "Changes Saved"
        );
        break;
      case "error":
        notification = showErrorBanner(
          "Failed to save changes. Please try again.",
          "Save Failed"
        );
        break;
      case "warning":
        notification = showWarningBanner(
          "You have unsaved changes. Save before leaving?",
          "Unsaved Changes"
        );
        break;
      case "info":
        notification = showInfoBanner(
          "New features are available. Check them out!",
          "New Features"
        );
        break;
    }
    setBannerNotification(notification);
  };

  return (
    <div>
      {/* Banner notification at top */}
      {bannerNotification && (
        <NotificationPanel
          notification={bannerNotification}
          onClose={() => setBannerNotification(null)}
        />
      )}

      {/* Banner controls */}
      <div className="space-x-2">
        <button onClick={() => showBanner("success")}>Show Success Banner</button>
        <button onClick={() => showBanner("error")}>Show Error Banner</button>
        <button onClick={() => showBanner("warning")}>Show Warning Banner</button>
        <button onClick={() => showBanner("info")}>Show Info Banner</button>
      </div>
    </div>
  );
}

// ============================================================================
// IN-APP NOTIFICATIONS (Inline, above forms)
// ============================================================================

function InAppNotificationExample() {
  const [inAppNotification, setInAppNotification] = useState(null);

  const showInApp = (type) => {
    let notification;
    switch (type) {
      case "success":
        notification = showSuccessInApp(
          "Form submitted successfully!",
          "Success"
        );
        break;
      case "error":
        notification = showErrorInApp(
          "Please fix the errors below.",
          "Form Errors"
        );
        break;
      case "warning":
        notification = showWarningInApp(
          "Some fields may be incomplete.",
          "Warning"
        );
        break;
      case "info":
        notification = showInfoInApp(
          "All fields marked with * are required.",
          "Form Info"
        );
        break;
    }
    setInAppNotification(notification);
  };

  return (
    <div>
      {/* In-app notification above form */}
      {inAppNotification && (
        <NotificationPanel
          notification={inAppNotification}
          onClose={() => setInAppNotification(null)}
        />
      )}

      {/* Form */}
      <form className="space-y-4">
        <h3>Contact Form</h3>
        
        {/* Form fields */}
        <div>
          <label>Name *</label>
          <input type="text" placeholder="Enter your name" />
        </div>
        
        <div>
          <label>Email *</label>
          <input type="email" placeholder="Enter your email" />
        </div>

        {/* In-app notification controls */}
        <div className="space-x-2">
          <button type="button" onClick={() => showInApp("success")}>
            Show Success
          </button>
          <button type="button" onClick={() => showInApp("error")}>
            Show Error
          </button>
          <button type="button" onClick={() => showInApp("warning")}>
            Show Warning
          </button>
          <button type="button" onClick={() => showInApp("info")}>
            Show Info
          </button>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

// ============================================================================
// MODAL NOTIFICATIONS (Overlay)
// ============================================================================

function ModalNotificationExample() {
  const [modalNotification, setModalNotification] = useState(null);

  const showModal = (type) => {
    let notification;
    switch (type) {
      case "success":
        notification = showSuccessModal(
          "Your account has been created successfully! You can now log in.",
          "Account Created"
        );
        break;
      case "error":
        notification = showErrorModal(
          "An unexpected error occurred. Please contact support if the problem persists.",
          "System Error"
        );
        break;
      case "warning":
        notification = showWarningModal(
          "This action cannot be undone. Are you sure you want to continue?",
          "Confirm Action"
        );
        break;
      case "info":
        notification = showInfoModal(
          "Your session will expire in 5 minutes. Save your work.",
          "Session Expiry"
        );
        break;
    }
    setModalNotification(notification);
  };

  return (
    <div>
      {/* Modal notification overlay */}
      {modalNotification && (
        <NotificationPanel
          notification={modalNotification}
          onClose={() => setModalNotification(null)}
        />
      )}

      {/* Modal controls */}
      <div className="space-x-2">
        <button onClick={() => showModal("success")}>Show Success Modal</button>
        <button onClick={() => showModal("error")}>Show Error Modal</button>
        <button onClick={() => showModal("warning")}>Show Warning Modal</button>
        <button onClick={() => showModal("info")}>Show Info Modal</button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPREHENSIVE NOTIFICATION USAGE
// ============================================================================

function ComprehensiveNotificationExample() {
  const [notifications, setNotifications] = useState({
    banner: null,
    inapp: null,
    modal: null,
  });

  const showNotification = (variant, type) => {
    const messages = {
      success: {
        title: "Success",
        message: "Operation completed successfully!",
      },
      error: {
        title: "Error",
        message: "Something went wrong. Please try again.",
      },
      warning: {
        title: "Warning",
        message: "Please review the information before proceeding.",
      },
      info: {
        title: "Information",
        message: "Here's some helpful information for you.",
      },
    };

    const { title, message } = messages[type];
    let notification;

    switch (variant) {
      case "banner":
        switch (type) {
          case "success":
            notification = showSuccessBanner(message, title);
            break;
          case "error":
            notification = showErrorBanner(message, title);
            break;
          case "warning":
            notification = showWarningBanner(message, title);
            break;
          case "info":
            notification = showInfoBanner(message, title);
            break;
        }
        setNotifications(prev => ({ ...prev, banner: notification }));
        break;

      case "inapp":
        switch (type) {
          case "success":
            notification = showSuccessInApp(message, title);
            break;
          case "error":
            notification = showErrorInApp(message, title);
            break;
          case "warning":
            notification = showWarningInApp(message, title);
            break;
          case "info":
            notification = showInfoInApp(message, title);
            break;
        }
        setNotifications(prev => ({ ...prev, inapp: notification }));
        break;

      case "modal":
        switch (type) {
          case "success":
            notification = showSuccessModal(message, title);
            break;
          case "error":
            notification = showErrorModal(message, title);
            break;
          case "warning":
            notification = showWarningModal(message, title);
            break;
          case "info":
            notification = showInfoModal(message, title);
            break;
        }
        setNotifications(prev => ({ ...prev, modal: notification }));
        break;
    }
  };

  const clearNotification = (variant) => {
    setNotifications(prev => ({ ...prev, [variant]: null }));
  };

  return (
    <div className="space-y-8">
      {/* Banner Notification */}
      {notifications.banner && (
        <NotificationPanel
          notification={notifications.banner}
          onClose={() => clearNotification("banner")}
        />
      )}

      {/* In-App Notification */}
      {notifications.inapp && (
        <NotificationPanel
          notification={notifications.inapp}
          onClose={() => clearNotification("inapp")}
        />
      )}

      {/* Modal Notification */}
      {notifications.modal && (
        <NotificationPanel
          notification={notifications.modal}
          onClose={() => clearNotification("modal")}
        />
      )}

      {/* Notification Controls */}
      <div className="grid grid-cols-3 gap-4">
        {/* Banner Controls */}
        <div className="border p-4 rounded">
          <h4 className="font-semibold mb-2">Banner Notifications</h4>
          <div className="space-y-2">
            <button onClick={() => showNotification("banner", "success")}>
              Success Banner
            </button>
            <button onClick={() => showNotification("banner", "error")}>
              Error Banner
            </button>
            <button onClick={() => showNotification("banner", "warning")}>
              Warning Banner
            </button>
            <button onClick={() => showNotification("banner", "info")}>
              Info Banner
            </button>
          </div>
        </div>

        {/* In-App Controls */}
        <div className="border p-4 rounded">
          <h4 className="font-semibold mb-2">In-App Notifications</h4>
          <div className="space-y-2">
            <button onClick={() => showNotification("inapp", "success")}>
              Success In-App
            </button>
            <button onClick={() => showNotification("inapp", "error")}>
              Error In-App
            </button>
            <button onClick={() => showNotification("inapp", "warning")}>
              Warning In-App
            </button>
            <button onClick={() => showNotification("inapp", "info")}>
              Info In-App
            </button>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="border p-4 rounded">
          <h4 className="font-semibold mb-2">Modal Notifications</h4>
          <div className="space-y-2">
            <button onClick={() => showNotification("modal", "success")}>
              Success Modal
            </button>
            <button onClick={() => showNotification("modal", "error")}>
              Error Modal
            </button>
            <button onClick={() => showNotification("modal", "warning")}>
              Warning Modal
            </button>
            <button onClick={() => showNotification("modal", "info")}>
              Info Modal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  App,
  PublicDataComponent,
  UserProfileComponent,
  RegistrationForm,
  ManualTransformationForm,
  TestComponent,
  getFrameworkAgnosticContent,
  // New notification examples
  BannerNotificationExample,
  InAppNotificationExample,
  ModalNotificationExample,
  ComprehensiveNotificationExample,
};
