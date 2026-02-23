import { z } from "zod";

const scopeSchema = z.object({
  commentCreate: z.boolean().default(true),
  commentUpdate: z.boolean().default(true),
  commentDelete: z.boolean().default(true),
  fanwallCreate: z.boolean().default(true),
  fanwallUpdate: z.boolean().default(true),
  fanwallDelete: z.boolean().default(true),
});

export const createUserBlockSchema = z
  .object({
    reason: z
      .string()
      .min(3, "Reason is too short")
      .max(500, "Reason is too long"),
    endsAt: z.string().datetime().optional().nullable(),
    scopes: scopeSchema,
  })
  .superRefine((value, context) => {
    const hasAnyScope = Object.values(value.scopes).some(Boolean);
    if (!hasAnyScope) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one block scope must be selected",
        path: ["scopes"],
      });
    }
  });

export type CreateUserBlockInput = z.infer<typeof createUserBlockSchema>;
