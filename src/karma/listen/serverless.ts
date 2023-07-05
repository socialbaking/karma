

import * as dotenv from "dotenv";

dotenv.config();

const { create } = await import("./start");
const { configure } = await import("../config");

// It appears vercel serverless requires strong references
// for inclusion in the file system
await import("../../references");

const app = await create();

export default async function handler(request: unknown, response: unknown) {
  await app.ready();
  configure(() => app.server.emit("request", request, response))
}

export { handler };
