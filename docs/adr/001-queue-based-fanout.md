# ADR 001: Queue-based Fan-out over HTTP

## Status
Accepted

## Context
When a webhook is received, it needs to be forwarded to multiple internal services.
Two options considered: HTTP fan-out (forward via REST) or queue-based fan-out (push to BullMQ).

## Decision
Use queue-based fan-out — push events to each subscriber's target queue.

## Reasons
- **Decoupled** — hookbridge doesn't care if internal services are up or down
- **Retry built-in** — BullMQ handles retry automatically, no custom logic needed
- **Backpressure** — internal services consume at their own pace, no timeout issues
- **Consistent** — same pattern used across the system

## Consequences
- Internal services must consume from BullMQ queues
- Not suitable if internal services need to respond synchronously to webhook events
