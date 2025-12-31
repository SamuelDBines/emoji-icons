# Emoji Search

A small, fast, browser-friendly emoji search library built from Unicode codepoints.

- 🔍 Keyword + hex search
- 🎨 Correct handling of emoji sequences (skin tones, modifiers)
- 🌐 Works in browser, Node, and Bun
- 📦 Zero runtime dependencies
- 🧠 No DOM coupling — bring your own UI

## Why this exists

Most emoji libraries are either:

- Huge datasets you don’t need
- UI-opinionated pickers
- Hard to extend or inspect

This library focuses on data + search only:

- You control rendering
- You control UX
- You get predictable results

## Installation

npm install @samuelbines/emojis

### or

bun add @samuelbines/emojis

## Basic Usage

```ts
import { search } from '@samuelbines/emojis';

const results = search('waving hand');

results.forEach((e) => {
  console.log(e.icon, e.desc);
});
```

### Search

Keyword search

```ts
search('hand');
search('skin tone');
search('thumbs up');
```

### Hex / Unicode search

```ts
search('1F44B'); // waving hand
search('U+1F3FC'); // medium-light skin tone
```

### Limit results

```ts
search('hand', { limit: 20 });
```

### Emoji Helpers

Convert hex → emoji

```ts
import { emojiFromHex } from '@samuelbines/emojis';

emojiFromHex(['1F91A', '1F3FC']); // 🤚🏼
```

Convert emoji → hex

```ts
import { hexFromEmoji } from '@sam/emoji-search';

hexFromEmoji('🤚🏼'); // ["1F91A", "1F3FC"]
```

Get emoji by ID

```ts
import { getById } from '@sam/emoji-search';

const emoji = getById(42);
console.log(emoji.icon);
```

EmojiEntry shape

```ts
type EmojiEntry = {
  id: number;
  icon: string; // "👋🏻"
  desc: string; // "waving hand: light skin tone"
  keywords: string[];
  cps: string[]; // ["1F44B","1F3FB"]
};
```

Browser example

```html
<input id="emojiSearch" placeholder="Search emoji…" />
<div id="results"></div>

<script type="module">
  import { search } from '@sam/emoji-search';

  const input = document.getElementById('emojiSearch');
  const results = document.getElementById('results');

  input.addEventListener('input', () => {
    results.innerHTML = '';
    for (const e of search(input.value, { limit: 50 })) {
      const btn = document.createElement('button');
      btn.textContent = `${e.icon} ${e.desc}`;
      results.appendChild(btn);
    }
  });
</script>
```

## Build / Development

The emoji index is generated at build time from emoji.array.json.

```bash
bun run build
```

### or

```bash
npm run build
```

This keeps runtime code small and fast.

Design decisions

- No fuzzy matching (simple includes is predictable)
- No DOM (UI belongs to you)
- No auto skin-tone generation (explicit > magic)
- Precomputed search strings for speed
- No external dev dependancies

### When not to use this

You need a full emoji picker UI

You need locale-aware emoji names

You want fuzzy / AI-style matching

This library is intentionally simple.
