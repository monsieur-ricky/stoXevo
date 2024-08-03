/**
 * Original code from: https://gist.github.com/monsieur-ricky/634b64f31495a7ad9945e82ccdd5c382
 */

import { Injectable, inject } from '@angular/core';
import { WINDOW } from '@shared/providers';
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  decryptText,
  encryptText
} from '@shared/utils';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly localStorage = inject(WINDOW).localStorage;

  /**
   * Retrieves the value associated with the specified key from local storage.
   * @param key - The key to retrieve the value for.
   * @param pin - The pin to decrypt the data.
   * @returns The value associated with the key, or null if the key does not exist.
   */
  async get<T>(key: string, pin?: string | null): Promise<T | null> {
    let item = this.localStorage.getItem(key);

    if (!item) {
      return null;
    }

    if (pin) {
      const cipherText = base64ToArrayBuffer(item);
      const decryptedText = await decryptText(cipherText, pin);

      return this.isJSONValid(decryptedText)
        ? (JSON.parse(decryptedText) as T)
        : (decryptedText as T);
    }

    item = atob(item);

    return this.isJSONValid(item) ? (JSON.parse(item) as T) : (item as T);
  }

  /**
   * Retrieves the base64 value associated with the specified key from local storage.
   * @param key - The key to retrieve the value for.
   * @returns The value associated with the key, or null if the key does not exist.
   */
  getPlainValue(key: string): string | null {
    return this.localStorage.getItem(key);
  }

  /**
   * Sets the value associated with the specified key in local storage.
   * @param key - The key to set the value for.
   * @param value - The value to be stored.
   * @param pin - The pin to encrypt the data.
   */
  async set(key: string, value: unknown, pin?: string | null): Promise<void> {
    if (pin) {
      const cipherText = await encryptText(JSON.stringify(value), pin);
      this.localStorage.setItem(key, arrayBufferToBase64(cipherText));
      return;
    }

    this.localStorage.setItem(key, btoa(JSON.stringify(value)));
  }

  /**
   * Sets the base64 value associated with the specified key in local storage.
   * @param key - The key to retrieve the value for.
   */
  setPlainValue(key: string, value: string): void {
    this.localStorage.setItem(key, value);
  }

  /**
   * Deletes the value associated with the specified key from local storage.
   * @param key - The key to delete the value for.
   */
  remove(key: string): void {
    this.localStorage.removeItem(key);
  }

  /**
   * Deletes the values associated with the specified list of keys from local storage.
   * @param keys - List of keys to delete the value for.
   */
  removeKeys(keys: string[]): void {
    keys.forEach(key => this.localStorage.removeItem(key));
  }

  /**
   * Clears all values from local storage.
   */
  clear(): void {
    this.localStorage.clear();
  }

  private isJSONValid(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch (error) {
      return false;
    }
  }
}
