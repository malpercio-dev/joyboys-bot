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
    console.log("[commandLoader] Registering", commands.length, "slash commands with Discord");
    console.log("[commandLoader] Bot application ID:", bot.client.user?.id);
    console.log("[commandLoader] Commands to register:", commandsData.map(c => ({ name: c.name, description: c.description })));

    await rest.put(
      Routes.applicationCommands(bot.client.user!.id),
      { body: commandsData }
    );

    console.log("[commandLoader] Successfully registered slash commands with Discord");
  } catch (error) {
    console.error("[commandLoader] Error registering commands:", error);
    console.error("[commandLoader] Error details:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error("[commandLoader] Error stack:", error.stack);
    }
  }
}

export async function loadCommands(): Promise<Command[]> {
  const commands: Command[] = [];
  const commandsPath = join(__dirname, "../commands");
  console.log("[commandLoader] Loading commands from:", commandsPath);
  
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    (file.endsWith(".js") || file.endsWith(".ts")) &&
    !file.endsWith(".d.ts") &&
    !file.endsWith(".d.js") &&
    !file.endsWith(".test.ts") &&
    !file.endsWith(".test.js") &&
    !file.endsWith(".js.map")
  );

  console.log("[commandLoader] Found command files:", commandFiles);

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    console.log("[commandLoader] Loading command from:", filePath);
    try {
      const commandModule = await import(filePath);
      if ("default" in commandModule && commandModule.default) {
        const command = commandModule.default;
        console.log("[commandLoader] Loaded command:", command.data.name);
        commands.push(command);
      } else {
        console.warn("[commandLoader] File", file, "does not export a default command");
      }
    } catch (error) {
      console.error("[commandLoader] Error loading command from", filePath, ":", error);
    }
  }

  console.log("[commandLoader] Total commands loaded:", commands.length);
  console.log("[commandLoader] Command names:", commands.map(c => c.data.name));
  return commands;
}

