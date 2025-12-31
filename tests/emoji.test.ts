import { describe, it, expect } from 'vitest';
import { EMOJIS, EMOJI_BY_ID } from '../src/generated';
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

  it('skin-tone sequences are usually base then modifier (and report offenders)', () => {
    const toneEntries = EMOJIS.filter((e) => e.cps.some(isTone));
    expect(toneEntries.length).toBeGreaterThan(0);

    const offenders: { id: number; cps: string[]; desc: string }[] = [];

    for (const e of toneEntries) {
      const toneIndex = e.cps.findIndex(isTone);

      if (toneIndex === 0) offenders.push({ id: e.id, cps: e.cps, desc: e.desc });
    }

    const ratio = offenders.length / toneEntries.length;

    expect(ratio).toBeLessThanOrEqual(0.05);

    if (offenders.length) {
      console.warn('Skin-tone ordering offenders (first 5):', offenders.slice(0, 5));
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

  it('search is case-insensitive and respects limit', () => {
    const ra = search('hand', { limit: 10 });
    const rb = search('HAND', { limit: 10 });

    expect(ra.items.length).toBeLessThanOrEqual(10);
    expect(rb.items.length).toBeLessThanOrEqual(10);

    expect(ra.items.map((x) => x.id)).toEqual(rb.items.map((x) => x.id));
  });

  it('search by hex finds entries containing that codepoint (and supports U+ prefix)', () => {
    const e = EMOJIS.find((x) => x.cps.length > 0);
    expect(e).toBeDefined();

    const hx = e!.cps[0];

    const r1 = search(hx, { limit: 200 });
    expect(r1.items.some((x) => x.id === e!.id)).toBe(true);

    const r2 = search(`U+${hx}`, { limit: 200 });
    expect(r2.items.some((x) => x.id === e!.id)).toBe(true);
  });

  it('empty search returns first N results and paginates with next', () => {
    const n = 25;

    const r1 = search('', { limit: n, next: 0 });
    expect(r1.items.length).toBe(n);
    expect(r1.items[0].id).toBe(EMOJIS[0].id);
    expect(r1.next).toBe(n);

    const r2 = search('', { limit: n, next: r1.next! });
    expect(r2.items.length).toBe(n);
    expect(r2.items[0].id).toBe(EMOJIS[n].id);

    const page1 = new Set(r1.items.map((x) => x.id));
    expect(r2.items.some((x) => page1.has(x.id))).toBe(false);
  });

  it('keyword paging is consistent across pages (same query)', () => {
    const q = 'hand';
    const limit = 20;

    const r1 = search(q, { limit, next: 0 });
    expect(r1.items.length).toBeLessThanOrEqual(limit);

    if (r1.next === null) {
      expect(r1.items.length).toBeGreaterThan(0);
      return;
    }

    const r2 = search(q, { limit, next: r1.next });
    expect(r2.items.length).toBeLessThanOrEqual(limit);

    const ids1 = new Set(r1.items.map((x) => x.id));
    expect(r2.items.some((x) => ids1.has(x.id))).toBe(false);
  });

  it('next is null when there are no more results', () => {
    const r = search('', { limit: 999999, next: 0 });
    expect(r.items.length).toBe(EMOJIS.length);
    expect(r.next).toBeNull();
  });
});
