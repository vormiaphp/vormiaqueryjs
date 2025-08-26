import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import VormiaRouteGuard, { useVormiaGuard } from '../src/components/VormiaRouteGuard.jsx';
import { useAuthStore } from '../src/stores/useAuthStore.js';

// Mock the auth store for testing
vi.mock('../src/stores/useAuthStore.js', () => ({
  useAuthStore: vi.fn()
}));

// Test component that uses the guard
const TestComponent = ({ guardProps }) => {
  const { isAuthorized, isLoading, user, isAuthenticated } = useVormiaGuard(guardProps);
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return <div>Access Denied</div>;
  
  return <div>Protected Content</div>;
};

describe('VormiaRouteGuard', () => {
  beforeEach(() => {
    // Reset mock before each test
    vi.clearAllMocks();
    
    // Default mock implementation
    useAuthStore.mockImplementation(() => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      hasPermission: vi.fn(() => false),
      hasRole: vi.fn(() => false)
    }));
  });

  describe('Basic Protection', () => {
    it('should render children when user is authenticated and has required role', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: true,
        user: { id: 1, name: 'Test User' },
        isLoading: false,
        hasRole: vi.fn(() => true),
        hasPermission: vi.fn(() => true)
      }));

      render(
        <VormiaRouteGuard roles={["admin"]}>
          <div>Admin Content</div>
        </VormiaRouteGuard>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should not render children when user is not authenticated', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        hasRole: vi.fn(() => false),
        hasPermission: vi.fn(() => false)
      }));

      render(
        <VormiaRouteGuard roles={["admin"]}>
          <div>Admin Content</div>
        </VormiaRouteGuard>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('should not render children when user lacks required role', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: true,
        user: { id: 1, name: 'Test User' },
        isLoading: false,
        hasRole: vi.fn(() => false),
        hasPermission: vi.fn(() => false)
      }));

      render(
        <VormiaRouteGuard roles={["admin"]}>
          <div>Admin Content</div>
        </VormiaRouteGuard>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('Permission-Based Protection', () => {
    it('should render children when user has required permissions', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: true,
        user: { id: 1, name: 'Test User' },
        isLoading: false,
        hasRole: vi.fn(() => true),
        hasPermission: vi.fn(() => true)
      }));

      render(
        <VormiaRouteGuard permissions={["manage_users", "delete_posts"]}>
          <div>User Management</div>
        </VormiaRouteGuard>
      );

      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    it('should not render children when user lacks required permissions', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: true,
        user: { id: 1, name: 'Test User' },
        isLoading: false,
        hasRole: vi.fn(() => true),
        hasPermission: vi.fn(() => false)
      }));

      render(
        <VormiaRouteGuard permissions={["manage_users", "delete_posts"]}>
          <div>User Management</div>
        </VormiaRouteGuard>
      );

      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Roles', () => {
          it('should render children when user has ANY of the required roles (requireAll=false)', () => {
        const mockHasRole = vi.fn((role) => {
          if (Array.isArray(role)) {
            return role.some(r => ['admin', 'moderator'].includes(r));
          }
          return ['admin', 'moderator'].includes(role);
        });

        useAuthStore.mockImplementation(() => ({
          isAuthenticated: true,
          user: { id: 1, name: 'Test User' },
          isLoading: false,
          hasRole: mockHasRole,
          hasPermission: vi.fn(() => true)
        }));

        render(
          <VormiaRouteGuard roles={["admin", "moderator"]} requireAll={false}>
            <div>Moderator Content</div>
          </VormiaRouteGuard>
        );

        expect(screen.getByText('Moderator Content')).toBeInTheDocument();
      });

    it('should not render children when user has NONE of the required roles', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: true,
        user: { id: 1, name: 'Test User' },
        isLoading: false,
        hasRole: vi.fn(() => false),
        hasPermission: vi.fn(() => true)
      }));

      render(
        <VormiaRouteGuard roles={["admin", "moderator"]} requireAll={false}>
          <div>Moderator Content</div>
        </VormiaRouteGuard>
      );

      expect(screen.queryByText('Moderator Content')).not.toBeInTheDocument();
    });
  });

  describe('Custom Validation', () => {
    it('should render children when custom validation passes', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: true,
        user: { id: 1, name: 'Test User', isVerified: true, subscription: 'premium' },
        isLoading: false,
        hasRole: vi.fn(() => true),
        hasPermission: vi.fn(() => true)
      }));

      const validateUser = (user) => user?.isVerified && user?.subscription === 'premium';

      render(
        <VormiaRouteGuard validate={validateUser}>
          <div>Premium Content</div>
        </VormiaRouteGuard>
      );

      expect(screen.getByText('Premium Content')).toBeInTheDocument();
    });

    it('should not render children when custom validation fails', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: true,
        user: { id: 1, name: 'Test User', isVerified: false, subscription: 'basic' },
        isLoading: false,
        hasRole: vi.fn(() => true),
        hasPermission: vi.fn(() => true)
      }));

      const validateUser = (user) => user?.isVerified && user?.subscription === 'premium';

      render(
        <VormiaRouteGuard validate={validateUser}>
          <div>Premium Content</div>
        </VormiaRouteGuard>
      );

      expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    });
  });

  describe('Non-Strict Mode', () => {
    it('should allow unauthenticated users when strict=false', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        hasRole: vi.fn(() => false),
        hasPermission: vi.fn(() => false)
      }));

      render(
        <VormiaRouteGuard strict={false} roles={["guest"]}>
          <div>Guest Content</div>
        </VormiaRouteGuard>
      );

      expect(screen.getByText('Guest Content')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading component when isLoading is true', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: false,
        user: null,
        isLoading: true,
        hasRole: vi.fn(() => false),
        hasPermission: vi.fn(() => false)
      }));

      render(
        <VormiaRouteGuard roles={["admin"]}>
          <div>Admin Content</div>
        </VormiaRouteGuard>
      );

      expect(screen.getByText('Checking authorization...')).toBeInTheDocument();
    });

    it('should show custom loading component when provided', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: false,
        user: null,
        isLoading: true,
        hasRole: vi.fn(() => false),
        hasPermission: vi.fn(() => false)
      }));

      render(
        <VormiaRouteGuard 
          roles={["admin"]} 
          loadingComponent={<div>Custom Loading...</div>}
        >
          <div>Admin Content</div>
        </VormiaRouteGuard>
      );

      expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
    });
  });

  describe('Fallback Components', () => {
    it('should show fallback component when access is denied', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: true,
        user: { id: 1, name: 'Test User' },
        isLoading: false,
        hasRole: vi.fn(() => false),
        hasPermission: vi.fn(() => false)
      }));

      render(
        <VormiaRouteGuard 
          roles={["admin"]} 
          fallback={<div>Access Denied</div>}
        >
          <div>Admin Content</div>
        </VormiaRouteGuard>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('useVormiaGuard Hook', () => {
    it('should return correct authorization state', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: true,
        user: { id: 1, name: 'Test User' },
        isLoading: false,
        hasRole: vi.fn(() => true),
        hasPermission: vi.fn(() => true)
      }));

      render(<TestComponent guardProps={{ roles: ["admin"] }} />);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should return access denied when not authorized', () => {
      useAuthStore.mockImplementation(() => ({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        hasRole: vi.fn(() => false),
        hasPermission: vi.fn(() => false)
      }));

      render(<TestComponent guardProps={{ roles: ["admin"] }} />);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });
});
