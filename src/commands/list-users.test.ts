import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "../database/client.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { GuildMember } from "discord.js";
import { isAdmin } from "../utils/isAdmin.js";

// Mock Prisma
vi.mock("../database/client.js", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

// Mock isAdmin
vi.mock("../utils/isAdmin.js", () => ({
  isAdmin: vi.fn(),
}));

// Mock responses
vi.mock("../config/responses.js", () => ({
  responses: {
    admin: {
      listUsers: {
        commandDescription: "List all registered users (admin only)",
        noUsers: {
          responses: ["No one's registered yet. Impressive."],
        },
        title: "Registered Users",
        permissionDenied: {
          responses: ["You don't have permission to use this command."],
        },
      },
      deleteUser: {
        success: {
          responses: ["User deleted. They're gone now."],
        },
        error: {
          responses: ["Failed to delete user."],
        },
        confirmButtonLabel: "Delete",
      },
    },
  },
}));

// Import after mocks
import listUsers from "./list-users.js";
import { responses } from "../config/responses.js";
import { getRandomResponse } from "../utils/responses.js";

const execute = listUsers.execute;

describe("list-users command", () => {
  let mockInteraction: Partial<ChatInputCommandInteraction>;
  let mockMember: GuildMember;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMember = Object.create(GuildMember.prototype) as GuildMember;
    Object.defineProperty(mockMember, "id", {
      value: "123456789",
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockMember, "roles", {
      value: {
        cache: {
          has: vi.fn(),
        },
      },
      writable: true,
      configurable: true,
    });

    mockInteraction = {
      member: mockMember,
      reply: vi.fn(),
      user: {
        id: "123456789",
      },
      guild: {
        members: {
          cache: {
            get: vi.fn(),
          },
          fetch: vi.fn(),
        },
      },
      guildId: "guild123",
    };

    (isAdmin as any).mockReturnValue(true);
  });

  it("should reject non-admin users", async () => {
    (isAdmin as any).mockReturnValue(false);

    await execute(mockInteraction as ChatInputCommandInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        ephemeral: true,
      })
    );
    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(responses.admin.listUsers.permissionDenied.responses).toContain(replyCall.content);
  });

  it("should show message when no users are registered", async () => {
    (prisma.user.findMany as any).mockResolvedValue([]);

    await execute(mockInteraction as ChatInputCommandInteraction);

    expect(mockInteraction.reply).toHaveBeenCalled();
    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(replyCall.ephemeral).toBe(true);
    expect(responses.admin.listUsers.noUsers.responses).toContain(replyCall.content);
  });

  it("should list users with delete buttons", async () => {
    const mockUsers = [
      { id: "111", inGameName: "User1" },
      { id: "222", inGameName: "User2" },
    ];
    (prisma.user.findMany as any).mockResolvedValue(mockUsers);
    
    // Mock cache returning undefined (members not cached)
    (mockInteraction.guild!.members.cache.get as any).mockReturnValue(undefined);
    
    // Mock individual member fetches
    const mockMember1 = {
      displayName: "DiscordUser1",
      user: { username: "user1" },
    };
    const mockMember2 = {
      displayName: "DiscordUser2",
      user: { username: "user2" },
    };
    
    (mockInteraction.guild!.members.fetch as any)
      .mockResolvedValueOnce(mockMember1)
      .mockResolvedValueOnce(mockMember2);

    await execute(mockInteraction as ChatInputCommandInteraction);

    expect(mockInteraction.reply).toHaveBeenCalled();
    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(replyCall.embeds).toBeDefined();
    expect(replyCall.embeds.length).toBe(1);
    expect(replyCall.components).toBeDefined();
    
    // Check embed contains user info
    const embed = replyCall.embeds[0];
    const embedData = embed.data || embed.toJSON();
    expect(embedData.title).toBe(responses.admin.listUsers.title);
    
    // Check buttons exist
    expect(replyCall.components.length).toBeGreaterThan(0);
    
    // Verify individual member fetches were called
    expect(mockInteraction.guild!.members.fetch).toHaveBeenCalledWith("111");
    expect(mockInteraction.guild!.members.fetch).toHaveBeenCalledWith("222");
  });

  it("should handle missing Discord members gracefully", async () => {
    const mockUsers = [
      { id: "111", inGameName: "User1" },
    ];
    (prisma.user.findMany as any).mockResolvedValue(mockUsers);
    
    // Mock cache returning undefined (member not cached)
    (mockInteraction.guild!.members.cache.get as any).mockReturnValue(undefined);
    
    // Mock fetch failing (member doesn't exist or left server)
    (mockInteraction.guild!.members.fetch as any).mockRejectedValue(
      new Error("Unknown Member")
    );

    await execute(mockInteraction as ChatInputCommandInteraction);

    expect(mockInteraction.reply).toHaveBeenCalled();
    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(replyCall.embeds).toBeDefined();
    
    // Verify fetch was attempted
    expect(mockInteraction.guild!.members.fetch).toHaveBeenCalledWith("111");
    
    // Check that embed description includes "Unknown" for missing member
    const embed = replyCall.embeds[0];
    const embedData = embed.data || embed.toJSON();
    expect(embedData.description).toContain("User1");
    expect(embedData.description).toContain("Unknown");
  });
});

