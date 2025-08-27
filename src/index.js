// Main entry point
export * from "./client/createVormiaClient.js";

// Core hooks
export { useVrmQuery } from "./hooks/useVrmQuery.js";
export { useVormiaQuery } from "./hooks/useVormiaQuery.js";
export { useVormiaQuerySimple } from "./hooks/useVormiaQuerySimple.js";
export {
  useVormiaQueryAuth,
  useVormiaQueryAuthMutation,
  useVormiaAuth,
} from "./hooks/useVrmAuth.js";
export { useVrmMutation } from "./hooks/useVrmMutation.js";

// Provider component for easy setup
export { VormiaProvider } from "./providers/VormiaProvider.jsx";

// Configuration hook for dynamic setup
export { useVormiaConfig } from "./hooks/useVormiaConfig.js";

// Debug & Notification System Components
export * from "./components/index.js";

// Form Data Transformation Utilities
export * from "./utils/formDataTransformer.js";

// Enhanced Error Handling
export * from "./utils/enhancedErrorHandler.js";

// Export Zustand stores and new features
export * from "./stores/index.js";

// Export enhanced authentication hooks for different frameworks
export { useVrmAuthEnhanced } from "./hooks/useVrmAuthEnhanced.js";
export { useVrmAuthEnhancedVue } from "./hooks/useVrmAuthEnhancedVue.js";
export { useVrmAuthEnhancedSvelte } from "./hooks/useVrmAuthEnhancedSvelte.js";
export { useVormiaCache } from "./hooks/useVormiaCache.js";
export { useVormiaCacheVue } from "./hooks/useVormiaCacheVue.js";
export { useVormiaCacheSvelte } from "./hooks/useVormiaCacheSvelte.js";

// Export types as plain objects for documentation purposes
export const VormiaError = {};
export const VormiaConfig = {};
export const VormiaQueryOptions = {};
export const VormiaAuthOptions = {};
export const VormiaMutationOptions = {};
export const VormiaResponse = {};
export const VormiaAuthResponse = {};
export const HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
};
