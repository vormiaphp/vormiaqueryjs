import CryptoJS from 'crypto-js';

export const encryptData = (data: any, key: string): string => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decryptData = (encryptedData: string, key: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

export const generateRandomKey = (length: number = 32): string => {
  return CryptoJS.lib.WordArray.random(length).toString();
};