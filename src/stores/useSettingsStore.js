import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Settings store using Zustand
 * Manages app-wide configuration, theme settings, and global preferences
 */
export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Theme and UI settings
      theme: "light", // light, dark, auto
      colorScheme: "blue", // blue, green, purple, red, etc.
      fontSize: "medium", // small, medium, large, xlarge
      compactMode: false,
      sidebarCollapsed: false,

      // Notification settings
      notifications: {
        enabled: true,
        sound: true,
        desktop: false,
        position: "top-right", // top-right, top-left, bottom-right, bottom-left
        duration: 5000,
        maxVisible: 5,
      },

      // Debug and development settings
      debug: {
        enabled: false,
        level: "info", // error, warn, info, debug
        showTimestamps: true,
        logToConsole: true,
        logToFile: false,
      },

      // Performance settings
      performance: {
        cacheEnabled: true,
        offlineMode: false,
        lazyLoading: true,
        imageOptimization: true,
        animationReduced: false,
      },

      // Privacy settings
      privacy: {
        analytics: true,
        telemetry: false,
        crashReporting: true,
        usageStats: false,
        dataCollection: "minimal", // minimal, standard, enhanced
      },

      // Language and localization
      localization: {
        language: "en",
        region: "US",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h", // 12h, 24h
        currency: "USD",
        timezone: "auto",
      },

      // Accessibility settings
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
        keyboardNavigation: true,
        focusIndicators: true,
        colorBlindSupport: false,
      },

      // Network and API settings
      network: {
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        offlineDetection: true,
        requestQueueing: true,
        backgroundSync: true,
      },

      // Theme methods
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
      },

      setColorScheme: (colorScheme) => {
        set({ colorScheme });
      },

      setFontSize: (fontSize) => {
        set({ fontSize });
        // Apply font size to document
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-font-size", fontSize);
        }
      },

      toggleCompactMode: () => {
        const { compactMode } = get();
        set({ compactMode: !compactMode });
      },

      toggleSidebar: () => {
        const { sidebarCollapsed } = get();
        set({ sidebarCollapsed: !sidebarCollapsed });
      },

      // Notification methods
      updateNotificationSettings: (settings) => {
        const { notifications } = get();
        set({ notifications: { ...notifications, ...settings } });
      },

      toggleNotifications: () => {
        const { notifications } = get();
        set({
          notifications: { ...notifications, enabled: !notifications.enabled },
        });
      },

      setNotificationPosition: (position) => {
        const { notifications } = get();
        set({ notifications: { ...notifications, position } });
      },

      // Debug methods
      updateDebugSettings: (settings) => {
        const { debug } = get();
        set({ debug: { ...debug, ...settings } });
      },

      toggleDebug: () => {
        const { debug } = get();
        set({ debug: { ...debug, enabled: !debug.enabled } });
      },

      setDebugLevel: (level) => {
        const { debug } = get();
        set({ debug: { ...debug, level } });
      },

      // Performance methods
      updatePerformanceSettings: (settings) => {
        const { performance } = get();
        set({ performance: { ...performance, ...settings } });
      },

      toggleCache: () => {
        const { performance } = get();
        set({
          performance: {
            ...performance,
            cacheEnabled: !performance.cacheEnabled,
          },
        });
      },

      toggleOfflineMode: () => {
        const { performance } = get();
        set({
          performance: {
            ...performance,
            offlineMode: !performance.offlineMode,
          },
        });
      },

      // Privacy methods
      updatePrivacySettings: (settings) => {
        const { privacy } = get();
        set({ privacy: { ...privacy, ...settings } });
      },

      toggleAnalytics: () => {
        const { privacy } = get();
        set({ privacy: { ...privacy, analytics: !privacy.analytics } });
      },

      setDataCollection: (level) => {
        const { privacy } = get();
        set({ privacy: { ...privacy, dataCollection: level } });
      },

      // Localization methods
      updateLocalizationSettings: (settings) => {
        const { localization } = get();
        set({ localization: { ...localization, ...settings } });
      },

      setLanguage: (language) => {
        const { localization } = get();
        set({ localization: { ...localization, language } });
      },

      setRegion: (region) => {
        const { localization } = get();
        set({ localization: { ...localization, region } });
      },

      setDateFormat: (dateFormat) => {
        const { localization } = get();
        set({ localization: { ...localization, dateFormat } });
      },

      setTimeFormat: (timeFormat) => {
        const { localization } = get();
        set({ localization: { ...localization, timeFormat } });
      },

      // Accessibility methods
      updateAccessibilitySettings: (settings) => {
        const { accessibility } = get();
        set({ accessibility: { ...accessibility, ...settings } });
      },

      toggleHighContrast: () => {
        const { accessibility } = get();
        set({
          accessibility: {
            ...accessibility,
            highContrast: !accessibility.highContrast,
          },
        });
      },

      toggleReducedMotion: () => {
        const { accessibility } = get();
        set({
          accessibility: {
            ...accessibility,
            reducedMotion: !accessibility.reducedMotion,
          },
        });
      },

      // Network methods
      updateNetworkSettings: (settings) => {
        const { network } = get();
        set({ network: { ...network, ...settings } });
      },

      setTimeout: (timeout) => {
        const { network } = get();
        set({ network: { ...network, timeout } });
      },

      setRetryAttempts: (attempts) => {
        const { network } = get();
        set({ network: { ...network, retryAttempts: attempts } });
      },

      // Bulk update methods
      updateSettings: (category, settings) => {
        const currentSettings = get()[category];
        if (currentSettings) {
          set({ [category]: { ...currentSettings, ...settings } });
        }
      },

      resetSettings: (category = null) => {
        if (category) {
          // Reset specific category to defaults
          const defaults = getDefaultSettings()[category];
          if (defaults) {
            set({ [category]: defaults });
          }
        } else {
          // Reset all settings to defaults
          set(getDefaultSettings());
        }
      },

      // Export/Import settings
      exportSettings: (categories = null) => {
        const currentSettings = get();
        let exportData = {};

        if (categories) {
          categories.forEach((category) => {
            if (currentSettings[category]) {
              exportData[category] = currentSettings[category];
            }
          });
        } else {
          exportData = currentSettings;
        }

        return JSON.stringify(exportData);
      },

      importSettings: (jsonData, options = {}) => {
        const { overwrite = false, categories = null, merge = true } = options;

        try {
          const data = JSON.parse(jsonData);

          if (categories) {
            // Import specific categories
            categories.forEach((category) => {
              if (data[category]) {
                if (overwrite) {
                  set({ [category]: data[category] });
                } else if (merge) {
                  const current = get()[category];
                  set({ [category]: { ...current, ...data[category] } });
                }
              }
            });
          } else {
            // Import all settings
            if (overwrite) {
              set(data);
            } else if (merge) {
              const current = get();
              set({ ...current, ...data });
            }
          }

          return true;
        } catch (error) {
          console.error("Failed to import settings:", error);
          return false;
        }
      },

      // Utility methods
      getSetting: (path) => {
        const settings = get();
        return path.split(".").reduce((obj, key) => obj?.[key], settings);
      },

      setSetting: (path, value) => {
        const settings = get();
        const keys = path.split(".");
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
          if (!obj[key]) obj[key] = {};
          return obj[key];
        }, settings);

        target[lastKey] = value;
        set(settings);
      },
    }),
    {
      name: "vormia-settings-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        colorScheme: state.colorScheme,
        fontSize: state.fontSize,
        compactMode: state.compactMode,
        sidebarCollapsed: state.sidebarCollapsed,
        notifications: state.notifications,
        debug: state.debug,
        performance: state.performance,
        privacy: state.privacy,
        localization: state.localization,
        accessibility: state.accessibility,
        network: state.network,
      }),
    }
  )
);

/**
 * Get default settings for the application
 */
function getDefaultSettings() {
  return {
    theme: "light",
    colorScheme: "blue",
    fontSize: "medium",
    compactMode: false,
    sidebarCollapsed: false,
    notifications: {
      enabled: true,
      sound: true,
      desktop: false,
      position: "top-right",
      duration: 5000,
      maxVisible: 5,
    },
    debug: {
      enabled: false,
      level: "info",
      showTimestamps: true,
      logToConsole: true,
      logToFile: false,
    },
    performance: {
      cacheEnabled: true,
      offlineMode: false,
      lazyLoading: true,
      imageOptimization: true,
      animationReduced: false,
    },
    privacy: {
      analytics: true,
      telemetry: false,
      crashReporting: true,
      usageStats: false,
      dataCollection: "minimal",
    },
    localization: {
      language: "en",
      region: "US",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      currency: "USD",
      timezone: "auto",
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusIndicators: true,
      colorBlindSupport: false,
    },
    network: {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      offlineDetection: true,
      requestQueueing: true,
      backgroundSync: true,
    },
  };
}
