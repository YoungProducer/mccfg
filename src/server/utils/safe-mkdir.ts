import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';

export async function safeMkdir(filePath: string) {
  if (!existsSync(filePath)) {
    await mkdir(filePath, { recursive: true });
  }
}
