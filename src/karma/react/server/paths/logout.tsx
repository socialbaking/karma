import { FastifyReply, FastifyRequest } from "fastify";

export const path = "/logout";
export const anonymous = true;

export async function handler(request: FastifyRequest, response: FastifyReply) {
  response.header("Location", "/api/authentication/logout");
  response.status(302);
}

export function Logout() {
  return <p>Logging out! Redirecting...</p>;
}

export const Component = Logout;