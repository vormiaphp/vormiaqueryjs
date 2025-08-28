/**
 * Components index file for VormiaQueryJS
 * Exports framework-agnostic utilities and functions
 */

// Export framework-agnostic utilities
export { createVormiaRouteGuardVue } from "./VormiaRouteGuardVue.js";
export { createVormiaRouteGuardSvelte } from "./VormiaRouteGuardSvelte.js";

// Note: React components are exported through the React adapter
// to prevent dependency resolution issues in non-React environments
