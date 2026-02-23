import { z } from "zod";

export const siteBioSchema = z.object({
  bio: z
    .string()
    .trim()
    .nonempty({ message: "Bio is required" })
    .min(3, { message: "Bio must be at least 3 characters long" })
    .max(220, { message: "Bio must be at most 220 characters long" }),
});

export type SiteBioFormData = z.infer<typeof siteBioSchema>;
