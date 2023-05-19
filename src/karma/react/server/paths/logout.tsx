import { FastifyReply, FastifyRequest } from "fastify";

export async function handler(request: FastifyRequest, response: FastifyReply) {
  response.header("Location", "/api/authentication/logout");
  response.status(302);
}

export function Logout() {
  return <p>Logging out! Redirecting...</p>;
}
