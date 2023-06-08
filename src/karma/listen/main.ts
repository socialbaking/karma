import * as dotenv from "dotenv";

dotenv.config();

await import("../../tracing");

const { start } = await import("./start");

await start();
