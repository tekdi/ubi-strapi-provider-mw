import * as crypto from 'crypto';

const keyBase64 = process.env.ENCRYPTION_KEY;
const oldKeyBase64 = process.env.OLD_ENCRYPTION_KEY; // Add this env var key for rotation

if (!keyBase64) {
  throw new Error('ENCRYPTION_KEY environment variable is not set');
}
const ENCRYPTION_KEY = Buffer.from(keyBase64, 'base64'); // 32 bytes for AES-256
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be a base64-encoded 32-byte string');
}

let OLD_ENCRYPTION_KEY: Buffer | undefined = undefined;
if (oldKeyBase64) {
  OLD_ENCRYPTION_KEY = Buffer.from(oldKeyBase64, 'base64');
  if (OLD_ENCRYPTION_KEY.length !== 32) {
    throw new Error('OLD_ENCRYPTION_KEY must be a base64-encoded 32-byte string');
  }
}

const IV_LENGTH = 12; // Recommended IV length for AES-GCM

export function encrypt(value: any, key: Buffer = ENCRYPTION_KEY): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  // Stringify the value before encrypting (handles strings, objects, numbers etc)
  const stringValue = JSON.stringify(value);

  const encrypted = Buffer.concat([cipher.update(stringValue, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Combine iv + tag + encrypted and return as base64
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(encryptedValue: string): any {
  try {
    return decryptWithKey(encryptedValue, ENCRYPTION_KEY);
  } catch (error) {
    if (OLD_ENCRYPTION_KEY) {
      return decryptWithKey(encryptedValue, OLD_ENCRYPTION_KEY);
    }
    console.warn('Decryption failed for value:', error);
    return null;
  }
}

export function decryptWithKey(encryptedValue: string, key: Buffer): any {
  const buffer = Buffer.from(encryptedValue, 'base64');

  const iv = buffer.slice(0, IV_LENGTH);
  const tag = buffer.slice(IV_LENGTH, IV_LENGTH + 16);
  const encryptedText = buffer.slice(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

  // Parse decrypted string back to original type
  return JSON.parse(decrypted.toString('utf8'));
}
