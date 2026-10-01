// read D:/Projects/Creativism App/.env (strips single/double quotes)
import { readFileSync } from 'node:fs';
export const env = Object.fromEntries(readFileSync('D:/Projects/Creativism App/.env', 'utf8').split(/\r?\n/)
  .map(l => l.match(/^\s*([A-Za-z0-9_@.\-]+)\s*=\s*(.*)$/)).filter(Boolean)
  .map(([, k, v]) => [k, v.trim().replace(/^(['"])(.*)\1$/, '$2')]));
