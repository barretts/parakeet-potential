

import * as fs from 'fs/promises';

export async function saveObjectToFileAsync(obj: any, filePath: string): Promise<void> {
  const jsonString = JSON.stringify(obj, null, 2);
  await fs.writeFile(filePath, jsonString);
}

export async function loadObjectFromFileAsync(filePath: string): Promise<any> {
  const jsonString = await fs.readFile(filePath, 'utf8');
  return JSON.parse(jsonString);
}