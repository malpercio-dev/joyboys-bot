import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, GuildMember } from "discord.js";
import { Command } from "../types/command.js";
import { isMemberOrAdmin } from "../utils/isMemberOrAdmin.js";

const data = new SlashCommandBuilder()
  .setName("register")
  .setDescription("Register your snail with BigNickBot");

async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.member || !(interaction.member instanceof GuildMember)) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
    return;
  }

  if (!isMemberOrAdmin(interaction.member)) {
    await interaction.reply({
      content: "You don't have permission to use this command. You need the member or admin role.",
      ephemeral: true,
    });
    return;
  }

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

