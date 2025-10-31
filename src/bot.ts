import { Client, GatewayIntentBits, Collection } from "discord.js";
import { config } from "./config/index.js";
import { prisma } from "./database/client.js";
import { loadCommands, registerCommands } from "./utils/commandLoader.js";
import { setupInteractionHandlers } from "./utils/interactionHandler.js";
import { Command } from "./types/command.js";

export class Bot {
  public client: Client;
  public commands: Collection<string, Command>;
  private loadedCommands: Command[] = [];

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.commands = new Collection();
  }

  async start() {
    this.loadedCommands = await loadCommands();
    this.loadedCommands.forEach((cmd) => {
      this.commands.set(cmd.data.name, cmd);
    });

    this.client.once("ready", async () => {
      console.log(`${config.botName} is ready!`);
      await registerCommands(this, this.loadedCommands);
      setupInteractionHandlers(this, this.loadedCommands);
    });

    await this.client.login(config.botToken);
  }

  async stop() {
    await this.client.destroy();
    await prisma.$disconnect();
  }
}

