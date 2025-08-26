import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useAuthStore,
  useCacheStore,
  useStorageStore,
  useSettingsStore,
} from "../src/stores/index.js";

describe("Zustand Stores Integration", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  afterEach(() => {
    // Reset stores after each test
    useAuthStore.getState().logout();
    useCacheStore.getState().clearCache();
    useStorageStore.getState().clearUserPreferences();
    useSettingsStore.getState().resetSettings();
  });

  describe("Auth Store", () => {
    it("should initialize with default state", () => {
      const state = useAuthStore.getState();

      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.permissions).toEqual([]);
      expect(state.roles).toEqual([]);
    });

    it("should set token and update authentication state", () => {
      const { setToken } = useAuthStore.getState();

      setToken("test-token-123");

      const state = useAuthStore.getState();
      expect(state.token).toBe("test-token-123");
      expect(state.isAuthenticated).toBe(true);
    });

    it("should set user data with permissions and roles", () => {
      const { setUser } = useAuthStore.getState();

      const userData = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        permissions: ["read_posts", "create_posts"],
        roles: ["user", "editor"],
      };

      setUser(userData);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(userData);
      expect(state.permissions).toEqual(["read_posts", "create_posts"]);
      expect(state.roles).toEqual(["user", "editor"]);
    });

    it("should check permissions correctly", () => {
      const { setUser, hasPermission } = useAuthStore.getState();

      setUser({
        permissions: ["read_posts", "create_posts", "delete_posts"],
      });

      expect(hasPermission("read_posts")).toBe(true);
      expect(hasPermission("create_posts")).toBe(true);
      expect(hasPermission("delete_posts")).toBe(true);
      expect(hasPermission("admin_access")).toBe(false);
    });

    it("should check roles correctly", () => {
      const { setUser, hasRole } = useAuthStore.getState();

      setUser({
        roles: ["user", "editor", "admin"],
      });

      expect(hasRole("user")).toBe(true);
      expect(hasRole("editor")).toBe(true);
      expect(hasRole("admin")).toBe(true);
      expect(hasRole("superuser")).toBe(false);
    });

    it("should handle login and logout", () => {
      const { login, logout } = useAuthStore.getState();

      const userData = {
        id: 1,
        name: "Test User",
        permissions: ["read_posts"],
        roles: ["user"],
      };

      login("test-token", userData, "refresh-token", Date.now() + 3600000);

      let state = useAuthStore.getState();
      expect(state.token).toBe("test-token");
      expect(state.user).toEqual(userData);
      expect(state.isAuthenticated).toBe(true);

      logout();

      state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("Cache Store", () => {
    it("should set and get cache data", () => {
      const { setCache, getCache } = useCacheStore.getState();

      const testData = { message: "Hello World" };
      setCache("test-key", testData, { ttl: 1000 });

      const retrieved = getCache("test-key");
      expect(retrieved).toEqual(testData);
    });

    it("should handle cache expiration", () => {
      const { setCache, getCache } = useCacheStore.getState();

      setCache("expiring-key", "test", { ttl: 1 }); // 1ms TTL

      // Wait for expiration
      return new Promise((resolve) => {
        setTimeout(() => {
          const retrieved = getCache("expiring-key");
          expect(retrieved).toBeNull();
          resolve();
        }, 10);
      });
    });

    it("should invalidate cache by pattern", () => {
      const { setCache, getCache, invalidateCache } = useCacheStore.getState();

      setCache("user:1", { id: 1, name: "User 1" });
      setCache("user:2", { id: 2, name: "User 2" });
      setCache("post:1", { id: 1, title: "Post 1" });

      invalidateCache("user");

      expect(getCache("user:1")).toBeNull();
      expect(getCache("user:2")).toBeNull();
      expect(getCache("post:1")).not.toBeNull();
    });

    it("should provide cache statistics", () => {
      const { setCache, getCacheStats } = useCacheStore.getState();

      setCache("key1", "data1", { size: 100 });
      setCache("key2", "data2", { size: 200 });

      const stats = getCacheStats();
      expect(stats.totalItems).toBe(2);
      expect(stats.totalSize).toBe(300);
    });
  });

  describe("Storage Store", () => {
    it("should manage user preferences", () => {
      const { setUserPreference, getUserPreference } =
        useStorageStore.getState();

      setUserPreference("theme", "dark");
      setUserPreference("language", "en");

      expect(getUserPreference("theme")).toBe("dark");
      expect(getUserPreference("language")).toBe("en");
      expect(getUserPreference("nonexistent", "default")).toBe("default");
    });

    it("should manage form data", () => {
      const { setFormData, getFormData } = useStorageStore.getState();

      const formData = { name: "John", email: "john@example.com" };
      setFormData("contact-form", formData);

      expect(getFormData("contact-form")).toEqual(formData);
      expect(getFormData("nonexistent")).toBeNull();
    });

    it("should manage search history", () => {
      const { addSearchHistory, getSearchHistory } = useStorageStore.getState();

      addSearchHistory("react hooks", "programming");
      addSearchHistory("zustand", "programming");
      addSearchHistory("cooking recipes", "food");

      const programmingHistory = getSearchHistory("programming", 5);
      expect(programmingHistory).toHaveLength(2);
      expect(programmingHistory[0].query).toBe("zustand");
      expect(programmingHistory[1].query).toBe("react hooks");
    });
  });

  describe("Settings Store", () => {
    it("should manage theme settings", () => {
      const { setTheme, theme } = useSettingsStore.getState();

      setTheme("dark");
      expect(useSettingsStore.getState().theme).toBe("dark");
    });

    it("should manage notification settings", () => {
      const { updateNotificationSettings, notifications } =
        useSettingsStore.getState();

      updateNotificationSettings({
        enabled: false,
        position: "bottom-left",
      });

      const state = useSettingsStore.getState();
      expect(state.notifications.enabled).toBe(false);
      expect(state.notifications.position).toBe("bottom-left");
    });

    it("should export and import settings", () => {
      const { setTheme, setColorScheme, exportSettings, importSettings } =
        useSettingsStore.getState();

      setTheme("dark");
      setColorScheme("purple");

      const exported = exportSettings(["theme", "colorScheme"]);
      const parsed = JSON.parse(exported);

      expect(parsed.theme).toBe("dark");
      expect(parsed.colorScheme).toBe("purple");

      // Reset and import
      useSettingsStore.getState().resetSettings();

      const success = importSettings(exported);
      expect(success).toBe(true);

      const state = useSettingsStore.getState();
      expect(state.theme).toBe("dark");
      expect(state.colorScheme).toBe("purple");
    });
  });

  describe("Store Persistence", () => {
    it("should persist auth state across store resets", () => {
      const { setToken, setUser } = useAuthStore.getState();

      setToken("persistent-token");
      setUser({ id: 1, name: "Persistent User" });

      // Simulate page reload by getting fresh state
      const state = useAuthStore.getState();
      expect(state.token).toBe("persistent-token");
      expect(state.user.name).toBe("Persistent User");
    });

    it("should persist cache data across store resets", () => {
      const { setCache, getCache } = useCacheStore.getState();

      setCache("persistent-key", "persistent-data", { ttl: 10000 });

      // Simulate page reload by getting fresh state
      const retrieved = getCache("persistent-key");
      expect(retrieved).toBe("persistent-data");
    });
  });
});
