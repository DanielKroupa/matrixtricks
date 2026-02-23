import { z } from "zod";

export const checkoutSchema = z.object({
  currency: z.string().min(3).max(3),
});
