---
title: Building NeuroTrail — A Memory-Augmented Learning Companion
date: 2025-03-15
read: 8 min
tag: ai
excerpt: From a growing EPUB backlog to a learning agent that remembers what you've read, finds your gaps, and turns reading into a daily habit instead of a weekend project.
slug: neuro-trail
---

## The struggle with reading backlogs

I've always loved collecting EPUBs, convinced I'd eventually get to them. But with a packed schedule, finding time to sit and read became harder and harder. I tried using Notebook LMs to extract key insights from books, but something felt off — I wasn't asking the right questions, and the process wasn't as effective as I hoped.

So I started tinkering. I'd already built a few side projects around Retrieval-Augmented Generation but never published anything. In parallel I'd been exploring graph databases, and I wondered: *what if I built a knowledge graph for my books?*

I hacked together a quick prototype, and it worked like magic. The graph carried semantic information about each book, making it much easier to retrieve relevant content. Then I let it sit for a week — until a new idea hit.

What if I built a companion that knows what I've learned so far on a topic, curates an email digest each day on the books I want to read, and helps me move forward in my learning journey? That makes it almost frictionless — I just catch up on email in the morning instead of carving out dedicated reading time. From there I started piecing together the rest of the idea.

## The vision

What if I could build an agent that remembers what I've learned, curates daily email digests based on the books I want to read, and helps me make consistent progress? Instead of setting aside dedicated reading time, I could integrate learning into my routine — by checking my email.

That's how **NeuroTrail** was born — a memory-augmented learning agent that:

- Ingests and processes knowledge sources (EPUBs for now; PDFs and DOCX next).
- Evaluates what you already know to identify gaps and generate personalized learning paths.
- Uses embeddings and LLMs to generate quiz-style questions for self-testing.
- Tracks your learning history and suggests what to study next.
- Sends daily email digests based on your progress.

## Building the companion

I broke the system down into a handful of components.

### 1. Ingesting EPUBs and extracting knowledge

The first module processes EPUB files and converts them into structured knowledge. Using `ebooklib` I extract text from the books, then push it into a vector store for efficient retrieval.

### 2. Building a knowledge graph

That structured knowledge then flows into a Neo4j graph database, so every concept in a book carries semantic links to its neighbors instead of living as an isolated chunk.

### 3. Embedding text for smart retrieval

To make the agent interactive, I generate embeddings for each book's content using Sentence Transformers and store them in FAISS for fast nearest-neighbor search.

### 4. Tying the LLM to the knowledge graph

Once the graph is in place, an LLM answers questions grounded in the book's content. Rather than relying on retrieval alone, queries fetch relevant context from the vector store and let the LLM produce a more refined response on top of it.

### 5. Feedback and refinement

A real challenge in AI-driven learning is making sure the responses are actually useful. NeuroTrail asks the user to confirm whether the answer landed and accepts feedback to refine it.

A separate memory module tracks what the user has already learned, so future responses skip the redundant context and focus on what's next in the learning path.

## What's next

This is just the start. A few directions I want to take it:

- **Open WebUI integration** for a better interaction surface.
- **Scheduled email digests** so users get curated learning summaries based on progress *(coming in the next post)*.
- **A multi-agent ecosystem** that separates learning, feedback, and content generation.
- **Historical and epistemic retrieval** for sharper knowledge tracking.
- **Expanded document support** for PDFs and DOCX.
- **Multi-modal analysis** — text, tables, images — for deeper insight.

## Wrapping up

This started as a simple attempt to deal with my ever-growing reading backlog and quickly turned into something bigger: an AI-powered learning companion that keeps me accountable and continuously refines how I learn.

If you're struggling to keep up with your reading list, give [NeuroTrail](https://github.com/anunay999/neuro-trail) a try. It might be the missing piece of your learning loop too.
