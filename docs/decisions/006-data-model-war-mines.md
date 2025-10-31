# Decision 006: Data Model - Species War & Mines

## Context
Need to model:
- Species War: Weekly rotation, 3 roles, resource accumulation rates
- Mines: Timed entries with expiration tracking

## Species War - Decided
- **Roles**: Vanguard, Prospector, Laborer (assigned by club admin)
- **Resources tracked**: Silver badges, Gold badges (accumulation + usage)
- **Drills**: Self-reported (inventoried + used)
- **Assignment**: Admin assigns roles (not automatic)

## Mines - Decided
- **Active mines**: One per user
- **Mine data**: Tier, number of gathering points, duration per gathering point
- **Start time**: Can be "now" or user-specified
- **Total duration**: duration per gathering point × number of gathering points

## Implementation Approach
- **War**: User has current role, track resource accumulation and usage per week
- **Mines**: Table with user_id, tier, gathering_points, duration_per_point, start_time, calculated expiration_time

## Status
**DECIDED**: See details above. Admin-assigned roles, tracking badges (accumulation+usage) and drills (self-reported). One active mine per user with variable gathering points and durations.

