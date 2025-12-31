import { EMOJIS, EMOJI_BY_ID } from './generated.js';
export const cp = (h) => parseInt(h.replace(/^U\+/i, ''), 16);
export const emojiFromHex = (hexes) => String.fromCodePoint(...hexes.map((h) => cp(h)));
export const hexFromEmoji = (s) => [...s].map((ch) => ch.codePointAt(0).toString(16).toUpperCase());
export const getById = (id) => EMOJI_BY_ID[id] ?? null;
const looksLikeHex = (q) => /^[0-9A-Fa-f]{4,6}$/.test(q.replace(/^U\+/i, ''));
const normalizeHex = (q) => q.replace(/^U\+/i, '').toUpperCase();
export function search(query, opts = {}) {
    const limit = Math.max(1, opts.limit ?? 50);
    const offset = Math.max(0, opts.next ?? 0);
    const q = (query ?? '').trim().toLowerCase();
    if (!q) {
        const items = EMOJIS.slice(offset, offset + limit);
        const next = offset + items.length < EMOJIS.length ? offset + items.length : null;
        return { items, next, total: EMOJIS.length };
    }
    if (looksLikeHex(q)) {
        const hx = normalizeHex(q);
        const filtered = EMOJIS.filter((e) => e.cps.includes(hx));
        const items = filtered.slice(offset, offset + limit);
        const next = offset + items.length < filtered.length ? offset + items.length : null;
        return { items, next, total: filtered.length };
    }
    const filtered = EMOJIS.filter((e) => e.hay.includes(q));
    const items = filtered.slice(offset, offset + limit);
    const next = offset + items.length < filtered.length ? offset + items.length : null;
    return { items, next, total: filtered.length };
}
export const all = () => EMOJIS;
export const count = () => EMOJIS.length;
