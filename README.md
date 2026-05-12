# Hookbridge

![CI](https://github.com/dwinarwastu/hookbridge/actions/workflows/ci.yml/badge.svg)

> Production-grade webhook gateway — built to show real-world backend architecture.

Built with **NestJS**, **BullMQ**, **Redis**, and **PostgreSQL**. Receives webhooks from third-party providers (Stripe, GitHub, Midtrans), validates signatures, and fans out events to internal services via queues.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| Queue | BullMQ + Redis |
| Database | PostgreSQL + TypeORM |
| Containerization | Docker + Docker Compose |

---

## How It Works

1. **Receive** — Third-party provider sends a webhook to `POST /webhook/:provider`
2. **Validate** — Signature is verified using provider-specific HMAC algorithm
3. **Log** — Webhook payload is saved to PostgreSQL (`status: received`)
4. **Enqueue** — Job is pushed to BullMQ for async processing
5. **Fan-out** — Worker finds all active subscriptions matching the provider + event type, then routes the event to each subscriber's target queue
6. **Dead letter** — If all retry attempts are exhausted, the job is moved to the dead letter queue and status is marked `dead`

Each provider has its own signature validation logic — swapping or adding a provider only requires implementing the `IProvider` interface.

---

## Project Structure

```
src/
├── webhook/              # HTTP entry point, receive webhooks from third party
├── queue/                # BullMQ queue declarations
├── workers/              # Job processor, fan-out logic
├── provider/             # Signature validation per provider
│   └── providers/
│       ├── github.provider.ts
│       ├── stripe.provider.ts
│       └── midtrans.provider.ts
├── subscription/         # Internal service subscription management
└── common/
    ├── entities/
    ├── enums/
    └── interfaces/
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose

### Run with Docker

```bash
cp .env.example .env
# fill in your credentials
docker compose up -d
```

### Run locally

```bash
npm install
npm run start:dev
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default: `5432`) |
| `DB_USER` | PostgreSQL user |
| `DB_PASS` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port (default: `6379`) |
| `GITHUB_WEBHOOK_SECRET` | GitHub webhook secret |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `MIDTRANS_SERVER_KEY` | Midtrans server key |

> In `development`, signature validation is skipped automatically.

---

## API Reference

### Receive a webhook

```
POST /webhook/:provider
```

| Param | Values |
|---|---|
| `provider` | `github`, `stripe`, `midtrans` |

**Response**

```json
{
  "id": "ef241bb7-15f4-4d66-82c4-56b331e96533",
  "status": "received"
}
```

---

### Check webhook status

```
GET /webhook/:id/status
```

**Response**

```json
{
  "id": "ef241bb7-15f4-4d66-82c4-56b331e96533",
  "provider": "stripe",
  "status": "delivered",
  "eventType": "payment_intent.succeeded",
  "payload": {},
  "attemptCount": 1,
  "errorMessage": null,
  "deliveredAt": "2026-05-12T07:49:02.993Z",
  "createdAt": "2026-05-12T07:49:02.953Z",
  "updatedAt": "2026-05-12T07:49:02.994Z"
}
```

---

### Register a subscription

Internal services register which events they want to receive.

```
POST /subscription
```

```json
{
  "name": "order-service",
  "provider": "stripe",
  "eventType": "payment_intent.succeeded",
  "targetQueue": "order-queue"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Internal service name |
| `provider` | `github \| stripe \| midtrans` | Yes | Provider to subscribe to |
| `eventType` | `string` | Yes | Event type to listen for |
| `targetQueue` | `string` | Yes | BullMQ queue name to push the event to |
| `isActive` | `boolean` | No | Default: `true` |

---

### List all subscriptions

```
GET /subscription
```

---

### Toggle subscription active status

```
PATCH /subscription/:id/toggle
```

---

### Remove a subscription

```
DELETE /subscription/:id
```

---

## Webhook Status

| Status | Description |
|---|---|
| `received` | Webhook received and saved |
| `processing` | Worker picked up the job |
| `delivered` | Successfully fanned out to all subscribers |
| `failed` | Retry attempts in progress |
| `dead` | All retries exhausted, moved to dead letter queue |

---

## Retry Strategy

Failed jobs are retried automatically with exponential backoff.

| Attempt | Delay |
|---|---|
| 1st retry | 5s |
| 2nd retry | 10s |
| 3rd retry | 20s |

After 3 failed attempts, the job is moved to the dead letter queue and marked `dead`.

---

## Adding a New Provider

1. Create a new provider class under `src/provider/providers/`
2. Implement the `IProvider` interface

```typescript
export interface IProvider {
  validate(payload: Buffer, headers: Record<string, unknown>): boolean;
  extractEventType(payload: Record<string, unknown>): string;
}
```

3. Register the provider in `provider.module.ts` and `provider.service.ts`
4. Add the provider value to `ProviderEnum`

---

## Architecture Decisions

See [docs/adr](./docs/adr) for architecture decision records explaining the key design choices behind this service.
