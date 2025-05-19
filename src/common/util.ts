// Utility functions for various tasks
import * as crypto from 'crypto';

export function titleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export function generateRandomString(length: number = 4): string {
    return crypto.randomBytes(length).toString('hex');
}