import { Events, Interaction } from "discord.js";
import { Bot } from "../bot.js";
import { Command } from "../types/command.js";
import { handleRegisterModal } from "../interactions/modals/register.js";
import { responses } from "../config/responses.js";
import { getRandomResponse } from "../utils/responses.js";

export function setupInteractionHandlers(bot: Bot, commands: Command[]) {
  bot.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = commands.find(
        (cmd) => cmd.data.name === interaction.commandName
      );

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        const errorMessage = {
          content: getRandomResponse(responses.errors.commandExecution),
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      }
    } else if (interaction.isModalSubmit()) {
      try {
        if (interaction.customId === "register_modal") {
          await handleRegisterModal(interaction);
        }
      } catch (error) {
        console.error("Error handling modal submission:", error);
        const errorMessage = {
          content: getRandomResponse(responses.errors.modalSubmission),
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      }
    }
  });
}

