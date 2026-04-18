---
title: Building Low Latency Streaming Data Pipelines — Part 1
date: 2025-04-20
read: 9 min
tag: systems
excerpt: Notes from building streaming pipelines that hold up under real load. Backpressure, watermarks, and the tradeoffs you only learn by running into them.
slug: streaming-data-pipelines
---

Every streaming system eventually becomes a conversation about backpressure.

When downstream can not keep up, you either drop, buffer, or block — and each of those three is a different product.

Watermarks are how we tell time to a system that does not know what time it is. They are also where most correctness bugs live.

Part 1 of a series. Next up: exactly-once in practice (a lie we tell each other).
