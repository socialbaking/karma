import { Authsignal } from "@authsignal/node";

export const {
  AUTHSIGNAL_TENANT,
  AUTHSIGNAL_KEY,
  AUTHSIGNAL_SECRET,
  AUTHSIGNAL_API_URL,
  AUTHSIGNAL_REDIRECT_URL,
} = process.env;

export const authsignal = new Authsignal({
  secret: process.env.AUTHSIGNAL_SECRET,
  apiBaseUrl: AUTHSIGNAL_API_URL || "https://au.signal.authsignal.com/v1",
});
