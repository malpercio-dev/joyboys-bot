# Deployment and Running Plan

## Overview
Get BigNickBot running in staging/test environment first, then deploy to production once validated. Focus on getting the registration feature working end-to-end.

## Prerequisites Checklist

### Discord Setup
- [x] Bot application created in Discord Developer Portal
- [ ] Bot token obtained
- [x] Bot invited to staging/test server
- [ ] Bot invited to production server
- [ ] Admin role created/identified in both servers
- [ ] Admin role IDs copied

### Environment Setup
- [ ] Node.js 22+ available (or Nix shell configured)
- [ ] `.env` file created with required variables
- [ ] Database directory (`data/`) created and writable

## Quick Start: Staging/Test Deployment

### Step 1: Initial Setup

```bash
# Clone/ensure project is ready
cd joyboys-bot

# Install dependencies
nix shell nixpkgs#nodejs_22 --command npm install

# Generate Prisma client
nix shell nixpkgs#nodejs_22 --command npm run db:generate

# Create database directory
mkdir -p data

# Create .env file
cat > .env << EOF
DATABASE_URL="file:./data/bot.db"
BOT_TOKEN=your_staging_bot_token_here
BOT_NAME=BigNickBot
ADMIN_ROLE_ID=your_staging_admin_role_id_here
EOF
```

### Step 2: Run Database Migration

```bash
nix shell nixpkgs#nodejs_22 --command npm run db:migrate
```

This creates the SQLite database and initial schema.

### Step 3: Test Bot Locally (One-Time Verification)

```bash
# Build the project
nix shell nixpkgs#nodejs_22 --command npm run build

# Run the bot
nix shell nixpkgs#nodejs_22 --command npm start
```

Expected output:
- Bot logs in successfully
- "BigNickBot is ready!" message
- Commands register with Discord

**Test registration:**
1. In Discord, use `/register` command
2. Fill out modal with test in-game name
3. Verify bot responds with welcome message
4. Check database: `nix shell nixpkgs#nodejs_22 --command npm run db:studio` to see user record

### Step 4: Deploy to Staging Server

**Option A: Simple Process Manager (PM2)**
```bash
# Install PM2 globally (or use npx)
npm install -g pm2

# Start bot with PM2
pm2 start npm --name "bignickbot-staging" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot (if desired)
pm2 startup
```

**Option B: Systemd Service**
Create `/etc/systemd/system/bignickbot-staging.service`:
```ini
[Unit]
Description=BigNickBot Staging
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/joyboys-bot
ExecStart=/path/to/node dist/index.js
Environment="NODE_ENV=production"
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable bignickbot-staging
sudo systemctl start bignickbot-staging
```

**Option C: Docker (if preferred)**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY prisma ./prisma
COPY data ./data
RUN npx prisma generate
CMD ["node", "dist/index.js"]
```

### Step 5: Verify Staging Deployment

1. Bot should appear online in Discord
2. Test `/register` command works
3. Verify database persists data (restart bot, check data persists)
4. Check logs for errors

## Production Deployment

### Pre-Production Checklist
- [x] Staging tested and working
- [ ] Database backup strategy in place
- [ ] Production `.env` configured with production values
- [ ] Production admin role ID configured
- [ ] Bot invited to production server

### Deployment Steps

1. **Prepare Production Environment**
   ```bash
   # Create production directory
   mkdir -p /opt/bignickbot-prod
   cd /opt/bignickbot-prod
   
   # Clone repo (or copy files)
   git clone <repo-url> .
   # OR copy staging directory if preferred
   
   # Install dependencies
   npm install
   
   # Create production .env
   # (Use production bot token and admin role ID)
   ```

2. **Build and Migrate**
   ```bash
   npm run build
   npm run db:generate
   npm run db:migrate
   ```

3. **Start Production Bot**
   - Use same method as staging (PM2, systemd, Docker)
   - Name it `bignickbot-prod` to distinguish from staging

4. **Monitor and Verify**
   - Check bot appears online
   - Test `/register` works
   - Monitor logs for errors
   - Verify database persists correctly

## Running Commands Reference

### Development
```bash
# Run in development mode (with hot reload)
nix shell nixpkgs#nodejs_22 --command npm run dev
```

### Production
```bash
# Build first
npm run build

