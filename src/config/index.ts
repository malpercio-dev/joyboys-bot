export const config = {
  botName: process.env.BOT_NAME || "BigNickBot",
  botToken: process.env.BOT_TOKEN || "",
  adminRoleId: process.env.ADMIN_ROLE_ID || "",
  memberRoleId: process.env.MEMBER_ROLE_ID || "",
  databaseUrl: process.env.DATABASE_URL || "file:./data/bot.db",
};

if (!config.botToken) {
  throw new Error("BOT_TOKEN environment variable is required");
}

