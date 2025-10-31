# Decision 008: Mine Expiration Reminders

## Context
Users need to be reminded when their mine expires. Need to decide how to implement reminder system.

## Options

### Option A: Scheduled Jobs (node-cron or similar)
- **Pros**: 
  - Can check all mines periodically
  - Simple to implement
- **Cons**: 
  - Requires always-running process
  - Potential delays (checks every X minutes)
  - Need to handle missed checks

### Option B: Discord Scheduled Events API
- **Pros**: 
  - Native Discord feature
  - Discord handles scheduling
- **Cons**: 
  - Requires Discord server boost level 2
  - Less control over reminder format
  - May not fit our use case

### Option C: Timer-based (setTimeout/setInterval per mine)
- **Pros**: 
  - Precise timing
  - Immediate reminders
- **Cons**: 
  - Complex state management
  - Lost on bot restart (need persistence)
  - Memory concerns with many active mines

### Option D: Hybrid - Periodic check + persistent timers
- **Pros**: 
  - Check on bot start for expired mines
  - Set timers for upcoming expirations
  - Periodic check as backup
- **Cons**: 
  - Most complex to implement

## Recommendation
**Option A (Scheduled Jobs)** - Simple, reliable. Check every 5 minutes for expired mines. On bot start, check all active mines. Can add more sophisticated timing later if needed.

## Status
**DECIDED**: Scheduled Jobs (node-cron)

## Outcome
Using periodic scheduled jobs (every 5 minutes) to check for expired mines. On bot start, check all active mines immediately. Simple and reliable approach.

