---
title: "Bloom Filters: What Are They and Why Did I Just Learn About Them"
description: "I stumbled on bloom filters while building a word game. Here's what they are, how they work, and why they matter for web performance."
date: "2026-03-05"
updated: "2026-03-05"
tags:
  - bloom-filters
  - word-games
  - performance
  - core-web-vitals
readingTime: "5 min read"
cover: ""
---

There's a word game sitting on my hard drive that I've been building, on and off, for months. It works. I've played it more times than I'd like to admit just testing it. I even mostly enjoyed building it.

But I've never shipped it.

This is a pattern I know well. I get to a certain point in a project and something fuzzy shows up on the horizon. Not a real blocker, but a shape I don't recognize yet. Sometimes I freeze. Sometimes I go deep, learn the thing, and come out the other side with something new in my toolkit.

With the word game, the fuzzy shape was a question I couldn't shake: *how do I validate words without shipping a 300 KB dictionary file to every person who loads the page?*

That question led me to bloom filters.

## The Problem With a Word List

Every word game needs a dictionary. You need to be able to answer one question fast: is this a real word?

The naive approach is to bundle the entire word list as a JSON or text file. For common English word lists, that's anywhere from 100 KB to several hundred kilobytes. Even compressed, it's a meaningful chunk of data. On mobile, over a slow connection, that weight shows up in your Core Web Vitals. Specifically, it pushes up your Largest Contentful Paint (LCP) and keeps your app from being interactive quickly.

You could lazy-load it, or fetch it from an API, but then you're adding network round trips on every word check. That's its own set of trade-offs.

I needed something smaller and faster.

## What Bloom Filters Are

A bloom filter is a space-efficient, probabilistic data structure. It answers one question: "has this item been seen before?" It does so very fast, using far less memory than storing the actual items.

The catch, and it's a deliberate one, is that it can't give you a guaranteed "yes." It can only give you a guaranteed "no."

When you check for a word:

- If the filter says **no**, the word is definitely not in the set.
- If the filter says **yes**, the word is *probably* in the set, but there's a small chance it's a false positive.

That asymmetry is the whole point. False negatives are impossible. False positives are tunable.

For a word game, this is completely acceptable. If the filter says a nonsense string is a valid word at a 1% error rate, you can handle that edge case. But you'll never incorrectly reject a real word.

## How It Works

Internally, a bloom filter is a bit array. Just a long sequence of zeros and ones. When you add a word, you run it through several hash functions. Each hash function points to a position in the array and flips that bit to 1.

When you check a word, you run the same hash functions and look at those positions. If any position is still 0, the word was never added. If all positions are 1, the word was probably added.

Here's a minimal JavaScript illustration:

```js
// Conceptual only, not a production implementation
function createFilter(size) {
  return new Uint8Array(size);
}

function add(filter, word, hashFns) {
  for (const hash of hashFns) {
    filter[hash(word) % filter.length] = 1;
  }
}

function check(filter, word, hashFns) {
  return hashFns.every(hash => filter[hash(word) % filter.length] === 1);
}
```

The bit array itself can be serialized and shipped as a compact binary or base64 blob. For 100,000 English words at a 1% false positive rate, you're looking at roughly 20 to 50 KB. That's compared to 200+ KB for the raw word list.

The false positive rate is controlled by three things: the size of the bit array, the number of hash functions, and the number of items inserted. With around 10 bits per element, you can reliably hold the false positive rate to about 1%. Libraries like [bloom-filters](https://www.npmjs.com/package/bloom-filters) handle the math automatically.

One thing you can't do with a standard bloom filter is remove items. Once a bit is flipped to 1, you can't know if it belongs to one word or several. That's a known limitation. For a static word list, it doesn't matter at all.

## Why This Matters for Word Games and Core Web Vitals

Building a bloom filter from your word list is a one-time offline step. You run a Node script, serialize the result, and check in the output as a static asset. At runtime, the client loads the compact binary and does all lookups in memory. No network calls per word, no giant JSON file.

The impact on Core Web Vitals is real:

- **LCP improves** because the browser has less to download and parse before the game is ready to show.
- **INP (Interaction to Next Paint) improves** because word lookups are O(1) in practice. Each check runs k hash functions (k is fixed, usually 3 to 7) and reads k positions in the bit array. There's no traversal, no comparison loop, just a few array reads.
- **Bundle size stays small**, which helps on mobile and low-bandwidth connections where Core Web Vitals gaps are most visible.

This is the kind of optimization that looks invisible to users, but that's the point. The game just feels fast.

## When to Reach for a Bloom Filter

Bloom filters make sense when:

- You have a large, static set you need to check membership against.
- Space is more valuable than perfect precision.
- False positives are tolerable (and you can handle them downstream if they matter).

Real-world places they show up: Cassandra and HBase use them to avoid unnecessary disk reads. Web browsers use them for phishing URL lists. Content delivery systems use them to track what's already been cached.

They're not the right tool when:

- You need exact answers with no false positives.
- Your set changes frequently and you need to remove items.
- The set is small enough that a plain `Set` or hash table is already fast and light.

## Shipping the Word Game

Learning about bloom filters didn't just solve the dictionary problem. It cleared the fuzzy shape off the horizon. The unknown became known, and once it's known, it's just work.

That's usually how it goes with the things I freeze on. The barrier wasn't technical. It was the unfamiliarity. Once I had a name for the thing and understood the trade-offs, the decision was easy.

The game still isn't shipped. But now it's blocked on something else entirely, which is progress.
