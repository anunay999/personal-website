---
title: Read Smart — Personalized, Memory-Aware Reading
date: 2025-07-06
read: 6 min
tag: product
excerpt: A Chrome extension that learns what you've already read and quietly rewrites new articles to surface only the ideas that are actually new to you.
slug: read-smart
---

I spend hours every week skimming Medium posts, Substack newsletters, and the odd research-paper deep dive — only to slog past the same *"What is a neural network?"* preambles I've seen a hundred times. The real insight is usually buried halfway down, and I'm tired of wasting the scroll.

So I hacked together a Chrome extension over a few weekends that learns what I've already read and quietly rewrites new articles on the fly — stripping out the basics and surfacing only the fresh ideas.

https://www.youtube.com/watch?v=SgKCur2sMLU

## The problem: the web is 60% déjà vu

- **Redundant intros** — every AI article still explains *"neurons + weights"* before getting to the good parts.
- **Context overload** — long-form think-pieces link out in ten directions; I open them, forget the main point, and end up rabbit-holed.
- **Infinite-scroll burnout** — even speed-reading tricks don't help if 70% of the words are review.

Scrolling faster isn't solving the core issue: the content itself isn't personalized.

## The epiphany: teach the browser what I already know

If the browser remembers every concept I've read, it can skip those sections next time. It can highlight genuinely new ideas, so my eyes land where the learning actually starts. And it can pull context from my own reading history instead of pasting in a generic Wikipedia sidebar.

That's the blueprint for **Read Smart**.

## How it works

- **Remembers** — toggle *Add to Memory* and the extension stores key snippets of the page (encrypted in your Mem0 account).
- **Rewrites** — open a new article, flip *Smart Rephrase*, and it compares the page against your memory vault. Redundant parts fade; brand-new concepts get a subtle highlight.
- **Reader Mode** — prefer a clean page without AI flair? One click strips ads and clutter.
- **On-demand** — nothing runs until you click. Your tab, your call.
- **Independent** — no more pasting articles into ChatGPT and asking *"summarize this but skip the basics."* It happens automatically, personalized to **your** knowledge.

## The magic: it compounds

Here's what nobody tells you about knowledge — it compounds. And so does Read Smart.

**Week 1.** You're reading about ChatGPT in the *New York Times*. Read Smart learns you already get how AI chatbots work. No more *"computers that think like humans"* explanations cluttering your reads.

**Week 2.** A startup launches "AI for customer service." Three paragraphs explain what chatbots are — Read Smart skips to their actual innovation: handling angry customers with empathy. That's the part you haven't seen before.

**Week 4.** You click an article on AI bias. Instead of rehashing *"algorithms can be unfair,"* Read Smart jumps to the new detection method — and surfaces that MIT piece on fairness you bookmarked last month, right when it's relevant.

**Week 6.** Your morning scroll transforms. That 5,000-word Wired feature on *The Future of AI*? It shrinks to 1,200 — just the genuinely new predictions and insights. Articles that took 20 minutes now take 5, but you're learning more.

You're not reading faster. You're reading *smarter* — consuming only what advances your understanding, without losing depth. Every article builds on your personal knowledge, turning information overload into compound learning.

## Privacy first, always

I store work data behind enterprise firewalls — I'm not about to hand my reading history to strangers. So:

- **Local-only or personal Mem0 storage** — your choice.
- **No tracking, no analytics, no ads.**
- **Open source** — read the code, change what you want.

Your knowledge is yours alone.

## Try it

1. Install [Read Smart](https://github.com/anunay999/read-smart).
2. Add your Gemini and Mem0 API keys.
3. Toggle *Smart Rephrase* on any article.
4. Watch the fluff disappear.

Have feedback? [Open an issue](https://github.com/anunay999/read-smart/issues) — happy to hear what breaks and what helps.
