import { ButtonInteraction, GuildMember, EmbedBuilder } from "discord.js";
import { prisma as defaultPrisma } from "../../database/client.js";
import { isAdmin as defaultIsAdmin } from "../../utils/isAdmin.js";
import { responses } from "../../config/responses.js";
import { getRandomResponse } from "../../utils/responses.js";

export async function handleDeleteUserButton(
  interaction: ButtonInteraction,
  isAdmin: (member: GuildMember) => boolean = defaultIsAdmin,
  prisma: typeof defaultPrisma = defaultPrisma
) {
  // Check if member exists and has required properties (instead of instanceof check)
  // TypeScript sees roles as string[] | GuildMemberRoleManager, so we need to check for cache
  const memberRoles = interaction.member?.roles;
  if (!interaction.member || !memberRoles || !("cache" in memberRoles)) {
    await interaction.reply({
      content: getRandomResponse(responses.registration.serverOnlyError),
      ephemeral: true,
    });
    return;
  }

  // Type assertion for TypeScript - we've validated the member has the required structure
  const member = interaction.member as GuildMember;

  if (!isAdmin(member)) {
    await interaction.reply({
      content: getRandomResponse(responses.admin.deleteUser.permissionDenied),
      ephemeral: true,
    });
    return;
  }

  // Extract user ID from customId (format: "delete_user_<userId>")
  const userId = interaction.customId.replace("delete_user_", "");

  if (!userId) {
    await interaction.reply({
      content: getRandomResponse(responses.admin.deleteUser.error),
      ephemeral: true,
    });
    return;
  }

  try {
    // Check if user exists before attempting deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      await interaction.reply({
        content: getRandomResponse(responses.admin.deleteUser.notFound),
        ephemeral: true,
      });
      return;
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    // Update the original message to reflect deletion
    if (interaction.message.embeds && interaction.message.embeds.length > 0) {
      try {
        const originalEmbed = interaction.message.embeds[0];
        // Create updated embed by extracting data from original
        const embedData = (originalEmbed as any).data || originalEmbed;
        const currentDescription = embedData.description || "";
        const updatedDescription = currentDescription.replace(
          new RegExp(`\\*\\*${user.inGameName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*.*\n?`, "g"),
          ""
        ).trim();

        const updatedEmbed = new EmbedBuilder();
        if (embedData.title) updatedEmbed.setTitle(embedData.title);
        if (updatedDescription) updatedEmbed.setDescription(updatedDescription);
        if (embedData.color) updatedEmbed.setColor(embedData.color);

        // Remove the button for the deleted user and filter out empty rows
        const updatedComponents = (interaction.message.components || [])
          .map((row: any) => {
            const filteredComponents = (row.components || []).filter(
              (component: any) => component.customId !== interaction.customId
            );
            if (filteredComponents.length > 0) {
              return {
                type: row.type,
                components: filteredComponents,
              };
            }
            return null;
          })
          .filter((row: any): row is NonNullable<typeof row> => row !== null);

        await interaction.update({
          embeds: [updatedEmbed],
          components: updatedComponents.length > 0 ? updatedComponents : [],
        });
        return;
      } catch (updateError) {
        // If update fails, fall back to reply
        console.error("Error updating message:", updateError);
      }
    }

    // If no embed or update failed, just reply
    await interaction.reply({
      content: getRandomResponse(responses.admin.deleteUser.success, {
        inGameName: user.inGameName,
      }),
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    await interaction.reply({
      content: getRandomResponse(responses.admin.deleteUser.error),
      ephemeral: true,
    });
  }
}

