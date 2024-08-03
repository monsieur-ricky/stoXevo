import { IV_KEY, SALT_KEY } from '@app';

/**
 * Derives a cryptographic key from a password and salt using PBKDF2 algorithm.
 *
 * @param password - The password to derive the key from.
 * @param salt - The salt value used in the key derivation.
 * @returns A promise that resolves to the derived CryptoKey.
 */
const deriveKey = async (
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100, // Adjust iterations for your security requirements
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

/**
 * Stores the salt and IV in the local storage.
 *
 * @param salt - The salt value as a Uint8Array.
 * @param iv - The IV value as a Uint8Array.
 * @returns void
 */
const storeSaltAndIV = (salt: Uint8Array, iv: Uint8Array): void => {
  localStorage.setItem(SALT_KEY, btoa(JSON.stringify(Array.from(salt))));
  localStorage.setItem(IV_KEY, btoa(JSON.stringify(Array.from(iv))));
};

/**
 * Retrieves the salt and initialization vector (IV) from local storage.
 *
 * @returns An object containing the salt and IV as Uint8Array.
 */
const getSaltAndIV = (): {
  salt: Uint8Array;
  iv: Uint8Array;
} => {
  const saltArray = JSON.parse(atob(localStorage.getItem(SALT_KEY) ?? ''));
  const ivArray = JSON.parse(atob(localStorage.getItem(IV_KEY) ?? ''));

  return {
    salt: new Uint8Array(saltArray),
    iv: new Uint8Array(ivArray)
  };
};

/**
 * Encrypts the given plain text using the provided password.
 *
 * @param plainText - The text to be encrypted.
 * @param password - The password used for encryption.
 * @returns A promise that resolves to an ArrayBuffer containing the encrypted data.
 */
export const encryptText = async (
  plainText: string,
  password: string
): Promise<ArrayBuffer> => {
  const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a new salt for each encryption
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a new IV for each encryption
  const key = await deriveKey(password, salt); // Derive the key from the password

  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encoder.encode(plainText)
  );

  // Store the salt and IV in localStorage
  storeSaltAndIV(salt, iv);

  // Return the encrypted data (salt and IV are stored separately)
  return encrypted;
};

/**
 * Decrypts the given cipher text using the provided password.
 *
 * @param cipherText - The cipher text to decrypt.
 * @param password - The password used for decryption.
 * @returns A promise that resolves to the decrypted text.
 */
export const decryptText = async (
  cipherText: ArrayBuffer,
  password: string
): Promise<string> => {
  const { salt, iv } = getSaltAndIV(); // Retrieve the salt and IV from localStorage
  const key = await deriveKey(password, salt); // Derive the key using the retrieved salt and password

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    cipherText
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};

/**
 * Converts an ArrayBuffer to a base64 string.
 *
 * @param buffer - The ArrayBuffer to convert.
 * @returns The base64 string representation of the ArrayBuffer.
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
};

/**
 * Converts a base64 string to an ArrayBuffer.
 *
 * @param base64 - The base64 string to convert.
 * @returns The converted ArrayBuffer.
 */
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
};
