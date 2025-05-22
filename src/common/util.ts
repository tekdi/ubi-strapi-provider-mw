// Utility functions for various tasks
import * as crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

export function titleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export function generateRandomString(length: number = 4): string {
    return crypto.randomBytes(length).toString('hex');
}

export function getBrowserInfo(userAgent: string) {
    const parser = new UAParser();
    const uaResult = parser.setUA(userAgent).getResult();
    return {
        browser: [uaResult.browser.name, uaResult.browser.version].filter(Boolean).join(' '),
        os: [uaResult.os.name, uaResult.os.version].filter(Boolean).join(' '),
    };

}