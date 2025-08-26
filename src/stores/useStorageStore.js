import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Storage store using Zustand
 * Manages local data persistence, user preferences, and app settings
 */
export const useStorageStore = create(
  persist(
    (set, get) => ({
      // Storage data
      userPreferences: {},
      appSettings: {},
      formData: {},
      searchHistory: [],
      recentItems: [],

      // Storage configuration
      storageStrategy: "localStorage", // localStorage, sessionStorage, memory
      encryptionEnabled: false,
      compressionEnabled: false,
      maxStorageSize: 50 * 1024 * 1024, // 50MB default

      // Storage methods
      setUserPreference: (key, value) => {
        const { userPreferences } = get();
        const newPreferences = { ...userPreferences, [key]: value };
        set({ userPreferences: newPreferences });
      },

      getUserPreference: (key, defaultValue = null) => {
        const { userPreferences } = get();
        return userPreferences[key] !== undefined
          ? userPreferences[key]
          : defaultValue;
      },

      removeUserPreference: (key) => {
        const { userPreferences } = get();
        const newPreferences = { ...userPreferences };
        delete newPreferences[key];
        set({ userPreferences: newPreferences });
      },

      clearUserPreferences: () => {
        set({ userPreferences: {} });
      },

      // App settings management
      setAppSetting: (key, value) => {
        const { appSettings } = get();
        const newSettings = { ...appSettings, [key]: value };
        set({ appSettings: newSettings });
      },

      getAppSetting: (key, defaultValue = null) => {
        const { appSettings } = get();
        return appSettings[key] !== undefined ? appSettings[key] : defaultValue;
      },

      removeAppSetting: (key) => {
        const { appSettings } = get();
        const newSettings = { ...appSettings };
        delete newSettings[key];
        set({ appSettings: newSettings });
      },

      clearAppSettings: () => {
        set({ appSettings: {} });
      },

      // Form data persistence
      setFormData: (formId, data) => {
        const { formData } = get();
        const newFormData = { ...formData, [formId]: data };
        set({ formData: newFormData });
      },

      getFormData: (formId) => {
        const { formData } = get();
        return formData[formId] || null;
      },

      removeFormData: (formId) => {
        const { formData } = get();
        const newFormData = { ...formData };
        delete newFormData[formId];
        set({ formData: newFormData });
      },

      clearFormData: (formIds = null) => {
        if (formIds) {
          const { formData } = get();
          const newFormData = { ...formData };
          formIds.forEach((id) => delete newFormData[id]);
          set({ formData: newFormData });
        } else {
          set({ formData: {} });
        }
      },

      // Search history management
      addSearchHistory: (query, category = "general") => {
        const { searchHistory } = get();
        const newEntry = {
          query,
          category,
          timestamp: Date.now(),
          id: Date.now() + Math.random(),
        };

        // Remove duplicates and keep only last 50 searches
        const filteredHistory = searchHistory
          .filter((item) => item.query !== query || item.category !== category)
          .slice(-49);

        set({ searchHistory: [...filteredHistory, newEntry] });
      },

      getSearchHistory: (category = null, limit = 10) => {
        const { searchHistory } = get();
        let filtered = searchHistory;

        if (category) {
          filtered = searchHistory.filter((item) => item.category === category);
        }

        return filtered.slice(-limit).reverse();
      },

      clearSearchHistory: (category = null) => {
        if (category) {
          const { searchHistory } = get();
          const newHistory = searchHistory.filter(
            (item) => item.category !== category
          );
          set({ searchHistory: newHistory });
        } else {
          set({ searchHistory: [] });
        }
      },

      // Recent items management
      addRecentItem: (item, type = "general") => {
        const { recentItems } = get();
        const newEntry = {
          ...item,
          type,
          timestamp: Date.now(),
          id: Date.now() + Math.random(),
        };

        // Remove duplicates and keep only last 100 items
        const filteredItems = recentItems
          .filter(
            (existing) => existing.id !== item.id || existing.type !== type
          )
          .slice(-99);

        set({ recentItems: [...filteredItems, newEntry] });
      },

      getRecentItems: (type = null, limit = 10) => {
        const { recentItems } = get();
        let filtered = recentItems;

        if (type) {
          filtered = recentItems.filter((item) => item.type === type);
        }

        return filtered.slice(-limit).reverse();
      },

      clearRecentItems: (type = null) => {
        if (type) {
          const { recentItems } = get();
          const newItems = recentItems.filter((item) => item.type !== type);
          set({ recentItems: newItems });
        } else {
          set({ recentItems: [] });
        }
      },

      // Generic storage methods
      setData: (key, value, options = {}) => {
        const {
          namespace = "custom",
          ttl = null,
          priority = "normal",
        } = options;

        const storageKey = `${namespace}:${key}`;
        const storageValue = {
          value,
          timestamp: Date.now(),
          ttl,
          priority,
          namespace,
        };

        // Store in appropriate location based on namespace
        if (namespace === "preferences") {
          get().setUserPreference(key, storageValue);
        } else if (namespace === "settings") {
          get().setAppSetting(key, storageValue);
        } else {
          // Store in custom namespace
          const { customData = {} } = get();
          const newCustomData = { ...customData, [storageKey]: storageValue };
          set({ customData: newCustomData });
        }
      },

      getData: (key, namespace = "custom") => {
        const storageKey = `${namespace}:${key}`;

        if (namespace === "preferences") {
          return get().getUserPreference(key);
        } else if (namespace === "settings") {
          return get().getAppSetting(key);
        } else {
          const { customData = {} } = get();
          const item = customData[storageKey];

          if (!item) return null;

          // Check TTL if set
          if (item.ttl && Date.now() - item.timestamp > item.ttl) {
            get().removeData(key, namespace);
            return null;
          }

          return item.value;
        }
      },

      removeData: (key, namespace = "custom") => {
        const storageKey = `${namespace}:${key}`;

        if (namespace === "preferences") {
          get().removeUserPreference(key);
        } else if (namespace === "settings") {
          get().removeAppSetting(key);
        } else {
          const { customData = {} } = get();
          const newCustomData = { ...customData };
          delete newCustomData[storageKey];
          set({ customData: newCustomData });
        }
      },

      // Storage configuration
      setStorageStrategy: (strategy) => {
        set({ storageStrategy: strategy });
      },

      setEncryption: (enabled) => {
        set({ encryptionEnabled: enabled });
      },

      setCompression: (enabled) => {
        set({ compressionEnabled: enabled });
      },

      setMaxStorageSize: (size) => {
        set({ maxStorageSize: size });
      },

      // Storage statistics
      getStorageStats: () => {
        const {
          userPreferences,
          appSettings,
          formData,
          searchHistory,
          recentItems,
          customData = {},
        } = get();

        const calculateSize = (obj) => {
          try {
            return new Blob([JSON.stringify(obj)]).size;
          } catch {
            return 0;
          }
        };

        return {
          userPreferences: {
            count: Object.keys(userPreferences).length,
            size: calculateSize(userPreferences),
          },
          appSettings: {
            count: Object.keys(appSettings).length,
            size: calculateSize(appSettings),
          },
          formData: {
            count: Object.keys(formData).length,
            size: calculateSize(formData),
          },
          searchHistory: {
            count: searchHistory.length,
            size: calculateSize(searchHistory),
          },
          recentItems: {
            count: recentItems.length,
            size: calculateSize(recentItems),
          },
          customData: {
            count: Object.keys(customData).length,
            size: calculateSize(customData),
          },
          totalSize: 0, // Will be calculated
          maxSize: get().maxStorageSize,
        };
      },

      // Cleanup methods
      cleanupExpiredData: () => {
        const now = Date.now();

        // Clean up expired form data
        const { formData } = get();
        const newFormData = {};
        Object.entries(formData).forEach(([key, data]) => {
          if (!data.timestamp || now - data.timestamp < 86400000) {
            // 24 hours
            newFormData[key] = data;
          }
        });
        set({ formData: newFormData });

        // Clean up old search history (older than 30 days)
        const { searchHistory } = get();
        const newSearchHistory = searchHistory.filter(
          (item) => now - item.timestamp < 2592000000 // 30 days
        );
        set({ searchHistory: newSearchHistory });

        // Clean up old recent items (older than 7 days)
        const { recentItems } = get();
        const newRecentItems = recentItems.filter(
          (item) => now - item.timestamp < 604800000 // 7 days
        );
        set({ recentItems: newRecentItems });
      },

      // Export/Import functionality
      exportData: (namespaces = null) => {
        const data = {};

        if (!namespaces || namespaces.includes("preferences")) {
          data.preferences = get().userPreferences;
        }

        if (!namespaces || namespaces.includes("settings")) {
          data.settings = get().appSettings;
        }

        if (!namespaces || namespaces.includes("formData")) {
          data.formData = get().formData;
        }

        if (!namespaces || namespaces.includes("searchHistory")) {
          data.searchHistory = get().searchHistory;
        }

        if (!namespaces || namespaces.includes("recentItems")) {
          data.recentItems = get().recentItems;
        }

        return JSON.stringify(data);
      },

      importData: (jsonData, options = {}) => {
        const { overwrite = false, namespaces = null } = options;

        try {
          const data = JSON.parse(jsonData);

          if (
            data.preferences &&
            (!namespaces || namespaces.includes("preferences"))
          ) {
            if (overwrite) {
              set({ userPreferences: data.preferences });
            } else {
              const { userPreferences } = get();
              set({
                userPreferences: { ...userPreferences, ...data.preferences },
              });
            }
          }

          if (
            data.settings &&
            (!namespaces || namespaces.includes("settings"))
          ) {
            if (overwrite) {
              set({ appSettings: data.settings });
            } else {
              const { appSettings } = get();
              set({ appSettings: { ...appSettings, ...data.settings } });
            }
          }

          // Add other namespaces as needed

          return true;
        } catch (error) {
          console.error("Failed to import data:", error);
          return false;
        }
      },
    }),
    {
      name: "vormia-storage-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userPreferences: state.userPreferences,
        appSettings: state.appSettings,
        formData: state.formData,
        searchHistory: state.searchHistory,
        recentItems: state.recentItems,
        customData: state.customData,
        storageStrategy: state.storageStrategy,
        encryptionEnabled: state.encryptionEnabled,
        compressionEnabled: state.compressionEnabled,
        maxStorageSize: state.maxStorageSize,
      }),
    }
  )
);
