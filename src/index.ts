import { Bot } from "./bot.js";

const bot = new Bot();

bot.start().catch((error) => {
  console.error("Failed to start bot:", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await bot.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await bot.stop();
  process.exit(0);
});

