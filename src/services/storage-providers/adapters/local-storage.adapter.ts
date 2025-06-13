import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { IFileStorageService } from '../file-storage.service.interface';

@Injectable()
export class LocalStorageAdapter implements IFileStorageService {
async uploadFile(key: string, content: Buffer): Promise<string | null> {
  console.log(`Uploading file with key: ${key}`);

  const filePath = path.join(process.cwd(), 'uploads', key);
  const dir = path.dirname(filePath);

  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(filePath, content);

  return path.relative(process.cwd(), filePath);
}

  async getFile(key: string): Promise<Buffer | null> {
    const absPath = path.isAbsolute(key) ? key : path.join(process.cwd(), key);
    try {
      const data = await fs.promises.readFile(absPath);
      return data;
    } catch (err) {
      if (err.code === 'ENOENT') {
        return null;
      }
      throw err;
    }
  }
}
