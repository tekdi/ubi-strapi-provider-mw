export const encryptionMap = {
  Applications: ['applicationData'],
  // ApplicationFiles: ['filePath']
  
  // Only add fields here that are sensitive and NOT used for filtering, sorting, or joining in queries.
  // Do NOT add fields like IDs or foreign keys (e.g., benefitId) that are used in Prisma 'where', 'orderBy', or 'join' clauses.
  // Encrypting such fields will break filtering/sorting because the database stores the encrypted value,
  // and queries will not match unless the exact same encrypted value is used (which is not possible with random IVs).
};
