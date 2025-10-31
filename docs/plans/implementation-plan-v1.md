# Implementation Plan v1

## Overview
Discord bot for Super Snail club management with user registration, stats tracking, Species War management, and mine expiration reminders.

**Bot Name**: BigNickBot (configurable via environment variable `BOT_NAME`, defaults to "BigNickBot")

**Tone**: Irreverent, dry wit, sarcasm, light insults acceptable. The club is casual and humor is welcome.

## Technology Stack
- **Discord Library**: discord.js
- **Database**: SQLite + Prisma
- **Language**: TypeScript
- **Command Handling**: Custom handler (lightweight)
- **Scheduling**: node-cron (for mine reminders)
- **Admin Authorization**: Discord role-based (check for admin role, not Discord permissions)

## Core Features

### 1. User Registration

#### Detailed Implementation Steps

**1.1 Create Registration Command**
- File: `src/commands/register.ts`
- Slash command: `/register`
- Command description: "Register your snail with BigNickBot"
- Ephemeral response: No (let others see registrations)

**1.2 Registration Flow**
1. User invokes `/register`
2. Bot responds with modal via `interaction.showModal()`
3. Modal fields:
   - `in_game_name` (TextInputComponent, required, max 100 chars, placeholder: "Your in-game name")
   - Modal title: "Register with BigNickBot"
   - Modal custom_id: `register_modal`

**1.3 Modal Submission Handler**
- File: `src/interactions/modals/register.ts`
- Extract `in_game_name` from modal fields
- Validate: non-empty, trimmed, max 100 chars
- Check if user already registered:
  - If yes: Update `inGameName` field, respond with witty message about changing their mind
  - If no: Create new User record
- Database operation:
  ```typescript
  // Using Prisma
  await prisma.user.upsert({
    where: { id: interaction.user.id },
    update: { inGameName: inGameName },
    create: {
      id: interaction.user.id,
      inGameName: inGameName
    }
  })
  ```
