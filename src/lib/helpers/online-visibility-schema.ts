import { z } from "zod";

export const onlineVisibilitySchema = z.object({
  enabled: z.boolean(),
});

export type OnlineVisibilityInput = z.infer<typeof onlineVisibilitySchema>;
