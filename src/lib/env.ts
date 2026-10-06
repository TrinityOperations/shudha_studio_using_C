import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
});

function parseEnv<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return result.data;
}

function getPublicEnvInput() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
}

export function getPublicEnv() {
  return parseEnv(publicEnvSchema, getPublicEnvInput());
}

export function getServerEnv() {
  return parseEnv(serverEnvSchema, {
    ...getPublicEnvInput(),
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  });
}