- Success response: Embed with welcome message (include some sarcasm/wit)
- Error handling: If validation fails, respond with error message (ephemeral). If DB fails, log error and respond with generic error (don't expose internals)

**1.4 Response Messages**
- First-time registration: "Well, well, look who decided to join us. Welcome, {inGameName}. Try not to mess this up."
- Re-registration: "Changed your mind about your name, did you? Fine, you're now {inGameName}. Don't make me update this again."
- Error: "Nice try, but that name doesn't work. Try again when you've got your act together."

**1.5 Testing Checklist**
- [ ] New user can register successfully
- [ ] User can re-register with new name
- [ ] Empty name is rejected
- [ ] Name over 100 chars is rejected
- [ ] Database record created/updated correctly
- [ ] Response messages display correctly

---

### 2. Stats Management

#### High-Level Implementation

**2.1 View Stats**
- Slash command: `/stats` (ephemeral: false)
- Fetch user from database (if not registered, prompt them to register)
- Display embed with current stats:
  - Power, Leadership, Minion Simulation Power, Simulation Floor, Minion Tier
  - Show "Not set" for null values
- Include buttons for each stat field to edit
- Button custom_ids: `stats_edit_power`, `stats_edit_leadership`, etc.

**2.2 Edit Stats Flow**
- Button click → show modal for that specific stat
- Modal title: "Update {stat_name}"
- Single field for the value
- Validation based on stat type (numbers for most, T1-T9 for minion tier)
- On submit: Update User record + create StatsHistory entry
- Respond with updated embed showing new value

**2.3 Update Stats Command (Alternative)**
- Slash command: `/stats update` (modal with all fields)
- Optional fields (can leave blank to skip)
- Batch update capability

**2.4 Stats History**
- Create StatsHistory entry on every update
- Store timestamp, all stat values (even if unchanged)
- Used later for growth graphs

**2.5 Response Messages**
- User not registered: "You're not even registered yet. Go figure."
- Stats updated: "There, I updated your {stat_name}. Try not to break it."
- Validation error: "That's not a valid {stat_name}. Try again."

---

### 3. Species War Management

**3.1 Admin Assignment**
- Slash command: `/war assign <user> <role>`
- Check if command invoker has admin role (Discord role check)
- Validate role: must be "vanguard", "prospector", or "laborer"
- Update User.speciesWarRole
- Response: "Assigned {user} to {role}. Don't let them mess this up."

**3.2 Resource Tracking**
- Slash command: `/war resources` (view/edit badges and drills)
- Display embed with current accumulation/usage for:
  - Silver badges (accumulated, used)
  - Gold badges (accumulated, used)
  - Drills (inventoried, used)
- Buttons to edit each resource type
- Modal for editing (accumulation and usage separately or combined?)

**3.3 Weekly Reset**
- Scheduled job: Check every hour if new war week has started
- War week: Saturday 9 AM ET to Friday 7:30 AM ET
- On reset: Clear/reset resource counters, update lastWarWeekReset timestamp
- Notify users? (Probably not, per error handling rule)

---

### 4. Mine Tracking

**4.1 Start Mine**
- Slash command: `/mine start`
- Modal fields:
  - Tier (number)
  - Gathering points (number)
  - Duration per point (number, in seconds or minutes?)
  - Start time (optional, defaults to "now")
- Validation:
  - Check if user has active mine (isActive: true)
  - If yes, reject: "You already have an active mine. Finish that one first."
- Calculate expirationTime: startTime + (gatheringPoints × durationPerPoint)
- Create MineEntry with isActive: true
- Response: "Mine started. I'll remind you when it's done. Don't forget."

**4.2 Mine Status**
- Slash command: `/mine status`
- Show current active mine details
- Display time remaining until expiration

**4.3 Mine Expiration**
- Scheduled job runs every 5 minutes
- Query: `MineEntry.findMany({ where: { expirationTime: { lte: new Date() }, isActive: true } })`
- For each expired mine:
  - Mark `isActive: false`
  - Send DM to user: "Your mine is done. Finally. Go collect your rewards."
  - If DM fails (user has DMs disabled), mention in channel where bot has access

---

### 5. Mine Reminders
- Background job runs every 5 minutes
- Query all mines where expirationTime <= now() AND isActive = true
- Send reminder message to user
- Mark mine as closed (isActive: false) for the week

## Project Structure
```
src/
  commands/        # Slash command handlers
  interactions/    # Button/modal handlers
    modals/        # Modal submission handlers
    buttons/        # Button click handlers
  services/        # Business logic (stats, war, mines)
  jobs/            # Scheduled jobs (mine checker, war reset)
  database/        # Prisma client, migrations
  utils/           # Helpers, validators, admin check
  types/           # TypeScript types
  config/          # Configuration (bot name, etc.)
```

## Implementation Order
1. ✅ Project initialization (package.json, tsconfig, Prisma setup)
2. ✅ Bot client setup with discord.js
3. ✅ Command handler infrastructure
4. ✅ **User Registration** (detailed above)
5. Stats Management
6. War Management
7. Mine Tracking
8. Reminder System

## Configuration
- Bot name: Environment variable `BOT_NAME` (default: "BigNickBot")
- Admin role: Environment variable `ADMIN_ROLE_ID` (Discord role ID)
- Database: SQLite file at `./data/bot.db` (configurable via `DATABASE_URL`)

## Error Handling Strategy
- **User-actionable errors**: Notify user with helpful message (e.g., "You're not registered")
- **System errors**: Log internally, respond with generic error (don't expose internals)
- **Silent failures**: Only for non-user-facing operations (e.g., background jobs that fail)
- **Validation errors**: Show specific validation message (e.g., "That's not a valid tier")

## Admin Authorization
- Check for Discord role membership (not Discord permission system)
- Helper function: `utils/isAdmin(member: GuildMember, adminRoleId: string): boolean`
- Admin role ID from environment variable

## Status
Ready for implementation - Registration step is fully detailed, stats has high-level detail, rest is scoped
