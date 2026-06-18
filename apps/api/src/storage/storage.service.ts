import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface StorageProvider {
  upload(file: Buffer, filename: string, folder?: string): Promise<string>;
  delete(fileUrl: string): Promise<void>;
  getUrl(key: string): string;
}

@Injectable()
class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = process.env.STORAGE_LOCAL_PATH || './uploads';
  }

  async upload(file: Buffer, filename: string, folder = 'general'): Promise<string> {
    const dir = path.join(this.basePath, folder);
    await fs.mkdir(dir, { recursive: true });
    const filepath = path.join(dir, filename);
    await fs.writeFile(filepath, file);
    return `/uploads/${folder}/${filename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    const filepath = path.join(this.basePath, fileUrl.replace('/uploads/', ''));
    await fs.unlink(filepath).catch(() => {});
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }
}

@Injectable()
export class StorageService {
  private provider: StorageProvider;

  constructor() {
    const providerType = process.env.STORAGE_PROVIDER || 'local';
    // S3/R2 providers can be added here following same interface
    this.provider = new LocalStorageProvider();
    if (providerType !== 'local') {
      console.warn(`Storage provider ${providerType} not yet configured, using local`);
    }
  }

  upload(file: Buffer, filename: string, folder?: string) {
    return this.provider.upload(file, filename, folder);
  }

  delete(fileUrl: string) {
    return this.provider.delete(fileUrl);
  }

  getUrl(key: string) {
    return this.provider.getUrl(key);
  }
}
