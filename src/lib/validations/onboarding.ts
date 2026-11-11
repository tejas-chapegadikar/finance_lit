import { z } from "zod";
import { MAX_ENTRY, MAX_GOAL } from "../money/categories";

const optionalAmount = (max: number) =>
  z
    .union([z.literal(""), z.coerce.number().int("Use whole rupees").min(1, "Enter an amount above ₹0").max(max, "That amount is too big")])
    .transform((v) => (v === "" ? null : v));

// Every step can be skipped, so every field is optional.
export const onboardingSchema = z.object({
  nickname: z.string().trim().max(20, "Keep it under 20 characters"),
  income: optionalAmount(MAX_ENTRY),
  budget: optionalAmount(MAX_ENTRY),
  goalName: z.string().trim().max(40, "Keep the name under 40 characters"),
  goalTarget: optionalAmount(MAX_GOAL),
});

export type OnboardingInput = z.input<typeof onboardingSchema>;
