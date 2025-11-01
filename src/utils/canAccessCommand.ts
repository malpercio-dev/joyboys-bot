import { GuildMember } from "discord.js";
import { isAdmin } from "./isAdmin.js";
import { isMemberOrAdmin } from "./isMemberOrAdmin.js";
import { PermissionType } from "../types/command.js";

export const canAccessCommand = (member: GuildMember, permission: PermissionType): boolean => {
  switch (permission) {
    case "admin":
      return isAdmin(member);
    case "member":
      return isMemberOrAdmin(member);
    case "public":
      return true;
    default:
      return false;
  }
};

