// This is the main file for running the seed directly as a script
import { config } from "dotenv";

config();

const { seed } = await import("./seed");

await seed({});
