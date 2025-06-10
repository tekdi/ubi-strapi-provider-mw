export interface IFileStorageService {
  uploadFile(content: string, keyPrefix: string): Promise<string>;
  getFile(key: string): Promise<string | null>;
}
