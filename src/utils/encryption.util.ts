import * as crypto from 'crypto';

const keyBase64 = process.env.ENCRYPTION_KEY;
if (!keyBase64) {
  throw new Error('ENCRYPTION_KEY environment variable is not set');
}
const ENCRYPTION_KEY = Buffer.from(keyBase64, 'base64'); // 32 bytes for AES-256
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be a base64-encoded 32-byte string');
}

const IV_LENGTH = 12; // Recommended IV length for AES-GCM

export function encrypt(value: any): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

  // Stringify the value before encrypting (handles strings, objects, numbers etc)
  const stringValue = JSON.stringify(value);

  const encrypted = Buffer.concat([cipher.update(stringValue, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Combine iv + tag + encrypted and return as base64
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(encryptedValue: string): any {
  try {
    const buffer = Buffer.from(encryptedValue, 'base64');

    const iv = buffer.slice(0, IV_LENGTH);
    const tag = buffer.slice(IV_LENGTH, IV_LENGTH + 16);
    const encryptedText = buffer.slice(IV_LENGTH + 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

    // Parse decrypted string back to original type
    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    console.error('Decryption failed:', error.message);
    throw new Error('Failed to decrypt data');
  }
}
