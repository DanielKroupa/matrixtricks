import { z } from "zod";

export const fanwallCreateSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message must be at most 1000 characters"),
  title: z
    .string()
    .max(80, "Title must be at most 80 characters")
    .optional()
    .nullable(),
  nickname: z
    .string()
    .trim()
    .max(30, "Nickname must be at most 30 characters")
    .optional()
    .nullable(),
  contact: z
    .string()
    .max(120, "Contact must be at most 120 characters")
    .optional()
    .nullable(),
});

export const fanwallUpdateSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message must be at most 1000 characters")
    .optional(),
  title: z
    .string()
    .max(80, "Title must be at most 80 characters")
    .optional()
    .nullable(),
  isPinned: z.boolean().optional(),
});

export type FanwallCreateInput = z.infer<typeof fanwallCreateSchema>;
export type FanwallUpdateInput = z.infer<typeof fanwallUpdateSchema>;
