import { requestContext } from "@fastify/request-context";
import { ok } from "../../is";
import { AuthenticationRole, AuthenticationState, Partner } from "../data";

export const AUTHORIZED_PARTNER_ID_KEY = "authorizedForPartnerIds";
export const AUTHORIZED_ACCESS_TOKEN_KEY = "accessTokenKeyValue";
export const AUTHORIZED_PARTNER = "partner";
export const AUTHENTICATION_STATE = "authenticationState";

export function setAuthorizedForPartnerId(partnerId: string) {
  requestContext.set(AUTHORIZED_PARTNER_ID_KEY, partnerId);
}

export function getMaybeAuthorizedForPartnerId() {
  return requestContext.get(AUTHORIZED_PARTNER_ID_KEY);
}

export function getMaybeAuthorizedForOrganisationId() {
  const partner = getMaybePartner();
  return partner?.organisationId;
}

export function isAnonymous() {
  return !isAuthorized();
}

export function isAuthorized() {
  // Later add more here if more authentication methods or types are available
  return !!(getMaybeAuthorizedForPartnerId() || getMaybeAuthenticationState());
}

export function getAuthorizedForPartnerId(): string {
  const partnerId = getMaybeAuthorizedForPartnerId();
  ok(partnerId, "Expected partner authorization");
  return partnerId;
}

export function validateAuthorizedForPartnerId(
  partnerId: string
): asserts partnerId {
  const authorizedPartnerId = getAuthorizedForPartnerId();
  ok(
    authorizedPartnerId === partnerId,
    "Expected partner authorization to match"
  );
}

export function ensurePartnerMatchIfUnapproved(
  partnerId: string
): asserts partnerId {
  const { approved } = getPartner();
  if (process.env.VOUCH_REQUIRE_PARTNER_APPROVAL && !approved) {
    validateAuthorizedForPartnerId(partnerId);
  }
}

export function getMaybePartner(): Partner | undefined {
  return requestContext.get(AUTHORIZED_PARTNER);
}

export function getPartner(): Partner {
  const partner = getMaybePartner();
  ok(partner, "Expected authorized partner");
  return partner;
}

export function getMaybeAccessToken(): string | undefined {
  return requestContext.get(AUTHORIZED_ACCESS_TOKEN_KEY);
}

export function getAccessToken(): string {
  const accessToken = getMaybeAccessToken();
  ok(accessToken, "Expected access token to be supplied");
  return accessToken;
}

export function setAuthenticationState(state: AuthenticationState) {
  requestContext.set(AUTHENTICATION_STATE, state);
}

export function getMaybeAuthenticationState(): AuthenticationState | undefined {
  const state = requestContext.get(AUTHENTICATION_STATE);
  if (state) return state;
  const partner = getMaybePartner();
  if (partner) {
    return {
      type: "partner",
      stateId: partner.partnerId,
      stateKey: partner.partnerId,
      partnerId: partner.partnerId,
      roles: ["partner"],
      createdAt: partner.createdAt,
      expiresAt: partner.createdAt,
    };
  }
  return undefined;
}

export function getAuthenticationState(): AuthenticationState {
  const state = getMaybeAuthenticationState();
  ok(state, "Expected to be authenticated");
  return state;
}

export function getAuthenticationRoles(): AuthenticationRole[] {
  const state = getMaybeAuthenticationState();
  return state?.roles ?? [];
}

export function isRole(role: AuthenticationRole) {
  const roles = getAuthenticationRoles();
  return roles.includes(role);
}

export function isMember() {
  return isRole("member");
}

export function isAdmin() {
  return isRole("admin");
}

export function isModerator() {
  return isAdmin() || isRole("moderator");
}

export function isPharmacy() {
  return isRole("pharmacy");
}

export function isIndustry() {
  return isRole("industry");
}

export function isClinic() {
  return isRole("clinic");
}
