# Decision 004: User Interaction Patterns

## Context
We need to decide how users interact with the bot for core flows:
- Registration (Discord ID + in-game name)
- Stats updates (various snail attributes)
- Mine entry (start timer)
- War resource tracking (update usage)

## Options

### Option A: Slash Commands + Modals
- **Pros**: 
  - Clean, modern Discord UX
  - Modals great for multi-field forms (stats, registration)
  - Native Discord experience
- **Cons**: 
  - Modals have field limits (5 fields, 4000 chars total)
  - May need multiple modals for extensive stats

### Option B: Slash Commands + Follow-up Embeds with Buttons
- **Pros**: 
  - More flexible than modals
  - Can show current state before editing
  - Better for multi-step flows
- **Cons**: 
  - More complex interaction handling
  - Message-based (less ephemeral)

### Option C: Hybrid Approach
- **Pros**: 
  - Use modals for simple forms (registration, mine start)
  - Use embeds + buttons for viewing/editing stats (show current, edit specific fields)
  - Optimize each flow
- **Cons**: 
  - More patterns to maintain

## Recommendation
**Hybrid Approach** - Registration and mine start via modals (simple forms). Stats viewing/editing via embeds + buttons (can show current state, edit specific fields, handle extensive stats). War resources similar pattern.

## Status
**DECIDED**: Hybrid Approach

## Outcome
Using modals for simple forms (registration, mine start). Using embeds + buttons for stats viewing/editing to show current state and allow editing specific fields. War resource tracking follows similar pattern.

