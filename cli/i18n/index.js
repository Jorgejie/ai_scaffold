import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentTranslations = {};

export function registerI18n(lang) {
  const filePath = path.join(__dirname, `${lang}.json`);
  currentTranslations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  Handlebars.registerHelper('t', (key) => {
    const result = key.split('.').reduce((obj, k) => obj?.[k], currentTranslations);
    if (result === undefined) {
      console.warn(`[i18n] Missing translation key: ${key}`);
      return `[MISSING:${key}]`;
    }
    return new Handlebars.SafeString(result);
  });
}

export function t(key) {
  return key.split('.').reduce((obj, k) => obj?.[k], currentTranslations) || `[MISSING:${key}]`;
}
