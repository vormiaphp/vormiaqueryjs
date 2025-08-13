import CryptoJS from "crypto-js";

// Node.js crypto for RSA
let crypto;
try {
  crypto = require("crypto");
} catch {
  crypto = null;
}

// Load keys from environment variables (for SSR/Node.js and browser)
const PUBLIC_KEY = (typeof process !== 'undefined' && process.env) ? process.env.VORMIA_PUBLIC_KEY : 
                   (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_VORMIA_PUBLIC_KEY : undefined;

const PRIVATE_KEY = (typeof process !== 'undefined' && process.env) ? process.env.VORMIA_PRIVATE_KEY : 
                    (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_VORMIA_PRIVATE_KEY : undefined;

/**
 * Encrypts data using AES encryption
 * @param {any} data - The data to encrypt
 * @param {string} key - The encryption key
 * @returns {string} Encrypted data as string
 */
export const encryptData = (data, key) => {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, key).toString();
  } catch {
    return null;
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
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
};

/**
 * Creates a SHA-256 hash of the input data
 * @param {string} data - The data to hash
 * @returns {string} The hashed string
 */
export const hashData = (data) => {
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

// --- RSA ENCRYPTION/DECRYPTION (Node.js only) ---

export function encryptWithPublicKey(data, publicKey = PUBLIC_KEY) {
  if (!crypto || !publicKey)
    throw new Error("RSA encryption requires Node.js and a public key");
  const buffer = Buffer.from(
    typeof data === "string" ? data : JSON.stringify(data)
  );
  return crypto.publicEncrypt(publicKey, buffer).toString("base64");
}

export function decryptWithPrivateKey(encrypted, privateKey = PRIVATE_KEY) {
  if (!crypto || !privateKey)
    throw new Error("RSA decryption requires Node.js and a private key");
  const buffer = Buffer.from(encrypted, "base64");
  const decrypted = crypto.privateDecrypt(privateKey, buffer).toString("utf8");
  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
}

/* global process, require, Buffer */
