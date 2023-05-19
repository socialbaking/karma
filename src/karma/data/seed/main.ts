// This is the main file for running the seed directly as a script
import { config } from "dotenv";

config();

import { seed } from "./seed";

await seed({});
