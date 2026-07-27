export type PersonRole = "FIGHTER" | "COACH";
export type EnrollmentStatus = "NEW" | "SENT" | "FAILED";
export type UserRole = "ADMIN" | "EDITOR";

export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface CtaLink {
  label: string;
  href: string;
}

export interface EnrollmentInput {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}
