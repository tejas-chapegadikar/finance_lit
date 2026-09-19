import { z } from "zod";

export const onboardingSchema = z.object({
  collegeId: z.string().min(1, "Please select your college"),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
