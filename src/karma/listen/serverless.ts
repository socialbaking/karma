// It appears vercel serverless requires strong references
// for inclusion in the file system
import "../../import-references";

import * as dotenv from "dotenv";
dotenv.config();

import { create } from "./start";

const app = await create();

export default async function handler(request: unknown, response: unknown) {
  await app.ready();
  app.server.emit("request", request, response);
}

export { handler };
