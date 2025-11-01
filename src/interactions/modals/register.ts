import { ModalSubmitInteraction, GuildMember } from "discord.js";
import { prisma } from "../../database/client.js";
import { EmbedBuilder } from "discord.js";
import { isMemberOrAdmin } from "../../utils/isMemberOrAdmin.js";
import { responses } from "../../config/responses.js";
import { getRandomResponse } from "../../utils/responses.js";

export async function handleRegisterModal(interaction: ModalSubmitInteraction) {
  if (interaction.customId !== "register_modal") {
    return;
  }

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

  const inGameName = interaction.fields.getTextInputValue("in_game_name").trim();

  // Validation
  if (!inGameName || inGameName.length === 0) {
    await interaction.reply({
      content: getRandomResponse(responses.registration.validation.emptyName),
      ephemeral: true,
    });
    return;
  }

  if (inGameName.length > 100) {
    await interaction.reply({
      content: getRandomResponse(responses.registration.validation.nameTooLong),
      ephemeral: true,
    });
    return;
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: interaction.user.id },
    });

    await prisma.user.upsert({
      where: { id: interaction.user.id },
      update: { inGameName },
      create: {
        id: interaction.user.id,
        inGameName,
      },
    });

    const embed = new EmbedBuilder()
      .setTitle(
        existingUser
          ? responses.registration.success.reRegistration.title
          : responses.registration.success.firstTime.title
      )
      .setDescription(
        existingUser
          ? getRandomResponse(responses.registration.success.reRegistration.description, {
              inGameName,
            })
          : getRandomResponse(responses.registration.success.firstTime.description, {
              inGameName,
            })
      )
      .setColor(existingUser ? 0xffa500 : 0x00ff00);

    await interaction.reply({
      embeds: [embed],
      ephemeral: false,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    await interaction.reply({
      content: getRandomResponse(responses.registration.genericError),
      ephemeral: true,
    });
  }
}

