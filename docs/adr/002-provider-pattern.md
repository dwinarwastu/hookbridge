# ADR 002: Provider Pattern for Signature Validation

## Status
Accepted

## Context
Each third-party provider (Stripe, GitHub, Midtrans) has a different signature validation algorithm.
The question is whether to put all validation logic in one place or abstract per provider.

## Decision
Introduce a provider pattern — each provider implements the `IProvider` interface with `validate()` and `extractEventType()`.

## Reasons
- **Open/Closed principle** — adding a new provider only requires a new class, no existing code changes
- **Testability** — each provider can be unit tested independently
- **Single responsibility** — each provider owns its own validation logic
- **Explicit contract** — `IProvider` interface enforces consistent API across all providers

## Consequences
- Slightly more boilerplate when adding a new provider
- Worth the trade-off for maintainability
