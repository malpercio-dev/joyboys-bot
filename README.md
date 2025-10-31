# BigNickBot

Discord bot for Super Snail club management. Manages user registration, snail stats tracking, Species War assignments, and mine expiration reminders.

## Features

- **User Registration**: Register Discord users with their in-game names
- **Stats Tracking**: Track and update snail stats (Power, Leadership, Minion Simulation Power, Simulation Floor, Minion Tier)
- **Stats History**: Historical tracking for growth graphs
- **Species War Management**: Admin-assigned roles (Vanguard, Prospector, Laborer) with resource tracking
- **Mine Tracking**: Track active mines with expiration reminders

## Prerequisites

- Node.js 22+ (or use Nix: `nix shell nixpkgs#nodejs_22`)
- Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))
- Discord Server with admin role configured

## Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

Or with Nix:
```bash
nix shell nixpkgs#nodejs_22 --command npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root (you can copy from `.env.example` if it exists):

```env
DATABASE_URL="file:./data/bot.db"
BOT_TOKEN=your_discord_bot_token_here
BOT_NAME=BigNickBot
ADMIN_ROLE_ID=your_admin_role_id_here
```

**Getting your Discord Bot Token:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to "Bot" section
4. Click "Reset Token" or copy existing token
5. Paste token into `BOT_TOKEN` in `.env`

**Getting your Admin Role ID:**
1. In Discord, enable Developer Mode (User Settings → Advanced → Developer Mode)
2. Right-click on the admin role you want to use
3. Click "Copy ID"
4. Paste ID into `ADMIN_ROLE_ID` in `.env`

### 3. Database Setup

Generate Prisma client:
```bash
npm run db:generate
```

Or with Nix:
```bash
nix shell nixpkgs#nodejs_22 --command npm run db:generate
```

Run database migrations:
```bash
npm run db:migrate
```

Or with Nix:
```bash
nix shell nixpkgs#nodejs_22 --command npm run db:migrate
```

This will create the SQLite database file at `./data/bot.db`.

### 4. Discord Bot Setup

1. **Create Bot Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create new application
   - Note the Application ID

2. **Configure Bot Permissions**
   - Go to "Bot" section
   - Enable required intents:
     - ✅ Server Members Intent (if needed)
     - ✅ Message Content Intent
   - Under "Privileged Gateway Intents", enable:
     - ✅ Message Content Intent

3. **Invite Bot to Server**
   - Go to "OAuth2" → "URL Generator"
   - Select scopes:
     - ✅ `bot`
     - ✅ `applications.commands`
   - Select bot permissions:
     - ✅ Send Messages
     - ✅ Embed Links
     - ✅ Use Slash Commands
     - ✅ Read Message History
   - Copy the generated URL and open it in your browser
   - Select your server and authorize

4. **Set Up Admin Role**
   - Create or identify an admin role in your Discord server
   - Copy the role ID (see "Getting your Admin Role ID" above)
   - Add it to `.env` as `ADMIN_ROLE_ID`

## Running the Bot

### Development Mode (with hot reload)

```bash
npm run dev
```

Or with Nix:
```bash
nix shell nixpkgs#nodejs_22 --command npm run dev
```

### Production Mode

Build the project:
```bash
npm run build
```

Run the bot:
```bash
npm start
```

Or with Nix:
```bash
nix shell nixpkgs#nodejs_22 --command npm start
```

## Development Commands

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Build TypeScript
npm run build

# Run in development mode
npm run dev
```

## Project Structure

```
joyboys-bot/
├── src/
│   ├── commands/           # Slash command handlers
│   ├── interactions/        # Button/modal handlers
│   │   ├── modals/         # Modal submission handlers
│   │   └── buttons/        # Button click handlers
│   ├── services/           # Business logic
│   ├── jobs/              # Scheduled jobs (cron)
│   ├── database/          # Prisma client
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript types
│   ├── config/            # Configuration
│   ├── bot.ts             # Bot class
│   └── index.ts           # Entry point
├── prisma/
│   └── schema.prisma      # Database schema
├── docs/
│   ├── decisions/         # Technical decisions
│   ├── plans/            # Implementation plans
│   └── journal/          # Development notes
└── data/                  # Database files (gitignored)
```

## Testing

Tests are written with Vitest. Run tests with:

```bash
npm test
```

Tests follow TDD principles - write tests first, then implement functionality.

## Database Schema

The bot uses SQLite with Prisma ORM. Key models:

- **User**: Discord users with in-game names, stats, and war assignments
- **StatsHistory**: Historical snapshots of user stats for growth tracking
- **MineEntry**: Active mine tracking with expiration times

See `prisma/schema.prisma` for full schema definition.

## Bot Commands

### `/register`
Register your snail with BigNickBot. Opens a modal to enter your in-game name.

## Troubleshooting

### Bot doesn't respond to commands
- Ensure bot is online (check console for "ready" message)
- Verify bot has necessary permissions in the server
- Check that commands are registered (may take a few minutes after bot starts)

### Database errors
- Ensure `npm run db:migrate` has been run
- Check that `data/` directory exists and is writable
- Verify `DATABASE_URL` in `.env` is correct

### Bot token errors
- Verify `BOT_TOKEN` in `.env` is correct
- Ensure token hasn't been reset in Discord Developer Portal
- Check token has necessary permissions

## Development Notes

- Bot name is configurable via `BOT_NAME` environment variable (defaults to "BigNickBot")
- Bot uses an irreverent, sarcastic tone - see implementation plan for details
- Admin commands use Discord role-based authorization (not Discord permissions)
- Error handling: only notify users if they can take action, otherwise silent

## Contributing

See `AGENTS.md` for development rules and guidelines.

## License

ISC

