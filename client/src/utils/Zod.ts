import { z } from "zod";

export const RegisterSchema = z
  .object({
    orgName: z.string().min(1, "Organisation name is required"),
    orgType: z.string().min(1, "Organisation type is required"),
    orgEmail: z.string().email("Invalid email address"),
    adminName: z.string().min(1, "Admin name is required"),
    adminEmail: z.string().email("Invalid email address"),
    adminPassword: z.string().min(6, "Password must be at least 6 characters"),
    adminConfirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.adminPassword === data.adminConfirmPassword, {
    message: "Passwords do not match",
    path: ["adminConfirmPassword"],
  });
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
