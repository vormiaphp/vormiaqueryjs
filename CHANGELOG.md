# Changelog

All notable changes to this project will be documented in this file.

## [2.1.4] - 2024-01-01

### Added
- **Form Data Transformation**: Added `formdata` configuration option to `useVrmMutation` hook for automatic form data transformation
  - Support for field renaming (e.g., `confirmPassword` → `password_confirmation`)
  - Support for adding new fields (e.g., `terms: true`)
  - Support for removing fields (e.g., removing `confirmPassword` after transformation)
- **Enhanced Error Handling**: Improved `VormiaError` class to properly handle API response structure
  - Added support for `success`, `message`, `errors`, and `debug` fields in API responses
  - Enhanced `getValidationErrors()` method to extract validation errors from the `errors` field
  - Better error message extraction from API response structure

### Changed
- **Code Formatting**: Updated code style to use double quotes consistently throughout the codebase
- **Error Processing**: Modified error handling to work with standard API response format:
  ```javascript
  {
    success: false,
    message: "Validation errors",
    errors: { field: "error message" },
    debug: { ... }
  }
  ```

### Fixed
- **Form Data Transformation**: Fixed issue where `formdata` configuration in `useVrmMutation` was not being applied
- **Validation Error Extraction**: Fixed `getValidationErrors()` returning `null` when validation errors were present in API response

## [2.1.3] - 2024-01-01

### Fixed
- Missing `VormiaError` export from main package causing import errors
- Added missing `./astro` subpath export in package.json

## [2.1.2] - 2024-01-01

### Fixed
- Missing `createDebugInfo` export from React adapter
- Incorrect import paths in examples (using `vormiaqueryjs/adapters/*` instead of `vormiaqueryjs/*`)
- Missing exports in Solid.js adapter

### Changed
- Updated examples to use correct import patterns from framework-specific adapters
- Cleaned up documentation formatting for better AI comprehension

## [2.1.1] - 2024-01-01

### Fixed
- Package version not updated in package.json after git tag creation
- Git tag synchronization issues

## [2.1.0] - 2024-01-01

### Added
- Enhanced error handling with `VormiaError` class
- Debug information utilities with `createDebugInfo` and `getDebugConfig`
- Comprehensive error handling for different HTTP status codes
- Support for validation errors (422 status)
- Database error detection and user-friendly messages
- Environment-aware error messages (development vs production)

### Changed
- Improved error handling architecture
- Better error message formatting
- Enhanced debug information for developers

### Fixed
- Various error handling edge cases
- Improved error message clarity

## [2.0.1] - 2024-01-01

### Initial Release
- Core VormiaQueryJS functionality
- Framework adapters for React, Vue, Svelte, Solid, Qwik, and Astro
- Basic hooks and utilities
- Route guards and authentication
- Caching and state management
