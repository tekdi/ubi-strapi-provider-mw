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

    // Helper to recursively decrypt fields in result objects/arrays
    function recursiveDecrypt(obj: any, model?: string) {
      if (Array.isArray(obj)) {
        return obj.map(item => recursiveDecrypt(item, model));
      }
      if (obj && typeof obj === 'object') {
        // Decrypt fields for this model
        if (model && encryptionMap[model]) {
          for (const field of encryptionMap[model]) {
            if (obj[field]) {
              try {
                obj[field] = decrypt(obj[field]);
              } catch (e) {
                // Optionally log error
              }
            }
          }
        }
        // Recursively decrypt nested relations
        for (const key of Object.keys(obj)) {
          // Try to match key to a model in encryptionMap (e.g., applicationFiles, application)
          // Prisma returns relation keys in camelCase, but model names are PascalCase
          // So try to find a model whose lowercased name matches the key (case-insensitive)
          const relatedModel = Object.keys(encryptionMap).find(
            m => m.toLowerCase() === key.toLowerCase()
          );
          if (obj[key] && relatedModel) {
            obj[key] = recursiveDecrypt(obj[key], relatedModel);
          }
        }
      }
      return obj;
    }

    this.$use(async (params, next) => {
      // Debug: log model name for every middleware call
      console.log('Prisma middleware params.model:', params.model);

      // Encrypt before create/update
      if (['create', 'update', 'upsert'].includes(params.action)) {
        const model = params.model;
        let fields: string[] | undefined = undefined;
        if (model !== undefined) {
          fields = encryptionMap[model];
        }
        if (fields && params.args?.data) {
          fields.forEach(field => {
            if (params.args.data[field]) {
              params.args.data[field] = encrypt(params.args.data[field]);
            }
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
