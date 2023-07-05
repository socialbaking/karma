import * as dotenv from "dotenv";

dotenv.config();

await import("../../tracing");

const { start } = await import("./start");
const { configure } = await import("../config");

await import("../../references");

await configure(start);
