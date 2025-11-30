import * as z from "zod";

// Sign In Validation Schema
export const signInSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type SignInForm = z.infer<typeof signInSchema>;

// Sign Up Validation Schema (for future use)
export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  level: z.enum(["admin", "user"]).default("user"),
});

export type SignUpForm = z.infer<typeof signUpSchema>;

