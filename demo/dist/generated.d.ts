export type EmojiEntry = {
    id: number;
    icon: string;
    desc: string;
    keywords: string[];
    cps: string[];
    hay: string;
};
export declare const EMOJIS: readonly EmojiEntry[];
export declare const EMOJI_BY_ID: Readonly<Record<number, EmojiEntry>>;
