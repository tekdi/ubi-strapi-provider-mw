import { Injectable } from '@nestjs/common';
import { IFileStorageService } from './file-storage.interface';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalStorageService implements IFileStorageService {
  async uploadFile(content: string, keyPrefix: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', keyPrefix);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filename = `${uuidv4()}.json`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    // Return relative path from process.cwd()
    return path.relative(process.cwd(), filePath);
  }

  async getFile(key: string): Promise<string | null> {
    const absPath = path.isAbsolute(key) ? key : path.join(process.cwd(), key);
    if (fs.existsSync(absPath)) {
      return fs.readFileSync(absPath, 'utf-8');
    }
    return null;
  }
}
