import { ApplicationData, EncryptedAppData } from '@shared/models';
import { base64ToArrayBuffer, decryptText } from './encryption';

/** Validate backups before replacing any of the current browser data. */
export function isApplicationData(value: unknown): value is ApplicationData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return ['appData', 'salt', 'iv'].every(
    key => typeof data[key] === 'string' && data[key].length > 0
  );
}

function decodeBytes(value: string, length: number): Uint8Array<ArrayBuffer> {
  const bytes: unknown = JSON.parse(atob(value));
  if (
    !Array.isArray(bytes) ||
    bytes.length !== length ||
    !bytes.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255)
  )
    throw new Error('Invalid backup encryption metadata.');
  return new Uint8Array(bytes);
}

export async function readBackup(
  data: ApplicationData,
  pin: string
): Promise<EncryptedAppData> {
  if (!isApplicationData(data)) throw new Error('Invalid backup file.');
  const text = await decryptText(
    base64ToArrayBuffer(data.appData as string),
    pin,
    {
      salt: decodeBytes(data.salt!, 16),
      iv: decodeBytes(data.iv!, 12)
    }
  );
  const value = JSON.parse(text) as EncryptedAppData;
  if (
    !value ||
    typeof value !== 'object' ||
    (value.assets != null && !Array.isArray(value.assets)) ||
    (value.apiKey != null && typeof value.apiKey !== 'string')
  )
    throw new Error('Invalid backup contents.');
  return value;
}
