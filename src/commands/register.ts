import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, GuildMember } from "discord.js";
import { Command } from "../types/command.js";
import { isMemberOrAdmin } from "../utils/isMemberOrAdmin.js";
import { responses } from "../config/responses.js";
import { getRandomResponse } from "../utils/responses.js";

const data = new SlashCommandBuilder()
  .setName("register")
  .setDescription(responses.registration.commandDescription);

async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.member || !(interaction.member instanceof GuildMember)) {
    await interaction.reply({
      content: getRandomResponse(responses.registration.serverOnlyError),
      ephemeral: true,
    });
    return;
  }

  if (!isMemberOrAdmin(interaction.member)) {
    await interaction.reply({
      content: getRandomResponse(responses.registration.permissionError),
      ephemeral: true,
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId("register_modal")
    .setTitle(responses.registration.modalTitle);

  const inGameNameInput = new TextInputBuilder()
    .setCustomId("in_game_name")
    .setLabel("In-Game Name")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(responses.registration.modalPlaceholder)
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

