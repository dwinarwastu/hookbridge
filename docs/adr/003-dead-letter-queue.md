# ADR 003: Dead Letter Queue for Failed Webhooks

## Status
Accepted

## Context
When a webhook job exhausts all retry attempts, we need to decide what happens to it.
Two options: discard the job or move it to a dead letter queue.

## Decision
Move exhausted jobs to a dedicated `dead-letter-queue` and mark the log status as `dead`.

## Reasons
- **No data loss** — failed webhooks are preserved for manual review or replay
- **Observability** — dead letter queue can be monitored and alerted on
- **Auditability** — PostgreSQL log shows which webhooks ended up dead and why
- **Recovery** — ops team can replay dead jobs after fixing the root cause

## Consequences
- Dead letter queue needs to be monitored
- Without a consumer, dead jobs accumulate in Redis — need periodic cleanup or a DLQ processor
