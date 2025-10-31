# Decision 005: Data Model - Snail Stats

## Context
We need to determine what snail stats to track. You mentioned "a variety of their snail's stats" but didn't specify which ones.

## Decided Schema
- **Power** (number)
- **Leadership** (number)
- **Minion simulation power** (number)
- **Simulation floor** (number)
- **Minion tier** (T1-T9, 9 tiers)

All are single values except minion tier (which is one of 9 tiers).

## Historical Tracking
We want to track historical values to generate growth graphs later.

## Implementation Approach
- Store current stats in User table
- Create StatsHistory table for time-series data
- Track timestamped snapshots when stats are updated

## Status
**DECIDED**: Power, Leadership, Minion Simulation Power, Simulation Floor, Minion Tier (T1-T9). Historical tracking via separate history table.

