# Decision 007: Prisma Schema Structure

## Context
Based on decided requirements, we need to design the Prisma schema for:
- Users (Discord ID, in-game name, stats)
- Stats history (for growth tracking)
- Species War assignments and resources
- Mine entries

## Proposed Schema Structure

```prisma
model User {
  id            String   @id // Discord user ID
  inGameName    String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Current stats
  power                Int?
  leadership           Int?
  minionSimPower       Int?
  simulationFloor      Int?
  minionTier           String? // "T1" through "T9"
  
  // War (weekly reset: Saturday 9 AM ET to Friday 7:30 AM ET)
  speciesWarRole       String? // "vanguard", "prospector", "laborer"
  silverBadgesAccum    Int     @default(0)
  silverBadgesUsed     Int     @default(0)
  goldBadgesAccum       Int     @default(0)
  goldBadgesUsed       Int     @default(0)
  drillsInventoried    Int     @default(0)
  drillsUsed           Int     @default(0)
  lastWarWeekReset     DateTime? // Track when resources were last reset for the week
  
  // Relations
  statsHistory         StatsHistory[]
  mineEntries          MineEntry[]
}

model StatsHistory {
  id            String   @id @default(cuid())
  userId        String
  timestamp     DateTime @default(now())
  
  power                Int?
  leadership           Int?
  minionSimPower       Int?
  simulationFloor      Int?
  minionTier           String?
  
  user                 User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, timestamp])
}

model MineEntry {
  id                    String   @id @default(cuid())
  userId                String
  tier                  Int      // Mine tier
  gatheringPoints       Int      // Number of gathering points
  durationPerPoint      Int      // Duration in seconds per gathering point
  startTime             DateTime @default(now())
  expirationTime        DateTime // Calculated: startTime + (gatheringPoints * durationPerPoint)
  isActive              Boolean  @default(true) // Marked false when expired/closed for the week
  
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isActive])
  @@index([expirationTime]) // For finding expired mines
}
```

## Decided Details
1. **War history**: Current role only, no historical tracking needed
2. **Mine tier**: Numeric (Int)
3. **War week timing**: 
   - War ends: Friday 7:30 AM ET
   - War starts: Saturday 9:00 AM ET
   - Need to track week boundaries for potential resource resets
4. **Validation**: "Parse, don't validate" - handle input parsing/constraints at application level, not DB schema

## Refined Schema Notes
- War resources should reset weekly (Saturday 9 AM ET to Friday 7:30 AM ET cycle)
- Add `lastWarWeekReset` timestamp to User to track when resources were last reset
- Mine tier is Int (already correct)
- Application-level validation for minionTier (T1-T9), roles (vanguard/prospector/laborer)
- Mines marked `isActive: false` when expired/closed for the week (not deleted)

## Status
**DECIDED**: Schema refined with war week timing, numeric mine tiers, application-level validation. Ready for implementation.

