import fs from 'node:fs';
import path from 'node:path';

type Raw = {
  icon: string;
  description: string;
  codes: string; // "U+1F44B U+1F3FB"
  keywords: string[];
  sortKey?: string[];
  id: number;
};

const root = process.cwd();
const inFile = path.join(root, 'emoji.array.json');
const outFile = path.join(root, 'src', 'generated.ts');

const raw: Raw[] = JSON.parse(fs.readFileSync(inFile, 'utf8'));

const strip = (s: string) => s.replace(/^U\+/i, '').toUpperCase();

// normalize
const entries = raw.map((e) => {
  const cps = e.codes.trim().split(/\s+/).map(strip);

  const hay = (e.description + ' ' + (e.keywords || []).join(' '))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  return {
    id: e.id,
    icon: e.icon,
    desc: e.description,
    keywords: e.keywords || [],
    cps,
    hay,
  };
});

// Write a TS module (tree-shake friendly)
const code = `/* AUTO-GENERATED: do not edit by hand */
export type EmojiEntry = {
  id: number;
  icon: string;
  desc: string;
  keywords: string[];
  cps: string[];  
  hay: string;   
};

export const EMOJIS: readonly EmojiEntry[] = ${JSON.stringify(entries, null, 2)} as const;
export const EMOJI_BY_ID: Readonly<Record<number, EmojiEntry>> = ${JSON.stringify(
  Object.fromEntries(entries.map((e) => [e.id, e])),
  null,
  2,
)} as const;
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, code, 'utf8');

console.log(`Wrote ${outFile} (${entries.length} emojis)`);
