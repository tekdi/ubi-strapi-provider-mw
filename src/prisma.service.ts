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

    // Validate encryption key is available
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is required for field encryption');
    }

    // Helper to decrypt fields for a given model
    function decryptModelFields(obj: any, model?: string) {
      if (!model || !encryptionMap[model]) return;
      for (const field of encryptionMap[model]) {
        if (obj[field]) {
          try {
            obj[field] = decrypt(obj[field]);
          } catch (e) {
            console.error(`Failed to decrypt field '${field}' in model '${model}':`, e);
          }
        }
      }
    }

    // Helper to find related model name from key
    function getRelatedModel(key: string): string | undefined {
      return Object.keys(encryptionMap).find(
        m => m.toLowerCase() === key.toLowerCase()
      );
    }

    // Refactored recursiveDecrypt function
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

    // Use Prisma middleware for encryption/decryption
    this.$use(async (params, next) => {
      // Encrypt before create/update
      if (['create', 'update', 'upsert'].includes(params.action)) {
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

         dataObjects.forEach((dataObj: any) => {
           fields.forEach(field => {
             if (dataObj[field]) {
               dataObj[field] = encrypt(dataObj[field]);
             }
           });
         });
       }
      }

      const result = await next(params);

      // Decrypt after find (recursively)
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
