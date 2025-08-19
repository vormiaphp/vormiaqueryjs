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
// 1. PROVIDER CONFIGURATION WITH NEW FEATURES
// ============================================================================

function App() {
  return (
    <VormiaProvider
      config={{
        baseURL: "https://api.example.com",

        // Default form data transformation
        defaultFormdata: {
          rename: {
            confirmPassword: "password_confirmation",
            user_name: "name",
          },
          add: {
            terms: true,
            source: "web",
          },
          remove: ["confirmPassword", "tempField"],
        },

        // Notification system configuration
        enableNotifications: {
          toast: true, // Enable toast notifications
          panel: true, // Enable notification panel
        },

        // Debug panel configuration
        enableDebugPanel: true,
        debugEnvVar: "VITE_VORMIA_DEBUG",

        // Other options
        notificationDuration: 5000,
        timeout: 30000,
      }}
    >
      <YourApp />
    </VormiaProvider>
  );
}

// ============================================================================
// 2. BASIC QUERY (NO AUTH) WITH ENHANCED FEATURES
// ============================================================================

function PublicDataComponent() {
  const query = useVormiaQuery({
    endpoint: "/public/data",
    method: "GET",

    // Override global notification settings
    enableNotifications: { toast: true, panel: false },

    // Override global debug settings
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
// 3. AUTHENTICATED QUERY WITH ENHANCED FEATURES
// ============================================================================

function UserProfileComponent() {
  const query = useVormiaQueryAuth({
    endpoint: "/user/profile",
    method: "GET",

    // Override global settings
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
// 4. AUTHENTICATED MUTATION WITH AUTOMATIC FORM DATA TRANSFORMATION
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

  // AUTOMATIC FORM DATA TRANSFORMATION (NEW FEATURE!)
  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/register",
    method: "POST",

    // Automatic form data transformation
    formdata: {
      // Override global rename mappings
      rename: {
        confirmPassword: "password_confirmation",
        user_name: "name",
      },
      // Add additional fields
      add: {
        terms: true,
        source: "registration_form",
      },
      // Remove fields
      remove: ["confirmPassword", "tempField"],
    },

    // Override global settings
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

    // The package will automatically:
    // 1. Rename confirmPassword → password_confirmation
    // 2. Add terms: true and source: "registration_form"
    // 3. Remove confirmPassword from final payload
    // 4. Handle all error parsing and notifications
    // 5. Show debug panel if VITE_VORMIA_DEBUG=true
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
// 5. MANUAL TRANSFORMATION OVERRIDE
// ============================================================================

function ManualTransformationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // MANUAL TRANSFORMATION (OVERRIDE AUTOMATIC)
  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/register",
    method: "POST",

    // Disable automatic transformation
    manualTransformation: true,

    // Override global settings
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
      {/* Same form fields as above */}
      <button type="submit">Create Account (Manual)</button>
    </form>
  );
}

// ============================================================================
// 6. SIMPLE QUERY FOR TESTING
// ============================================================================

function TestComponent() {
  const testQuery = useVormiaQuerySimple({
    endpoint: "/test",
    method: "POST", // or GET, PATCH, PUT, DELETE

    // Override global settings
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
// 7. FRAMEWORK AGNOSTIC USAGE (Vue, Svelte, Vanilla JS, etc.)
// ============================================================================

// Get HTML strings for other frameworks
function getFrameworkAgnosticContent() {
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

  // Get debug panel HTML for any framework
  const debugPanelHtml = mutation.getDebugHtml(
    { data: { success: true, message: "Success" } },
    true
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
// 8. ENVIRONMENT VARIABLE CONFIGURATION
// ============================================================================

// .env file:
// VITE_VORMIA_DEBUG=true
// VITE_VORMIA_ENV=local
// VITE_VORMIA_API_URL=https://api.example.com

// The package automatically:
// 1. Shows debug panel when VITE_VORMIA_DEBUG=true
// 2. Hides debug panel when VITE_VORMIA_DEBUG=false
// 3. Hides debug panel in production builds
// 4. Respects VITE_VORMIA_ENV for environment detection

export {
  App,
  PublicDataComponent,
  UserProfileComponent,
  RegistrationForm,
  ManualTransformationForm,
  TestComponent,
  getFrameworkAgnosticContent,
};
