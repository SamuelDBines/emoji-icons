import { EMOJIS, EMOJI_BY_ID } from './generated.js';
export const cp = (h) => parseInt(h.replace(/^U\+/i, ''), 16);
export const emojiFromHex = (hexes) => String.fromCodePoint(...hexes.map((h) => cp(h)));
export const hexFromEmoji = (s) => [...s].map((ch) => ch.codePointAt(0).toString(16).toUpperCase());
export const getById = (id) => EMOJI_BY_ID[id] ?? null;
const looksLikeHex = (q) => /^[0-9A-Fa-f]{4,6}$/.test(q.replace(/^U\+/i, ''));
const normalizeHex = (q) => q.replace(/^U\+/i, '').toUpperCase();
export function search(query, opts = {}) {
    const limit = opts.limit ?? 50;
    const q = (query ?? '').trim().toLowerCase();
    if (!q)
        return EMOJIS.slice(0, limit);
    if (looksLikeHex(q)) {
        const hx = normalizeHex(q);
        const out = [];
        for (const e of EMOJIS) {
            if (e.cps.includes(hx))
                out.push(e);
            if (out.length >= limit)
                break;
        }
        return out;
    }
    const out = [];
    for (const e of EMOJIS) {
        if (e.hay.includes(q))
            out.push(e);
        if (out.length >= limit)
            break;
    }
    return out;
}
export const all = () => EMOJIS;
export const count = () => EMOJIS.length;
