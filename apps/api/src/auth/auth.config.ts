/** Config estático do Better Auth — testável sem Prisma. */
export const authEmailPassword = {
  enabled: true,
  disableSignUp: true,
  minPasswordLength: 12,
} as const;

export const authUserDefaults = {
  roleDefault: "NONE",
} as const;
