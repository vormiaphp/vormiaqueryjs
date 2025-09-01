// Main entry point - Framework-agnostic exports only
export * from "./client/createVormiaClient.js";

// Core utilities and types
export const HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
};

// Export types as plain objects for documentation purposes
export { VormiaError } from "./client/utils/VormiaError.js";
export const VormiaConfig = {};
export const VormiaQueryOptions = {};
export const VormiaAuthOptions = {};
export const VormiaMutationOptions = {};
export const VormiaResponse = {};
export const VormiaAuthResponse = {};

// Note: All framework-specific hooks and components are exported through their respective adapters:
// - React: import from 'vormiaqueryjs/react'
// - Vue: import from 'vormiaqueryjs/vue'
// - Svelte: import from 'vormiaqueryjs/svelte'
// - Solid: import from 'vormiaqueryjs/solid'
// - Qwik: import from 'vormiaqueryjs/qwik'
