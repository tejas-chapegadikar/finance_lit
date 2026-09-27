import { z } from "zod";

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Display name must be at least 2 characters")
  .max(40, "Display name must be 40 characters or fewer");
