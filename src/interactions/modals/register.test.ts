import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleRegisterModal } from "./register.js";
import { prisma } from "../database/client.js";
import type { ModalSubmitInteraction } from "discord.js";

// Mock Prisma
vi.mock("../database/client.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe("handleRegisterModal", () => {
  let mockInteraction: Partial<ModalSubmitInteraction>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInteraction = {
      customId: "register_modal",
      fields: {
        getTextInputValue: vi.fn(),
      },
      reply: vi.fn(),
      user: {
        id: "123456789",
      },
    };
  });

  it("should reject empty name", async () => {
    (mockInteraction.fields!.getTextInputValue as any).mockReturnValue("   ");
    
    await handleRegisterModal(mockInteraction as ModalSubmitInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "Nice try, but that name doesn't work. Try again when you've got your act together.",
      ephemeral: true,
    });
  });

  it("should reject name over 100 characters", async () => {
    const longName = "a".repeat(101);
    (mockInteraction.fields!.getTextInputValue as any).mockReturnValue(longName);
    
    await handleRegisterModal(mockInteraction as ModalSubmitInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "That name is too long. Keep it under 100 characters, will you?",
      ephemeral: true,
    });
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
    const embedData = replyCall.embeds[0].data;
    expect(embedData.description).toContain("Welcome");
    expect(embedData.description).toContain(inGameName);
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
    const embedData = replyCall.embeds[0].data;
    expect(embedData.description).toContain("Changed your mind");
    expect(embedData.description).toContain(inGameName);
  });

  it("should handle database errors gracefully", async () => {
    const inGameName = "TestSnail";
    (mockInteraction.fields!.getTextInputValue as any).mockReturnValue(inGameName);
    (prisma.user.findUnique as any).mockRejectedValue(new Error("DB Error"));

    await handleRegisterModal(mockInteraction as ModalSubmitInteraction);

    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "Something went wrong. Try again later.",
      ephemeral: true,
    });
  });
});

