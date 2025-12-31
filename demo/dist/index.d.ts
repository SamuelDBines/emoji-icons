import { type EmojiEntry } from './generated.js';
export type { EmojiEntry };
export type SearchOptions = {
    limit?: number;
    next?: number;
};
export type SearchResult = {
    items: EmojiEntry[];
    next: number | null;
    total?: number;
};
export declare const cp: (h: string) => number;
export declare const emojiFromHex: (hexes: string[]) => string;
export declare const hexFromEmoji: (s: string) => string[];
export declare const getById: (id: number) => EmojiEntry;
export declare function search(query: string, opts?: SearchOptions): SearchResult;
export declare const all: () => readonly EmojiEntry[];
export declare const count: () => number;
