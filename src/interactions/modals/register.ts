import { ModalSubmitInteraction } from "discord.js";
import { prisma } from "../database/client.js";
import { EmbedBuilder } from "discord.js";

export async function handleRegisterModal(interaction: ModalSubmitInteraction) {
  if (interaction.customId !== "register_modal") {
    return;
  }

  const inGameName = interaction.fields.getTextInputValue("in_game_name").trim();

  // Validation
  if (!inGameName || inGameName.length === 0) {
    await interaction.reply({
      content: "Nice try, but that name doesn't work. Try again when you've got your act together.",
      ephemeral: true,
    });
    return;
  }

  if (inGameName.length > 100) {
    await interaction.reply({
      content: "That name is too long. Keep it under 100 characters, will you?",
      ephemeral: true,
    });
    return;
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: interaction.user.id },
    });

    const user = await prisma.user.upsert({
      where: { id: interaction.user.id },
      update: { inGameName },
      create: {
        id: interaction.user.id,
        inGameName,
      },
    });

    const embed = new EmbedBuilder()
      .setTitle(existingUser ? "Name Updated" : "Welcome!")
      .setDescription(
        existingUser
          ? `Changed your mind about your name, did you? Fine, you're now ${inGameName}. Don't make me update this again.`
          : `Well, well, look who decided to join us. Welcome, ${inGameName}. Try not to mess this up.`
      )
      .setColor(existingUser ? 0xffa500 : 0x00ff00);

    await interaction.reply({
      embeds: [embed],
      ephemeral: false,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    await interaction.reply({
      content: "Something went wrong. Try again later.",
      ephemeral: true,
    });
  }
}

