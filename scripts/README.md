# Encryption Key Rotation Script

This script (`rotate-encryption-key.ts`) is used to rotate (re-encrypt) encrypted fields in your database from an old encryption key to a new one using Prisma.

## Prerequisites

- Node.js installed
- All dependencies installed (`npm install` at project root)
- Access to your database
- The following environment variables set:
  - `OLD_ENCRYPTION_KEY`: The previous encryption key (base64 encoded)
  - `ENCRYPTION_KEY`: The new encryption key (base64 encoded)
  - Any other environment variables required for Prisma/database connection

## Usage

1. **Set environment variables**  
   Export the required keys in your shell or use a `.env` file:
   ```sh
   export OLD_ENCRYPTION_KEY=your_old_key_base64
   export ENCRYPTION_KEY=your_new_key_base64
   ```

2. **Run the script**  
   From the project root, execute:
   ```sh
   npx ts-node scripts/rotate-encryption-key.ts
   ```
   Or, if you have a build step:
   ```sh
   node dist/scripts/rotate-encryption-key.js
   ```

3. **Monitor output**  
   The script will log progress and report how many records were updated per model.

## Notes

- The script uses the `encryptionMap` to determine which models and fields to process.
- Make sure to back up your database before running the script.
- Adjust the `BATCH_SIZE` in the script if needed for performance.

