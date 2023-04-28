import { existsSync } from 'fs';
import { rm } from 'fs/promises';
import { join } from 'path';

export const clearTestUploadsDir = async () => {
  const path = join(process.cwd(), 'test-uploads');

  if (existsSync(path)) {
    await rm(path, { recursive: true });
  }
};
