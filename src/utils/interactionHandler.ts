import { Events, Interaction } from "discord.js";
import { Bot } from "../bot.js";
import { Command } from "../types/command.js";
import { handleRegisterModal } from "../interactions/modals/register.js";
import { handleDeleteUserButton } from "../interactions/buttons/delete-user.js";
import { responses } from "../config/responses.js";
import { getRandomResponse } from "../utils/responses.js";

export function setupInteractionHandlers(bot: Bot, commands: Command[]) {
  bot.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      console.log("[interactionHandler] Chat input command received:", interaction.commandName);
      console.log("[interactionHandler] Available commands:", commands.map(c => c.data.name));
      
      const command = commands.find(
        (cmd) => cmd.data.name === interaction.commandName
      );

      if (!command) {
        console.error(`[interactionHandler] No command matching ${interaction.commandName} was found.`);
        console.error(`[interactionHandler] Available command names:`, commands.map(c => c.data.name));
        return;
      }

      console.log(`[interactionHandler] Found command, executing: ${interaction.commandName}`);
      try {
        await command.execute(interaction);
        console.log(`[interactionHandler] Command ${interaction.commandName} executed successfully`);
      } catch (error) {
        console.error(`[interactionHandler] Error executing ${interaction.commandName}:`, error);
        console.error(`[interactionHandler] Error stack:`, error instanceof Error ? error.stack : "No stack");
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
    } else if (interaction.isButton()) {
      try {
        if (interaction.customId.startsWith("delete_user_")) {
          await handleDeleteUserButton(interaction);
        }
      } catch (error) {
        console.error("Error handling button interaction:", error);
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
    }
  });
}

