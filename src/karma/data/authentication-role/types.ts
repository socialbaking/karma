export type SystemRole = "system";

export type AuthenticationRole =
  | "moderator"
  | "admin"
  | "owner"
  | "patient"
  | "industry"
  | "member"
  | "pharmacy"
  | "clinic"
  | "booster"
  | "developer"
  | "coordinator"
  | "partner"
  | SystemRole;
