// Utility functions for various tasks
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { UAParser } from 'ua-parser-js';
import { Request } from 'express';

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

export function getAuthToken(req : Request): string {
    const authorization = req.headers['authorization'] ?? req.headers['Authorization'];
    if (!authorization || typeof authorization !== 'string') {
        throw new BadRequestException('Authorization header is required and must be a string');
    }
    return authorization;
}
