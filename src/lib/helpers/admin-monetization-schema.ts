import { z } from "zod";

export const createManualVipGrantSchema = z
  .object({
    userId: z.string().min(1).optional(),
    userEmail: z.string().email().optional(),
    endsAt: z.string().datetime().optional(),
    note: z.string().max(300).optional(),
  })
  .refine((data) => Boolean(data.userId || data.userEmail), {
    message: "Either userId or userEmail is required",
    path: ["userId"],
  });

export const listVipGrantsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional(),
});

export const vipPriceRowSchema = z.object({
  currency: z.string().min(3).max(3),
  priceId: z.string().min(1),
  isActive: z.boolean(),
});

export const updateVipPricesSchema = z.object({
  prices: z.array(vipPriceRowSchema).min(1),
});
