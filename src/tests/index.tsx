/* c8 ignore start */
import why, {whyIsNodeStillRunning} from "why-is-node-still-running";
import {shutdown} from "../tracing";
import {tracer} from "../trace";
import {isRedisMemory, seed, startRedisMemory, stopData, stopRedisMemory} from "../karma/data";

try {
  if (isRedisMemory()) {
    await startRedisMemory()
  }

  await seed();

  await tracer.startActiveSpan("tests", async (span) => {
    await tracer.startActiveSpan("client-tests", async (span) => {
      await import("./client");
      span.end()
    });
    await tracer.startActiveSpan("data-tests", async (span) => {
      await import("./data");
      span.end()
    });
    span.end();
  })

  // Ensure any data clients are closed
  await stopData();

  if (isRedisMemory()) {
    await stopRedisMemory();
  }

  console.log("Tests successful");
} catch (error) {
  console.error(error);
  if (typeof process !== "undefined") {
    process.exit(1);
  }
  throw error;
}

console.log("Shutting down telemetry");
await shutdown();
console.log("Finished shutting down telemetry");

if (process.env.TESTS_REPORT_HANDLES) {
  why.whyIsNodeStillRunning();
}

// Force closing, but reporting of handles above
process.exit(0);

export default 1;
