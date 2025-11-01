import { GuildMember } from "discord.js";
import { config } from "../config/index.js";

export const isAdmin = (member: GuildMember): boolean => {
  console.log("[isAdmin] Checking admin status for member:", member.id);
  console.log("[isAdmin] Admin role ID from config:", config.adminRoleId);
  
  if (!config.adminRoleId) {
    console.log("[isAdmin] No admin role ID configured, returning false");
    return false;
  }
  
  const hasRole = member.roles.cache.has(config.adminRoleId);
  console.log("[isAdmin] Member has admin role:", hasRole);
  console.log("[isAdmin] Member roles:", Array.from(member.roles.cache.keys()));
  
  return hasRole;
};

