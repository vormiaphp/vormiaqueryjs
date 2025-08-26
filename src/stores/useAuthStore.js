import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Authentication store using Zustand
 * Manages user authentication state, tokens, permissions, and roles
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Token management
      token: null,
      refreshToken: null,
      tokenExpiry: null,

      // User data
      user: null,
      permissions: [],
      roles: [],

      // Auth state
      isAuthenticated: false,
      isLoading: false,
      isOffline: false,

      // Auth methods
      setToken: (token, refreshToken = null, expiry = null) => {
        set({
          token,
          refreshToken,
          tokenExpiry: expiry,
          isAuthenticated: !!token,
        });
      },

      setUser: (user) => {
        set({
          user,
          permissions: user?.permissions || [],
          roles: user?.roles || [],
        });
      },

      login: (token, user, refreshToken = null, expiry = null) => {
        set({
          token,
          refreshToken,
          tokenExpiry: expiry,
          user,
          permissions: user?.permissions || [],
          roles: user?.roles || [],
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          token: null,
          refreshToken: null,
          tokenExpiry: null,
          user: null,
          permissions: [],
          roles: [],
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setOffline: (offline) => {
        set({ isOffline: offline });
      },

      // Token validation
      isTokenExpired: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return true;
        return Date.now() >= tokenExpiry;
      },

      shouldRefreshToken: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return false;
        // Refresh 5 minutes before expiry
        return Date.now() >= tokenExpiry - 300000;
      },

      // Permission checking
      hasPermission: (permission) => {
        const { permissions } = get();
        if (!permissions || !permissions.length) return false;

        if (Array.isArray(permission)) {
          // Check if user has ALL permissions in the array
          return permission.every((perm) => permissions.includes(perm));
        }

        return permissions.includes(permission);
      },

      hasAnyPermission: (permissions) => {
        const { permissions: userPermissions } = get();
        if (!userPermissions || !userPermissions.length) return false;

        return permissions.some((permission) =>
          userPermissions.includes(permission)
        );
      },

      // Role checking
      hasRole: (role) => {
        const { roles } = get();
        if (!roles || !roles.length) return false;

        if (Array.isArray(role)) {
          // Check if user has ANY of the specified roles
          return role.some((r) => roles.includes(r));
        }

        return roles.includes(role);
      },

      hasAllRoles: (roles) => {
        const { roles: userRoles } = get();
        if (!userRoles || !userRoles.length) return false;

        return roles.every((role) => userRoles.includes(role));
      },

      // Common role checks
      isAdmin: () => {
        const { roles } = get();
        return (
          roles?.some((role) =>
            [
              "admin",
              "Admin",
              "ADMIN",
              "administrator",
              "Administrator",
            ].includes(role)
          ) || false
        );
      },

      isModerator: () => {
        const { roles } = get();
        return (
          roles?.some((role) =>
            ["moderator", "Moderator", "MODERATOR", "mod", "Mod"].includes(role)
          ) || false
        );
      },

      isSuperUser: () => {
        const { roles } = get();
        return (
          roles?.some((role) =>
            [
              "superuser",
              "SuperUser",
              "SUPER_USER",
              "super_user",
              "super",
            ].includes(role)
          ) || false
        );
      },

      // Resource access checking
      canAccess: (resource, action = "view") => {
        const permission = `${action}_${resource}`;
        return get().hasPermission(permission);
      },

      canCreate: (resource) => get().canAccess(resource, "create"),
      canRead: (resource) => get().canAccess(resource, "view"),
      canUpdate: (resource) => get().canAccess(resource, "edit"),
      canDelete: (resource) => get().canAccess(resource, "delete"),

      // Common permission checks
      canManageUsers: () => {
        const { hasPermission, isAdmin, isSuperUser } = get();
        return (
          hasPermission(["manage_users", "user_management", "admin_users"]) ||
          isAdmin() ||
          isSuperUser()
        );
      },

      canViewReports: () => {
        const { hasPermission, isAdmin, isModerator } = get();
        return (
          hasPermission(["view_reports", "report_access", "reports_view"]) ||
          isAdmin() ||
          isModerator()
        );
      },

      canAddUsers: () => {
        const { hasPermission, isAdmin, isSuperUser } = get();
        return (
          hasPermission(["add_users", "create_users", "user_creation"]) ||
          isAdmin() ||
          isSuperUser()
        );
      },
    }),
    {
      name: "vormia-auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        tokenExpiry: state.tokenExpiry,
        user: state.user,
        permissions: state.permissions,
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
