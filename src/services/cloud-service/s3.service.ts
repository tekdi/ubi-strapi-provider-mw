import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { IFileStorageService } from './file-storage.interface';

@Injectable()
export class S3Service implements IFileStorageService {
  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async uploadFile(base64Content: string, keyPrefix: string): Promise<string> {
    const buffer = Buffer.from(base64Content, 'utf-8');
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    // Generate a short random string (8 alphanumeric chars)
    const shortId = Math.random().toString(36).substring(2, 10);
    const key = `${keyPrefix}/${timestamp}-${shortId}.json`;

    const input: PutObjectCommandInput = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: 'application/json',
    };

    try {
      await this.s3.send(new PutObjectCommand(input));
    } catch (err) {
      // Log and rethrow for upper layer to handle
      console.error('S3 upload error:', err.message);
      throw new Error('S3 upload failed');
    }

    return key; // Return the path for storage
  }

  async getFile(key: string): Promise<string | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
      });
      const response = await this.s3.send(command);
      const streamToString = (stream: NodeJS.ReadableStream) =>
        new Promise<string>((resolve, reject) => {
          const chunks: Buffer[] = [];
          stream.on('data', (chunk: Buffer) => chunks.push(chunk));
          stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
          stream.on('error', reject);
        });

      if (response.Body && typeof (response.Body as any).on === 'function') {
        return await streamToString(response.Body as NodeJS.ReadableStream);
      }
      return null;
    } catch (err) {
      console.error('S3 getFile error:', err.message);
      return null;
    }
  }
}
