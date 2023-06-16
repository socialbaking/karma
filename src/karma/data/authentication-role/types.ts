export type KarmaAuthenticationRole =
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
  | "partner";

declare global {
    interface AuthenticationRoles extends Record<KarmaAuthenticationRole, KarmaAuthenticationRole> {
    }
}

// Used by client
type AuthenticationRole =
    | KarmaAuthenticationRole
    | keyof AuthenticationRoles;