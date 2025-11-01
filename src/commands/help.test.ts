import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ChatInputCommandInteraction } from "discord.js";
import { GuildMember } from "discord.js";
import { Bot } from "../bot.js";
import { Command } from "../types/command.js";
import { SlashCommandBuilder } from "discord.js";

// Mock responses
vi.mock("../config/responses.js", () => ({
  responses: {
    help: {
      commandDescription: "List all available commands and your access",
      title: "Available Commands",
      noCommands: {
        responses: ["No commands available. That's weird."],
      },
    },
    registration: {
      serverOnlyError: {
        responses: ["This command can only be used in a server."],
      },
    },
  },
}));

// Mock canAccessCommand
vi.mock("../utils/canAccessCommand.js", () => ({
  canAccessCommand: vi.fn(),
}));

// Import after mocks
import help from "./help.js";
import { canAccessCommand } from "../utils/canAccessCommand.js";
import { responses } from "../config/responses.js";

const execute = help.execute;

describe("help command", () => {
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

    const mockClient = {
      bot: undefined as Bot | undefined,
    };

    mockInteraction = {
      member: mockMember,
      reply: vi.fn(),
      client: mockClient as any,
    };
  });

  it("should reject users not in a server", async () => {
    mockInteraction.member = null;

    await execute(mockInteraction as ChatInputCommandInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        ephemeral: true,
        content: expect.any(String),
      })
    );
    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(responses.registration.serverOnlyError.responses).toContain(replyCall.content);
  });

  it("should show no commands message when bot is not available", async () => {
    (mockInteraction.client as any).bot = undefined;

    await execute(mockInteraction as ChatInputCommandInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        ephemeral: true,
        content: expect.any(String),
      })
    );
    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(responses.help.noCommands.responses).toContain(replyCall.content);
  });

  it("should show no commands message when no commands are loaded", async () => {
    const mockBot: Partial<Bot> = {
      loadedCommands: [],
    };
    (mockInteraction.client as any).bot = mockBot;

    await execute(mockInteraction as ChatInputCommandInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        ephemeral: true,
        content: expect.any(String),
      })
    );
    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(responses.help.noCommands.responses).toContain(replyCall.content);
  });

  it("should list all commands with access indicators", async () => {
    const mockCommand1: Command = {
      data: new SlashCommandBuilder()
        .setName("test1")
        .setDescription("Test command 1"),
      execute: vi.fn(),
      metadata: {
        permission: "public",
      },
    };

    const mockCommand2: Command = {
      data: new SlashCommandBuilder()
        .setName("test2")
        .setDescription("Test command 2"),
      execute: vi.fn(),
      metadata: {
        permission: "admin",
      },
    };

    const mockBot: Partial<Bot> = {
      loadedCommands: [mockCommand1, mockCommand2],
    };
    (mockInteraction.client as any).bot = mockBot;

    (canAccessCommand as any).mockImplementation((member: GuildMember, permission: string) => {
      return permission === "public";
    });

    await execute(mockInteraction as ChatInputCommandInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        ephemeral: true,
        embeds: expect.any(Array),
      })
    );

    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(replyCall.embeds).toBeDefined();
    expect(replyCall.embeds.length).toBe(1);

    const embed = replyCall.embeds[0];
    const embedData = embed.data || embed.toJSON();
    expect(embedData.title).toBe(responses.help.title);
    expect(embedData.description).toContain("/test1");
    expect(embedData.description).toContain("/test2");
    expect(embedData.description).toContain("Test command 1");
    expect(embedData.description).toContain("Test command 2");
    
    expect(canAccessCommand).toHaveBeenCalledWith(mockMember, "public");
    expect(canAccessCommand).toHaveBeenCalledWith(mockMember, "admin");
  });

  it("should show correct access indicators", async () => {
    const mockCommand1: Command = {
      data: new SlashCommandBuilder()
        .setName("public-cmd")
        .setDescription("Public command"),
      execute: vi.fn(),
      metadata: {
        permission: "public",
      },
    };

    const mockCommand2: Command = {
      data: new SlashCommandBuilder()
        .setName("admin-cmd")
        .setDescription("Admin command"),
      execute: vi.fn(),
      metadata: {
        permission: "admin",
      },
    };

    const mockBot: Partial<Bot> = {
      loadedCommands: [mockCommand1, mockCommand2],
    };
    (mockInteraction.client as any).bot = mockBot;

    (canAccessCommand as any).mockImplementation((member: GuildMember, permission: string) => {
      return permission === "public";
    });

    await execute(mockInteraction as ChatInputCommandInteraction);

    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    const embed = replyCall.embeds[0];
    const embedData = embed.data || embed.toJSON();
    
    expect(embedData.description).toContain("✅ `/public-cmd`");
    expect(embedData.description).toContain("❌ `/admin-cmd`");
    
    expect(embedData.footer?.text).toBe("✅ = You can use, ❌ = You don't have permission");
  });

  it("should handle commands without metadata as public", async () => {
    const mockCommand: Command = {
      data: new SlashCommandBuilder()
        .setName("no-meta-cmd")
        .setDescription("Command without metadata"),
      execute: vi.fn(),
    };

    const mockBot: Partial<Bot> = {
      loadedCommands: [mockCommand],
    };
    (mockInteraction.client as any).bot = mockBot;

    (canAccessCommand as any).mockReturnValue(true);

    await execute(mockInteraction as ChatInputCommandInteraction);

    expect(canAccessCommand).toHaveBeenCalledWith(mockMember, "public");
  });
});

