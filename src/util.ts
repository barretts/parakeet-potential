import * as fs from 'fs/promises';

export async function saveObjectToFileAsync(obj: any, filePath: string): Promise<void> {
  const jsonString = JSON.stringify(obj, null, 2);
  await fs.writeFile(filePath, jsonString);
}

export async function loadObjectFromFileAsync(filePath: string): Promise<any> {
  const jsonString = await fs.readFile(filePath, 'utf8');
  return JSON.parse(jsonString);
}

export function stripCssFromHtml(html: string): string {
  const styleTagRegex = /<style[^>]*>[^<]*<\/style>/gi;
  let strippedHtml = html?.replace(styleTagRegex, '');

  const inlineStyleRegex = / style="[^"]*"/gi;
  strippedHtml = strippedHtml?.replace(inlineStyleRegex, '');

  return strippedHtml;
}

export function extractEnglishTextAndPunctuation(input: string): string {
  const regex = /[a-zA-Z.,!? ]+/g;

  const matches = input?.match(regex);

  return matches ? matches?.join(" ") : " ";
}

export function removeUrls(str: string) {
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  return str?.replace(urlPattern, "");
}

export function getKeyWithHighestValue(obj: any) {
  return Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b));
}