import * as dotenv from "dotenv";

dotenv.config();

import "../../tracing";

import {start} from "./start";

await start();