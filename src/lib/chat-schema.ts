import { z } from "zod";

export const createChatMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long"),
});

export const adminThreadListSchema = z.object({
  status: z.enum(["OPEN", "ARCHIVED", "BLOCKED"]).optional(),
  query: z
    .string()
    .trim()
    .max(120, "Search query is too long")
    .optional()
    .transform((value) => value || undefined),
});

export const adminThreadStatusSchema = z.object({
  status: z.enum(["OPEN", "ARCHIVED", "BLOCKED"]),
});

export const adminOpenThreadSchema = z.object({
  userId: z.string().trim().min(1, "User id is required"),
});

export const markReadSchema = z.object({
  threadId: z.string().cuid().optional(),
});
