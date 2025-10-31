-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inGameName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "power" INTEGER,
    "leadership" INTEGER,
    "minionSimPower" INTEGER,
    "simulationFloor" INTEGER,
    "minionTier" TEXT,
    "speciesWarRole" TEXT,
    "silverBadgesAccum" INTEGER NOT NULL DEFAULT 0,
    "silverBadgesUsed" INTEGER NOT NULL DEFAULT 0,
    "goldBadgesAccum" INTEGER NOT NULL DEFAULT 0,
    "goldBadgesUsed" INTEGER NOT NULL DEFAULT 0,
    "drillsInventoried" INTEGER NOT NULL DEFAULT 0,
    "drillsUsed" INTEGER NOT NULL DEFAULT 0,
    "lastWarWeekReset" DATETIME
);

-- CreateTable
CREATE TABLE "StatsHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "power" INTEGER,
    "leadership" INTEGER,
    "minionSimPower" INTEGER,
    "simulationFloor" INTEGER,
    "minionTier" TEXT,
    CONSTRAINT "StatsHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MineEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "gatheringPoints" INTEGER NOT NULL,
    "durationPerPoint" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirationTime" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "MineEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StatsHistory_userId_timestamp_idx" ON "StatsHistory"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "MineEntry_userId_isActive_idx" ON "MineEntry"("userId", "isActive");

-- CreateIndex
CREATE INDEX "MineEntry_expirationTime_idx" ON "MineEntry"("expirationTime");
