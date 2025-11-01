import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import { Command } from "../types/command.js";
import { responses } from "../config/responses.js";
import { getRandomResponse } from "../utils/responses.js";
import { canAccessCommand } from "../utils/canAccessCommand.js";
import { Bot } from "../bot.js";

const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription(responses.help.commandDescription);

async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.member || !(interaction.member instanceof GuildMember)) {
    await interaction.reply({
      content: getRandomResponse(responses.registration.serverOnlyError),
      ephemeral: true,
    });
    return;
  }

  const bot = (interaction.client as any).bot as Bot;
  if (!bot || !bot.loadedCommands) {
    await interaction.reply({
      content: getRandomResponse(responses.help.noCommands),
      ephemeral: true,
    });
    return;
  }

  const commands = bot.loadedCommands;
  if (commands.length === 0) {
    await interaction.reply({
      content: getRandomResponse(responses.help.noCommands),
      ephemeral: true,
    });
    return;
  }

  const descriptionLines: string[] = [];
  
  for (const command of commands) {
    const commandName = `\`/${command.data.name}\``;
    const commandDesc = command.data.description;
    
    const permission = command.metadata?.permission || "public";
    const hasAccess = canAccessCommand(interaction.member, permission);
    const accessIndicator = hasAccess ? "✅" : "❌";
    
    descriptionLines.push(`${accessIndicator} ${commandName} - ${commandDesc}`);
  }

  const embed = new EmbedBuilder()
    .setTitle(responses.help.title)
    .setDescription(descriptionLines.join("\n"))
    .setColor(0x3498db)
    .setFooter({
      text: "✅ = You can use, ❌ = You don't have permission",
    });

  await interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}

const help: Command = {
  data,
  execute,
  metadata: {
    permission: "public",
  },
};

export default help;