# Then run
npm start
```

### Database Management
```bash
# Generate Prisma client (after schema changes)
npm run db:generate

# Run migrations
npm run db:migrate

# Open database GUI
npm run db:studio
```

### Process Management (PM2)
```bash
# Start
pm2 start npm --name "bignickbot" -- start

# Stop
pm2 stop bignickbot

# Restart
pm2 restart bignickbot

# View logs
pm2 logs bignickbot

# Monitor
pm2 monit

# Delete
pm2 delete bignickbot
```

## Updates and Maintenance

### Updating the Bot

1. **Pull latest code**
   ```bash
   git pull origin main
   ```

2. **Install dependencies (if changed)**
   ```bash
   npm install
   ```

3. **Generate Prisma client (if schema changed)**
   ```bash
   npm run db:generate
   ```

4. **Run migrations (if schema changed)**
   ```bash
   npm run db:migrate
   ```

5. **Rebuild**
   ```bash
   npm run build
   ```

6. **Restart bot**
   ```bash
   pm2 restart bignickbot-prod
   # OR
   sudo systemctl restart bignickbot-prod
   ```

### Database Backups

**Manual Backup:**
```bash
# SQLite database is just a file
cp data/bot.db data/bot.db.backup.$(date +%Y%m%d)
```

**Automated Backup Script:**
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
mkdir -p $BACKUP_DIR
cp data/bot.db "$BACKUP_DIR/bot.db.$(date +%Y%m%d_%H%M%S)"
# Keep last 7 days
find $BACKUP_DIR -name "bot.db.*" -mtime +7 -delete
```

Add to crontab: `0 2 * * * /path/to/backup-script.sh`

## Environment Variables

### Required
- `BOT_TOKEN`: Discord bot token
- `ADMIN_ROLE_ID`: Discord role ID for admin commands

### Optional
- `BOT_NAME`: Bot name (defaults to "BigNickBot")
- `DATABASE_URL`: Database connection string (defaults to "file:./data/bot.db")

## Monitoring and Logging

### Log Locations
- Console output (if running directly)
- PM2 logs: `pm2 logs bignickbot`
- Systemd logs: `journalctl -u bignickbot-prod -f`

### What to Monitor
- Bot online status
- Error messages in logs
- Database file size (growing = working)
- Memory usage (should be stable)

### Health Checks
- Bot responds to `/register` command
- Database file exists and is writable
- No recurring errors in logs

## Troubleshooting

### Bot Won't Start
1. Check `BOT_TOKEN` is correct
2. Verify bot has necessary permissions in Discord
3. Check database directory exists and is writable
4. Check logs for specific error messages

### Bot Starts But Commands Don't Work
1. Verify bot is online (green status in Discord)
2. Check bot has "Use Slash Commands" permission
3. Wait a few minutes for commands to register
4. Try re-registering commands (restart bot)

### Database Errors
1. Verify `DATABASE_URL` points to correct location
2. Check database file permissions
3. Ensure migrations have run: `npm run db:migrate`
4. Check Prisma client is generated: `npm run db:generate`

## Next Steps After MVP

Once registration is working in production:
1. Monitor usage and gather feedback
2. Continue with stats management feature
3. Add Species War management
4. Add mine tracking

## Deployment Timeline Estimate

- **Staging Setup**: 15-30 minutes
- **Production Deployment**: 15-30 minutes
- **Testing and Verification**: 30 minutes
- **Total**: ~1-2 hours to get running

## Status
Ready for deployment - MVP (registration) is complete and tested

