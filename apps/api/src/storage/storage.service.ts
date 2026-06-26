import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

function sanitizeStorageSegment(value: string): string {
  const normalized = value.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!normalized || normalized.includes('..') || normalized.includes('\0')) {
    throw new Error('Invalid storage path segment');
  }
  return normalized;
}

function sanitizeFilename(filename: string): string {
  const base = path.basename(filename).replace(/[^\w.\-()+ ]/g, '_');
  if (!base || base === '.' || base === '..') {
    throw new Error('Invalid filename');
  }
  return base;
}

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
    const safeFolder = sanitizeStorageSegment(folder);
    const safeFilename = sanitizeFilename(filename);
    const dir = path.join(this.basePath, safeFolder);
    await fs.mkdir(dir, { recursive: true });
    const filepath = path.join(dir, safeFilename);
    if (!filepath.startsWith(path.resolve(dir))) {
      throw new Error('Invalid upload path');
    }
    await fs.writeFile(filepath, file);
    return `/uploads/${safeFolder}/${safeFilename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    const relative = fileUrl.replace(/^\/uploads\//, '');
    const safeRelative = sanitizeStorageSegment(relative);
    const filepath = path.resolve(this.basePath, safeRelative);
    if (!filepath.startsWith(path.resolve(this.basePath))) {
      throw new Error('Invalid delete path');
    }
    await fs.unlink(filepath).catch(() => {});
  }

  getUrl(key: string): string {
    const safeKey = sanitizeStorageSegment(key);
    return `/uploads/${safeKey}`;
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
