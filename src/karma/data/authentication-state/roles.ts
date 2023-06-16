import { ok } from "../../../is";
import { AuthenticationRole, SystemRole } from "@opennetwork/logistics";

export const namedRoles: Record<
  Exclude<AuthenticationRole, SystemRole>,
  string
> = {
  admin: "Admin",
  industry: "Industry",
  member: "Member",
  moderator: "Moderator",
  owner: "Owner",
  patient: "Patient",
  pharmacy: "Pharmacy",
  clinic: "Clinic",
  booster: "Discord Server Booster",
  developer: "Software Developer",
  coordinator: "Coordinator",
  partner: "Partner",
};

export const alternativeRoleNames: Partial<
  Record<AuthenticationRole, string[]>
> = {
  member: ["Contributor", "Subscriber"],
  patient: ["Prescribed Medical Cannabis", "Medical Patient"],
  pharmacy: ["Verified Pharmacy"],
  clinic: [
    "Verified Clinic",
    "Verified Medical Professional",
    "Verified Prescriber",
  ],
  booster: ["Server Booster"],
  developer: ["Cannagineer", "Software Engineer", "Developer"],
  coordinator: [
    "Community Coordinator",
    "Community Organiser",
    "Community Organizer",
  ],
  industry: ["Verified Industry"],
};

export {
  isAuthenticationRole,
  getAuthenticationRole,
  getAuthenticationRoles,
  AuthenticationRole,
} from "@opennetwork/logistics"