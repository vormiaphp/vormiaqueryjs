// Main entry point
export * from "./client/createVormiaClient.js";
export { useVrmQuery } from "./hooks/useVrmQuery.js";
export {
  useVormiaQueryAuth,
  useVormiaQueryAuthMutation,
} from "./hooks/useVrmAuth.js";
export { useVrmMutation } from "./hooks/useVrmMutation.js";

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
