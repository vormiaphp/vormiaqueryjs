# Changelog

All notable changes to VormiaQueryJS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.3] - 2024-12-19

### Fixed
- **CRITICAL**: Resolved Vue dependency resolution errors in React projects
- **CRITICAL**: Resolved React dependency resolution errors in non-React projects
- **CRITICAL**: Fixed "Could not resolve vue" error when installing in React projects
- **CRITICAL**: Fixed "Could not resolve react" error in non-React environments

### Changed
- **MAJOR**: Restructured package exports to prevent dependency conflicts
- **MAJOR**: Moved all framework-specific hooks and components to framework adapters
- **MAJOR**: Main package now only exports framework-agnostic utilities
- **MAJOR**: React-specific functionality moved to `vormiaqueryjs/react` subpath
- **MAJOR**: Vue-specific functionality moved to `vormiaqueryjs/vue` subpath
- **MAJOR**: Svelte-specific functionality moved to `vormiaqueryjs/svelte` subpath
- **MAJOR**: Solid-specific functionality moved to `vormiaqueryjs/solid` subpath
- **MAJOR**: Qwik-specific functionality moved to `vormiaqueryjs/qwik` subpath

### Architecture
- **NEW**: Framework-specific adapter pattern for clean dependency isolation
- **NEW**: Main package exports only core client and utilities
- **NEW**: Framework adapters export all framework-specific functionality
- **NEW**: Zustand stores moved to React adapter (commonly used with React)

### Performance
- **IMPROVED**: Main package bundle size reduced from 4.23 kB to 0.77 kB
- **IMPROVED**: Build time reduced from 333ms to 162ms
- **IMPROVED**: Only 19 modules transformed vs 42 previously

### Documentation
- **UPDATED**: README with correct import patterns for all frameworks
- **UPDATED**: LLMFLOW.md with new export structure and dependency isolation
- **UPDATED**: LLMRULES.md with critical dependency resolution rules
- **ADDED**: Import structure section explaining framework-specific adapters

### Migration Notes
- **BREAKING**: All React hooks and components now require `vormiaqueryjs/react` import
- **BREAKING**: All Vue hooks now require `vormiaqueryjs/vue` import
- **BREAKING**: All Svelte hooks now require `vormiaqueryjs/svelte` import
- **BREAKING**: All Solid hooks now require `vormiaqueryjs/solid` import
- **BREAKING**: All Qwik hooks now require `vormiaqueryjs/qwik` import

## [1.5.2] - 2024-12-19

### Added
- Enhanced caching hooks with auto-refresh and smart fallbacks
- Comprehensive 204 No Content response handling
- Vue.js and Svelte support for Zustand-powered features
- Zustand integration for advanced state management and route protection

### Changed
- Updated Zustand to latest version 5.0.8
- Reorganized README structure for better flow
- Consolidated README features overview

### Fixed
- Improved announce notification contrast with pure black background
- Resolved notification styling issues and added CSS fallback

### Documentation
- Added comprehensive 204 No Content response handling documentation
- Updated README with Vue.js and Svelte support documentation
- Removed outdated version references and migration guides
- Fixed README with accurate notification styling information

## [1.5.1] - 2024-12-19

### Added
- Enhanced caching hooks with auto-refresh and smart fallbacks
- Comprehensive 204 No Content response handling
- Vue.js and Svelte support for Zustand-powered features

### Documentation
- Added comprehensive 204 No Content response handling documentation
- Updated README with Vue.js and Svelte support documentation

## [1.5.0] - 2024-12-19

### Added
- Zustand integration for advanced state management and route protection
- Vue.js and Svelte support for Zustand-powered features

### Changed
- Updated Zustand to latest version 5.0.8

### Documentation
- Reorganized README structure for better flow
- Consolidated README features overview

## [1.4.31] - 2024-12-19

### Fixed
- Improved announce notification contrast with pure black background

### Documentation
- Consolidated README features overview

## [1.4.30] - 2024-12-19

### Fixed
- Resolved notification styling issues and added CSS fallback

### Documentation
- Updated README.md for notification enhancements

## [1.4.29] - 2024-12-19

### Added
- Notification enhancements

### Documentation
- Updated README.md for notification enhancements

## [1.4.28] and earlier

For earlier versions, please refer to the git commit history and previous releases.

---

## Version History Summary

- **1.5.2**: Enhanced caching, 204 response handling, Vue.js/Svelte support, Zustand integration
- **1.5.1**: Enhanced caching hooks, 204 response handling, framework support
- **1.5.0**: Major Zustand integration release
- **1.4.31**: Notification contrast improvements
- **1.4.30**: Notification styling fixes
- **1.4.29**: Notification enhancements

## Migration Notes

- **v1.4.x to v1.5.x**: Introduces Zustand as a peer dependency for enhanced state management
- **v1.5.0+**: Requires Zustand ^5.0.8 for full functionality
- **Framework Support**: Vue.js and Svelte support added as optional peer dependencies
