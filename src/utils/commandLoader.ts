import { REST, Routes } from "discord.js";
import { config } from "../config/index.js";
import { Bot } from "../bot.js";
import { Command } from "../types/command.js";
import { readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function registerCommands(bot: Bot, commands: Command[]) {
  const rest = new REST().setToken(config.botToken);

  const commandsData = commands.map((command) => command.data.toJSON());

  try {
    console.log("Registering slash commands...", commandsData);

    await rest.put(
      Routes.applicationCommands(bot.client.user!.id),
      { body: commandsData }
    );

    console.log("Successfully registered slash commands.");
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}

export async function loadCommands(): Promise<Command[]> {
  const commands: Command[] = [];
  const commandsPath = join(__dirname, "../commands");
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    (file.endsWith(".js") || file.endsWith(".ts")) &&
    !file.endsWith(".d.ts") &&
    !file.endsWith(".d.js") &&
    !file.endsWith(".test.ts") &&
    !file.endsWith(".test.js") &&
    !file.endsWith(".js.map")
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const commandModule = await import(filePath);
    if ("default" in commandModule && commandModule.default) {
      commands.push(commandModule.default);
    }
  }

  return commands;
}

