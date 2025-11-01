import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleRegisterModal } from "./register.js";
import { prisma } from "../../database/client.js";
import type { ModalSubmitInteraction } from "discord.js";
import { GuildMember } from "discord.js";
import { responses } from "../../config/responses.js";

// Mock Prisma
vi.mock("../../database/client.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

// Mock isMemberOrAdmin
vi.mock("../../utils/isMemberOrAdmin.js", () => ({
  isMemberOrAdmin: vi.fn(),
}));

import { isMemberOrAdmin } from "../../utils/isMemberOrAdmin.js";

describe("handleRegisterModal", () => {
  let mockInteraction: Partial<ModalSubmitInteraction>;
  let mockMember: GuildMember;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a proper mock that will pass instanceof GuildMember
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
      customId: "register_modal",
      fields: {
        getTextInputValue: vi.fn(),
      },
      reply: vi.fn(),
      user: {
        id: "123456789",
      },
      member: mockMember,
    };
    
    // Default to allowing access
    (isMemberOrAdmin as any).mockReturnValue(true);
  });

  it("should reject empty name", async () => {
    (mockInteraction.fields!.getTextInputValue as any).mockReturnValue("   ");
    
    await handleRegisterModal(mockInteraction as ModalSubmitInteraction);

    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(replyCall.ephemeral).toBe(true);
    expect(responses.registration.validation.emptyName.responses).toContain(replyCall.content);
  });

  it("should reject name over 100 characters", async () => {
    const longName = "a".repeat(101);
    (mockInteraction.fields!.getTextInputValue as any).mockReturnValue(longName);
    
    await handleRegisterModal(mockInteraction as ModalSubmitInteraction);

    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(replyCall.ephemeral).toBe(true);
    expect(responses.registration.validation.nameTooLong.responses).toContain(replyCall.content);
  });

  it("should create new user for first-time registration", async () => {
    const inGameName = "TestSnail";
    (mockInteraction.fields!.getTextInputValue as any).mockReturnValue(inGameName);
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.upsert as any).mockResolvedValue({
      id: "123456789",
      inGameName,
    });

    await handleRegisterModal(mockInteraction as ModalSubmitInteraction);

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { id: "123456789" },
      update: { inGameName },
      create: {
        id: "123456789",
        inGameName,
      },
    });

    expect(mockInteraction.reply).toHaveBeenCalled();
    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    const embed = replyCall.embeds[0];
    // EmbedBuilder instances have a .data property with the serialized data
    const embedData = embed.data || embed.toJSON();
    expect(embedData.title).toBe(responses.registration.success.firstTime.title);
    expect(embedData.description).toContain(inGameName);
    // Check that description matches one of the possible responses
    const possibleDescriptions = responses.registration.success.firstTime.description.responses.map(
      (r) => r.replace("{inGameName}", inGameName)
    );
    expect(possibleDescriptions).toContain(embedData.description);
  });

  it("should update existing user for re-registration", async () => {
    const inGameName = "UpdatedSnail";
    (mockInteraction.fields!.getTextInputValue as any).mockReturnValue(inGameName);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "123456789",
      inGameName: "OldSnail",
    });
    (prisma.user.upsert as any).mockResolvedValue({
      id: "123456789",
      inGameName,
    });

    await handleRegisterModal(mockInteraction as ModalSubmitInteraction);

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { id: "123456789" },
      update: { inGameName },
      create: {
        id: "123456789",
        inGameName,
      },
    });

    expect(mockInteraction.reply).toHaveBeenCalled();
    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    const embed = replyCall.embeds[0];
    // EmbedBuilder instances have a .data property with the serialized data
    const embedData = embed.data || embed.toJSON();
    expect(embedData.title).toBe(responses.registration.success.reRegistration.title);
    expect(embedData.description).toContain(inGameName);
    // Check that description matches one of the possible responses
    const possibleDescriptions = responses.registration.success.reRegistration.description.responses.map(
      (r) => r.replace("{inGameName}", inGameName)
    );
    expect(possibleDescriptions).toContain(embedData.description);
  });

  it("should handle database errors gracefully", async () => {
    const inGameName = "TestSnail";
    (mockInteraction.fields!.getTextInputValue as any).mockReturnValue(inGameName);
    (prisma.user.findUnique as any).mockRejectedValue(new Error("DB Error"));

    await handleRegisterModal(mockInteraction as ModalSubmitInteraction);

    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(replyCall.ephemeral).toBe(true);
    expect(responses.registration.genericError.responses).toContain(replyCall.content);
  });

  it("should reject users without member or admin role", async () => {
    (isMemberOrAdmin as any).mockReturnValue(false);
    const inGameName = "TestSnail";
    (mockInteraction.fields!.getTextInputValue as any).mockReturnValue(inGameName);

    await handleRegisterModal(mockInteraction as ModalSubmitInteraction);

    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(replyCall.ephemeral).toBe(true);
    expect(responses.registration.permissionError.responses).toContain(replyCall.content);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });

  it("should reject when used outside a server", async () => {
    mockInteraction.member = null;
    const inGameName = "TestSnail";
    (mockInteraction.fields!.getTextInputValue as any).mockReturnValue(inGameName);

    await handleRegisterModal(mockInteraction as ModalSubmitInteraction);

    const replyCall = (mockInteraction.reply as any).mock.calls[0][0];
    expect(replyCall.ephemeral).toBe(true);
    expect(responses.registration.serverOnlyError.responses).toContain(replyCall.content);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });
});

