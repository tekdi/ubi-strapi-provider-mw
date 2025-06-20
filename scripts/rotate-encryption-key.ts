import { PrismaClient } from '@prisma/client';
import { encryptionMap } from '../src/configs/encryption-map';
import { decryptWithKey, encrypt } from '../src/utils/encryption.util';

const prisma = new PrismaClient();

const oldKeyBase64 = process.env.OLD_ENCRYPTION_KEY;
const newKeyBase64 = process.env.ENCRYPTION_KEY;

if (!oldKeyBase64 || !newKeyBase64) {
  throw new Error('Both OLD_ENCRYPTION_KEY and ENCRYPTION_KEY must be set in env');
}

const OLD_KEY = Buffer.from(oldKeyBase64, 'base64');
const NEW_KEY = Buffer.from(newKeyBase64, 'base64');

const BATCH_SIZE = 10; // Adjust as needed

async function processRecord(record: any, fields: string[], modelName: string) {
  const updateData: Record<string, any> = {};

  let decryptionErrors = 0;

  for (const field of fields) {
    if (!record[field]) continue;

    try {
      const decrypted = decryptWithKey(record[field], OLD_KEY);

      try {
        const reEncrypted = encrypt(decrypted, NEW_KEY);
        updateData[field] = reEncrypted;
        console.log(
          `✅ Encryption succeeded for record ${record.id} [${field}] in ${modelName}`
        );
      } catch (encErr) {
        console.error(
          `❌ Encryption failed for record ${record.id} [${field}] in ${modelName}: ${encErr.message}`
        );
      }

    } catch (decErr) {
      console.error(
        `❌ Decryption failed for record ${record.id} [${field}] in ${modelName}: ${decErr.message}\n→ Possible causes: incorrect OLD_ENCRYPTION_KEY or corrupt ciphertext in DB.`
      );
      decryptionErrors++;
    }
  }

  return { id: record.id, updateData };
}

async function rotateModel(modelName: string, fields: string[]) {
  // @ts-ignore
  const modelDelegate = (prisma as any)[modelName.charAt(0).toLowerCase() + modelName.slice(1)];
  if (!modelDelegate) {
    console.warn(`Model delegate for ${modelName} not found`);
    return;
  }

  let lastSeenId = 0;
  let totalUpdated = 0;

  while (true) {
    const records = await modelDelegate.findMany({
      where: { id: { gt: lastSeenId } },
      take: BATCH_SIZE,
      orderBy: { id: 'asc' },
    });

    if (!records.length) break;

    const updates = await Promise.all(
      records.map(record => processRecord(record, fields, modelName))
    );

    await prisma.$transaction(async tx => {
      for (const { id, updateData } of updates) {
        if (Object.keys(updateData).length) {
          await tx[modelName.charAt(0).toLowerCase() + modelName.slice(1)].update({
            where: { id },
            data: updateData,
          });
          totalUpdated++;
        }
      }
    });

    console.log(
      `Updated ${totalUpdated} records in ${modelName} so far...`
    );

    lastSeenId = records[records.length - 1].id;
  }

  console.log(`Finished updating ${totalUpdated} records in ${modelName}`);
}

async function main() {
  for (const [model, fields] of Object.entries(encryptionMap)) {
    await rotateModel(model, fields);
  }
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Key rotation failed:', err);
  process.exit(1);
});
