# Decision 002: Database Choice

## Context
We need persistent storage for:
- User registrations (Discord ID ↔ in-game name)
- Snail stats (various attributes)
- Species War assignments (weekly rotation, 3 roles)
- War resource accumulation tracking
- Mine entries (start times, expiration tracking)

## Options

### Option A: PostgreSQL + Prisma
- **Pros**: 
  - Robust relational data model (good for war rotations, relationships)
  - Excellent TypeScript support via Prisma
  - Strong data integrity, transactions
  - Can handle complex queries for reporting/analytics
- **Cons**: 
  - Requires separate database server/service
  - More setup complexity
  - May be overkill for a single-guild bot

### Option B: SQLite + better-sqlite3 + Prisma
- **Pros**: 
  - File-based, no separate server needed
  - Still relational, supports complex queries
  - Prisma provides same DX as PostgreSQL
  - Easy backups (just copy the file)
- **Cons**: 
  - Not ideal for high concurrency (probably fine for single guild)
  - File locking concerns if multiple processes access

### Option C: MongoDB (or similar NoSQL)
- **Pros**: 
  - Flexible schema (good for evolving stats)
  - Document-based might match Discord's data model
- **Cons**: 
  - Less structure for war rotations, relationships
  - Weaker TypeScript integration
  - Querying war assignments/resource tracking less natural

## Recommendation
**SQLite + Prisma** - Provides relational benefits without infrastructure overhead. Prisma gives excellent TypeScript types. Easy to migrate to PostgreSQL later if needed.

## Status
**DECIDED**: SQLite + Prisma

## Outcome
Using SQLite for file-based relational storage with Prisma ORM for type-safe database access. Provides relational benefits without infrastructure overhead, easy to migrate to PostgreSQL if needed.

