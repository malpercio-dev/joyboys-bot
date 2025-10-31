import { GuildMember } from "discord.js";
import { config } from "../config/index.js";

export const isAdmin = (member: GuildMember): boolean => {
  if (!config.adminRoleId) {
    return false;
  }
  return member.roles.cache.has(config.adminRoleId);
};

