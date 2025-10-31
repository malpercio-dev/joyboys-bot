import { GuildMember } from "discord.js";
import { config } from "../config/index.js";
import { isAdmin } from "./isAdmin.js";

export const isMemberOrAdmin = (member: GuildMember): boolean => {
  // Admin role grants access
  if (isAdmin(member)) {
    return true;
  }

  // Check member role
  if (!config.memberRoleId) {
    return false;
  }

  return member.roles.cache.has(config.memberRoleId);
};

