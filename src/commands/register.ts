import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import { Command } from "../types/command.js";

const data = new SlashCommandBuilder()
  .setName("register")
  .setDescription("Register your snail with BigNickBot");

async function execute(interaction: ChatInputCommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("register_modal")
    .setTitle("Register with BigNickBot");

  const inGameNameInput = new TextInputBuilder()
    .setCustomId("in_game_name")
    .setLabel("In-Game Name")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Your in-game name")
    .setRequired(true)
    .setMaxLength(100);

  const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(inGameNameInput);
  modal.addComponents(actionRow);

  await interaction.showModal(modal);
}

const register: Command = {
  data,
  execute,
};

export default register;

