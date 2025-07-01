import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { encryptionMap } from './configs/encryption-map';
import { encrypt, decrypt } from './utils/encryption.util';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  constructor() {
    super();

    // Validate encryption key is available and properly formatted at startup
    if (!process.env.ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY environment variable is required for field encryption');
    }
    if (process.env.ENCRYPTION_KEY.length < 32) {
        throw new Error('ENCRYPTION_KEY must be at least 32 characters long for AES-256');
    }

    // Helper to decrypt fields for a given model using the encryption map
    function decryptModelFields(obj: any, model?: string) {
      if (!model || !encryptionMap[model]) return;
      for (const field of encryptionMap[model]) {
        if (obj[field] !== undefined && obj[field] !== null) {
          try {
            const decrypted = decrypt(obj[field]);
            if (decrypted !== null) {
              obj[field] = decrypted;
            } else {
              // If decryption fails, set field to null
              obj[field] = null;
            }
          } catch (e) {
            // Log decryption errors for debugging
            console.error(`Failed to decrypt field '${field}' in model '${model}':`, e);
            obj[field] = null;
          }
        }
      }
    }

    // Helper to find related model name from key (case-insensitive)
    function getRelatedModel(key: string): string | undefined {
      return Object.keys(encryptionMap).find(
        m => m.toLowerCase() === key.toLowerCase()
      );
    }

    // Recursively decrypts nested objects/arrays based on model
    function recursiveDecrypt(obj: any, model?: string) {
      if (Array.isArray(obj)) {
        return obj.map(item => recursiveDecrypt(item, model));
      }
      if (obj && typeof obj === 'object') {
        decryptModelFields(obj, model);
        for (const key of Object.keys(obj)) {
          const relatedModel = getRelatedModel(key);
          if (obj[key] && relatedModel) {
            obj[key] = recursiveDecrypt(obj[key], relatedModel);
          }
        }
      }
      return obj;
    }

    // Prisma middleware for transparent encryption/decryption
    this.$use(async (params, next) => {
      // Encrypt fields before create/update/upsert
      if (['create', 'update', 'upsert', 'createMany', 'updateMany'].includes(params.action)) {
        const model = params.model;
        let fields: string[] | undefined = undefined;
        if (model !== undefined) {
          fields = encryptionMap[model];
        }
        if (fields) {
          // Handle different data structures for different operations
          const dataObjects: any[] = [];
          if (params.args?.data) dataObjects.push(params.args.data);
          if (params.args?.create) dataObjects.push(params.args.create);
          if (params.args?.update) dataObjects.push(params.args.update);

          // Handle batch operations
          if (params.args?.data && Array.isArray(params.args.data)) {
            dataObjects.push(...params.args.data);
          }

          dataObjects.forEach((dataObj: any) => {
            fields.forEach(field => {
              // Encrypt only if field is present
              if (dataObj[field] !== undefined && dataObj[field] !== null) {
                try {
                  dataObj[field] = encrypt(dataObj[field]);
                } catch (e) {
                  console.error(`Failed to encrypt field '${field}' in model '${model}':`, e);
                  throw new Error(`Encryption failed for field '${field}': ${e.message}`);
                }
              }
            });
          });
        }
      }

      // Call the next middleware or Prisma action
      const result = await next(params);

      // Decrypt fields after find/create/update/upsert (recursively)
      if (
        ['findUnique', 'findFirst', 'findMany', 'create', 'update', 'upsert'].includes(params.action)
      ) {
        const model = params.model;
        return recursiveDecrypt(result, model);
      }
      return result;
    });
  }
}
