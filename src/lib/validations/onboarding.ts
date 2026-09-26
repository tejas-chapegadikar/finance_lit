import { z } from "zod";

export const onboardingSchema = z.object({
  collegeName: z
    .string()
    .trim()
    .min(2, "Enter your college name")
    .max(200, "College name is too long"),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
