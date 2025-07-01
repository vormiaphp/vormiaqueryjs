import CryptoJS from 'crypto-js';

/**
 * Encrypts data using AES encryption
 * @param {any} data - The data to encrypt
 * @param {string} key - The encryption key
 * @returns {string} Encrypted data as string
 */
export const encryptData = (data, key) => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts data that was encrypted with encryptData
 * @param {string} encryptedData - The encrypted data
 * @param {string} key - The decryption key
 * @returns {any} The decrypted data
 */
export const decryptData = (encryptedData, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    // Handle case where decryption fails but doesn't throw
    if (!decryptedString) {
      throw new Error('Failed to decrypt data: Invalid key or corrupted data');
    }
    
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data: ' + error.message);
  }
};

/**
 * Creates a SHA-256 hash of the input data
 * @param {string} data - The data to hash
 * @returns {string} The hashed string
 */
export const hashData = (data) => {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  return CryptoJS.SHA256(data).toString();
};

/**
 * Generates a random key for encryption
 * @param {number} [length=32] - The length of the key in bytes
 * @returns {string} A random key string
 */
export const generateRandomKey = (length = 32) => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

/**
 * Creates a secure token by combining a random string with a timestamp
 * @returns {string} A secure token
 */
export const createSecureToken = () => {
  const random = generateRandomKey(16);
  const timestamp = Date.now().toString();
  return hashData(random + timestamp);
};

/**
 * Safely compares two strings in constant time to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if strings are equal
 */
export const secureCompare = (a, b) => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  
  return crypto.subtle.timingSafeEqual(aBuffer, bBuffer);
};
