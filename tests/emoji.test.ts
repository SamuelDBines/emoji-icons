import { describe, it, expect } from 'vitest';
import { EMOJIS, EMOJI_BY_ID, type EmojiEntry } from '../src/generated';
import { count, search, getById, emojiFromHex, hexFromEmoji } from '../src/index';

const isHex = (s: string) => /^[0-9A-F]{4,6}$/.test(s);
const isTone = (hex: string) => {
  const cp = parseInt(hex, 16);
  return cp >= 0x1f3fb && cp <= 0x1f3ff;
};

describe('emoji dataset integrity', () => {
  it('EMOJIS is non-empty and count() matches', () => {
    expect(Array.isArray(EMOJIS)).toBe(true);
    expect(EMOJIS.length).toBeGreaterThan(0);
    expect(count()).toBe(EMOJIS.length);
  });

  it('all ids are unique', () => {
    const ids = EMOJIS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('EMOJI_BY_ID contains every emoji id', () => {
    for (const e of EMOJIS) {
      expect(EMOJI_BY_ID[e.id]).toBeDefined();
      expect(EMOJI_BY_ID[e.id].icon).toBe(e.icon);
      expect(EMOJI_BY_ID[e.id].desc).toBe(e.desc);
    }
  });

  it('entries have valid cps hex strings and non-empty descriptions', () => {
    for (const e of EMOJIS) {
      expect(typeof e.icon).toBe('string');
      expect(e.icon.length).toBeGreaterThan(0);

      expect(typeof e.desc).toBe('string');
      expect(e.desc.trim().length).toBeGreaterThan(0);

      expect(Array.isArray(e.cps)).toBe(true);
      expect(e.cps.length).toBeGreaterThan(0);

      for (const h of e.cps) {
        expect(typeof h).toBe('string');
        expect(h).toBe(h.toUpperCase());
        expect(isHex(h)).toBe(true);
      }
    }
  });

  it('common skin-tone sequences have base first then modifier', () => {
    const toneEntries = EMOJIS.filter((e) => e.cps.some(isTone));
    expect(toneEntries.length).toBeGreaterThan(0);

    for (const e of toneEntries) {
      const toneIndex = e.cps.findIndex(isTone);
      expect(toneIndex).toBeGreaterThan(0);
    }
  });
});

describe('public API', () => {
  it('getById returns entry or null', () => {
    const first = EMOJIS[0];
    expect(getById(first.id)?.icon).toBe(first.icon);

    expect(getById(-12345)).toBeNull();
  });

  it('emojiFromHex matches the icon for a known entry', () => {
    const e = EMOJIS.find((x) => x.cps.length >= 1);
    expect(e).toBeDefined();
    expect(emojiFromHex(e!.cps)).toBe(e!.icon);
  });

  it('hexFromEmoji round-trips with emojiFromHex', () => {
    const sample = EMOJIS.slice(0, Math.min(50, EMOJIS.length));
    for (const e of sample) {
      const hex = hexFromEmoji(e.icon);
      expect(emojiFromHex(hex)).toBe(e.icon);
    }
  });

  it('search returns limited results and is case-insensitive', () => {
    const a = search('hand', { limit: 10 });
    const b = search('HAND', { limit: 10 });
    expect(a.length).toBeLessThanOrEqual(10);
    expect(b.length).toBeLessThanOrEqual(10);

    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
  });

  it('search by hex finds entries containing that codepoint', () => {
    const e = EMOJIS.find((x) => x.cps.length > 0);
    expect(e).toBeDefined();

    const hx = e!.cps[0];
    const hits = search(hx, { limit: 200 });

    expect(hits.some((x) => x.id === e!.id)).toBe(true);

    // U+ prefix should also work
    const hits2 = search(`U+${hx}`, { limit: 200 });
    expect(hits2.some((x) => x.id === e!.id)).toBe(true);
  });

  it('empty search returns first N results', () => {
    const n = 25;
    const hits = search('', { limit: n });
    expect(hits.length).toBe(n);
    expect(hits[0].id).toBe(EMOJIS[0].id);
  });
});
