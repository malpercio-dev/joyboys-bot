import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../types/command.js";
import { isAdmin } from "../utils/isAdmin.js";
import { responses } from "../config/responses.js";
import { getRandomResponse } from "../utils/responses.js";
import { prisma } from "../database/client.js";

const data = new SlashCommandBuilder()
  .setName("list-users")
  .setDescription(responses.admin.listUsers.commandDescription);

async function execute(interaction: ChatInputCommandInteraction) {
  console.log("[list-users] Command received");
  console.log("[list-users] User ID:", interaction.user.id);
  console.log("[list-users] Guild ID:", interaction.guildId);
  
  if (!interaction.member || !(interaction.member instanceof GuildMember)) {
    console.log("[list-users] Failed: Not in a server or member check failed");
    await interaction.reply({
      content: getRandomResponse(responses.registration.serverOnlyError),
      ephemeral: true,
    });
    return;
  }

  console.log("[list-users] Member check passed");
  console.log("[list-users] Member ID:", interaction.member.id);
  
  const adminCheck = isAdmin(interaction.member);
  console.log("[list-users] Admin check result:", adminCheck);
  
  if (!adminCheck) {
    console.log("[list-users] Failed: User is not admin");
    await interaction.reply({
      content: getRandomResponse(responses.admin.listUsers.permissionDenied),
      ephemeral: true,
    });
    return;
  }

  if (!interaction.guild) {
    console.log("[list-users] Failed: No guild in interaction");
    await interaction.reply({
      content: getRandomResponse(responses.registration.serverOnlyError),
      ephemeral: true,
    });
    return;
  }

  const guild = interaction.guild; // Store for use in async callbacks
  console.log("[list-users] All checks passed, fetching users from database");
  
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        inGameName: "asc",
      },
    });

    console.log("[list-users] Found", users.length, "users in database");

    if (users.length === 0) {
      console.log("[list-users] No users found, sending no-users message");
      await interaction.reply({
        content: getRandomResponse(responses.admin.listUsers.noUsers),
        ephemeral: true,
      });
      return;
    }

    console.log("[list-users] Fetching Discord member info for", users.length, "registered users");
    // Fetch only the specific Discord members we need (registered users)
    // Check cache first, then fetch missing ones in parallel
    const memberMap = new Map<string, GuildMember | null>();
    
    // Separate cached and uncached members
    const uncachedUserIds: string[] = [];
    for (const user of users) {
      const cachedMember = guild.members.cache.get(user.id);
      if (cachedMember) {
        console.log("[list-users] Found", user.inGameName, "in cache");
        memberMap.set(user.id, cachedMember);
      } else {
        uncachedUserIds.push(user.id);
      }
    }
    
    // Fetch uncached members in parallel
    if (uncachedUserIds.length > 0) {
      console.log("[list-users] Fetching", uncachedUserIds.length, "uncached members from Discord");
      const fetchPromises = uncachedUserIds.map(async (userId) => {
        try {
          const member = await guild.members.fetch(userId);
          return { userId, member };
        } catch (fetchError) {
          console.log("[list-users] Could not fetch member", userId, ":", fetchError instanceof Error ? fetchError.message : String(fetchError));
          return { userId, member: null };
        }
      });
      
      const fetchResults = await Promise.all(fetchPromises);
      for (const { userId, member } of fetchResults) {
        memberMap.set(userId, member);
      }
    }
    
    console.log("[list-users] Fetched member info for", memberMap.size, "users");
    
    // Build embed description
    console.log("[list-users] Building embed description");
    const descriptionLines: string[] = [];
    for (const user of users) {
      const discordMember = memberMap.get(user.id);
      const discordName = discordMember?.displayName || discordMember?.user.username || "Unknown";
      descriptionLines.push(`**${user.inGameName}** (${discordName})`);
    }

    console.log("[list-users] Created", descriptionLines.length, "description lines");

    const embed = new EmbedBuilder()
      .setTitle(responses.admin.listUsers.title)
      .setDescription(descriptionLines.join("\n"))
      .setColor(0x3498db);

    // Create buttons for each user (max 25 buttons due to Discord limits)
    console.log("[list-users] Creating buttons");
    const buttonRows: ActionRowBuilder<ButtonBuilder>[] = [];
    const maxButtons = 25; // Discord limit
    
    for (let i = 0; i < Math.min(users.length, maxButtons); i++) {
      const user = users[i];
      const rowIndex = Math.floor(i / 5); // 5 buttons per row
      
      if (!buttonRows[rowIndex]) {
        buttonRows[rowIndex] = new ActionRowBuilder<ButtonBuilder>();
      }
      
      const button = new ButtonBuilder()
        .setCustomId(`delete_user_${user.id}`)
        .setLabel(`Delete ${user.inGameName}`)
        .setStyle(ButtonStyle.Danger);
      
      buttonRows[rowIndex].addComponents(button);
    }

    console.log("[list-users] Created", buttonRows.length, "button rows");

    // If we have more than 25 users, add a note
    if (users.length > maxButtons) {
      embed.setFooter({
        text: `Showing first ${maxButtons} of ${users.length} users`,
      });
    }

    console.log("[list-users] Sending reply with embed and buttons");
    await interaction.reply({
      embeds: [embed],
      components: buttonRows,
      ephemeral: true,
    });
    console.log("[list-users] Reply sent successfully");
  } catch (error) {
    console.error("[list-users] Error listing users:", error);
    console.error("[list-users] Error stack:", error instanceof Error ? error.stack : "No stack");
    await interaction.reply({
      content: getRandomResponse(responses.errors.commandExecution),
      ephemeral: true,
    });
  }
}

const listUsers: Command = {
  data,
  execute,
  metadata: {
    permission: "admin",
  },
};

export default listUsers;

