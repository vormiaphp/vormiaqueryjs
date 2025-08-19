/**
 * Form Data Transformer Utility
 * Handles automatic transformation of form data before sending to API
 */

/**
 * Transform form data based on configuration
 * @param {Object} formData - Original form data from user
 * @param {Object} config - Transformation configuration
 * @param {Object} config.rename - Field renaming mappings
 * @param {Object} config.add - Fields to add
 * @param {Array} config.remove - Fields to remove
 * @returns {Object} Transformed form data
 */
export function transformFormData(formData, config = {}) {
  if (!formData || typeof formData !== "object") {
    return formData;
  }

  let transformedData = { ...formData };

  // Handle field renaming
  if (config.rename && typeof config.rename === "object") {
    Object.keys(config.rename).forEach((oldName) => {
      const newName = config.rename[oldName];
      if (transformedData.hasOwnProperty(oldName)) {
        transformedData[newName] = transformedData[oldName];
        delete transformedData[oldName];
      }
    });
  }

  // Handle adding fields
  if (config.add && typeof config.add === "object") {
    Object.assign(transformedData, config.add);
  }

  // Handle removing fields
  if (config.remove && Array.isArray(config.remove)) {
    config.remove.forEach((fieldName) => {
      delete transformedData[fieldName];
    });
  }

  return transformedData;
}

/**
 * Get default form data configuration
 * @returns {Object} Default transformation configuration
 */
export function getDefaultFormdata() {
  return {
    rename: {
      confirmPassword: "password_confirmation",
    },
    add: {
      terms: true,
    },
    remove: ["confirmPassword"],
  };
}

/**
 * Merge global and local form data configurations
 * @param {Object} globalConfig - Global form data configuration
 * @param {Object} localConfig - Local form data configuration
 * @returns {Object} Merged configuration
 */
export function mergeFormdataConfig(globalConfig, localConfig) {
  if (!localConfig) return globalConfig;
  if (!globalConfig) return localConfig;

  const merged = { ...globalConfig };

  // Merge rename mappings
  if (localConfig.rename) {
    merged.rename = { ...merged.rename, ...localConfig.rename };
  }

  // Merge add fields
  if (localConfig.add) {
    merged.add = { ...merged.add, ...localConfig.add };
  }

  // Merge remove fields
  if (localConfig.remove) {
    merged.remove = [...(merged.remove || []), ...localConfig.remove];
  }

  return merged;
}
