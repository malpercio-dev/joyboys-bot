import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "../../../database/client.js";
import type { ButtonInteraction } from "discord.js";
import { GuildMember } from "discord.js";

// Mock Prisma
vi.mock("../../../database/client.js", () => ({
  prisma: {
    user: {
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// No need to mock isAdmin anymore since we're injecting it

// Mock responses - need to match actual responses.ts
vi.mock("../../../config/responses.js", () => ({
  responses: {
    admin: {
      deleteUser: {
        success: {
          responses: [
            "User deleted. They're gone now.",
            "Deleted. One less user to worry about.",
            "User removed. Good riddance.",
            "They're gone. Deleted successfully.",
          ],
        },
        error: {
          responses: [
            "Failed to delete user. Something went wrong.",
            "Couldn't delete that user. Try again.",
            "Error deleting user. Oops.",
          ],
        },
        notFound: {
          responses: [
            "User not found. Already deleted?",
            "Couldn't find that user. Maybe they're already gone?",
            "User doesn't exist. Check the ID.",
          ],
        },
        permissionDenied: {
          responses: [
            "You don't have permission to do that.",
            "Admin only. You're not admin.",
            "Not happening. You need admin privileges.",
          ],
        },
      },
    },
    registration: {
      serverOnlyError: {
        responses: [
          "This command can only be used in a server.",
          "Sorry, but this only works in servers. Not here.",
          "Nope. This is a server-only command. Try that again in a server.",
        ],
      },
    },
  },
}));

// Mock getRandomResponse - import the actual function and wrap it
vi.mock("../../../utils/responses.js", async () => {
  const actual = await vi.importActual("../../../utils/responses.js");
  return {
    ...actual,
    getRandomResponse: (set: any) => set.responses[0],
  };
});

// Import after mocks
import { handleDeleteUserButton } from "./delete-user.js";
import { responses } from "../../../config/responses.js";

describe("handleDeleteUserButton", () => {
  let mockInteraction: Partial<ButtonInteraction>;
  let mockMember: GuildMember;

  beforeEach(() => {
    // Don't clear prisma mocks - let each test set up its own
    
    // Create a proper mock that will pass the member check (has roles.cache)
    mockMember = Object.create(GuildMember.prototype) as GuildMember;
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
      customId: "delete_user_123",
      member: mockMember,
      reply: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
      user: {
        id: "admin123",
      },
      message: {
        embeds: [],
        components: [],
      },
    } as any;
  });

  it("should reject non-admin users", async () => {
    // Inject a mock that returns false
    const mockIsAdmin = vi.fn(() => false);
    await handleDeleteUserButton(
      mockInteraction as ButtonInteraction,
      mockIsAdmin,
      prisma as any
    );

    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        ephemeral: true,
      })
    );
    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(responses.admin.deleteUser.permissionDenied.responses).toContain(replyCall.content);
  });

  it("should delete user when found", async () => {
    // Verify member has the required structure for the check
    expect(mockInteraction.member).toBeDefined();
    expect((mockInteraction.member as any)?.roles?.cache).toBeDefined();
    
    // Set up prisma mocks
    const mockUser = {
      id: "123",
      inGameName: "TestUser",
    };
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.user.delete as any).mockResolvedValue(mockUser);

    // Mock message with embed for update - need to properly structure it
    const mockEmbed = {
      description: "**TestUser** (DiscordName)",
      title: "Registered Users",
      color: 0x3498db,
      data: {
        description: "**TestUser** (DiscordName)",
        title: "Registered Users",
        color: 0x3498db,
      },
    };
    const mockUpdate = vi.fn().mockResolvedValue(undefined);
    const mockReply = vi.fn();
    
    // Set up interaction by updating mockInteraction directly
    mockInteraction.customId = "delete_user_123";
    // Member is already set in beforeEach - don't reassign it as that can break instanceof checks
    mockInteraction.message = {
      embeds: [mockEmbed],
      components: [],
    } as any;
    mockInteraction.update = mockUpdate;
    mockInteraction.reply = mockReply;

    // Inject the mock isAdmin function directly
    const mockIsAdmin = vi.fn(() => true);
    // Inject the mocked prisma as well
    await handleDeleteUserButton(
      mockInteraction as ButtonInteraction,
      mockIsAdmin,
      prisma as any
    );

    // Verify admin check was performed
    expect(mockIsAdmin).toHaveBeenCalled();
    
    // Verify the flow - findUnique should be called first
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "123" },
    });
    // Then delete should be called
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "123" },
    });
    // Update should be called to remove the user from the embed
    expect(mockUpdate).toHaveBeenCalled();
    // Reply should NOT be called since update was successful
    expect(mockReply).not.toHaveBeenCalled();
  });

  it("should handle user not found", async () => {
    // Inject mock that returns true
    const mockIsAdmin = vi.fn(() => true);
    
    // Reset and set up prisma to return null (user not found)
    (prisma.user.findUnique as any).mockReset();
    (prisma.user.delete as any).mockReset();
    (prisma.user.findUnique as any).mockResolvedValue(null);
    
    // Need to ensure message exists to avoid errors
    mockInteraction.message = {
      embeds: [],
      components: [],
    } as any;
    mockInteraction.reply = vi.fn();

    await handleDeleteUserButton(
      mockInteraction as ButtonInteraction,
      mockIsAdmin,
      prisma as any
    );

    expect(mockIsAdmin).toHaveBeenCalled();

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "123" },
    });
    expect(prisma.user.delete).not.toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        ephemeral: true,
      })
    );
    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(responses.admin.deleteUser.notFound.responses).toContain(replyCall.content);
  });

  it("should handle database errors", async () => {
    // Inject mock that returns true
    const mockIsAdmin = vi.fn(() => true);
    
    // Set up prisma mocks
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "123",
      inGameName: "TestUser",
    });
    (prisma.user.delete as any).mockRejectedValue(new Error("DB Error"));
    
    // Need to ensure message exists
    mockInteraction.message = {
      embeds: [],
      components: [],
    } as any;
    mockInteraction.reply = vi.fn();

    await handleDeleteUserButton(
      mockInteraction as ButtonInteraction,
      mockIsAdmin,
      prisma as any
    );

    expect(mockIsAdmin).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "123" },
    });
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "123" },
    });
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        ephemeral: true,
      })
    );
    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(responses.admin.deleteUser.error.responses).toContain(replyCall.content);
  });

  it("should extract user ID from customId", async () => {
    // Inject mock that returns true
    const mockIsAdmin = vi.fn(() => true);
    
    // Set up prisma mocks
    mockInteraction.customId = "delete_user_456";
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "456",
      inGameName: "TestUser",
    });
    (prisma.user.delete as any).mockResolvedValue({});
    
    // Need to ensure message exists with proper embed structure
    const mockEmbed = {
      description: "**TestUser** (DiscordName)",
      title: "Registered Users",
      color: 0x3498db,
      data: {
        description: "**TestUser** (DiscordName)",
        title: "Registered Users",
        color: 0x3498db,
      },
    };
    const mockUpdate = vi.fn().mockResolvedValue(undefined);
    mockInteraction.message = {
      embeds: [mockEmbed],
      components: [],
    } as any;
    mockInteraction.update = mockUpdate;
    mockInteraction.reply = vi.fn();

    await handleDeleteUserButton(
      mockInteraction as ButtonInteraction,
      mockIsAdmin,
      prisma as any
    );

    expect(mockIsAdmin).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "456" },
    });
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "456" },
    });
    expect(mockUpdate).toHaveBeenCalled();
  });
});

