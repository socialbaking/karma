import {v4} from "uuid";
import {requestContext} from "@fastify/request-context";

const {
    CONSOLE_CAPTURE_KEY
} = process.env;

export interface Capture {
    logs: unknown[]
    release(): void;
}

export function capture(captureKey?: string): Capture | undefined {
    if (!CONSOLE_CAPTURE_KEY || !captureKey || captureKey !== CONSOLE_CAPTURE_KEY) return undefined;

    const replace = ["warn", "log", "error"] as const;
    type Key = (typeof replace)[number];
    type LogFn = typeof console.log;

    const uniqueName = `capture_${v4()}`;

    requestContext.set(uniqueName, true);

    const logs: unknown[] = [];

    const originals: Partial<Record<Key, LogFn>> = {};

    for (const key of replace) {
        originals[key] = console[key];
        console[key] = make(key);
    }

    function make(key: Key): LogFn {
        return (...parts) => {
            // If the log came from the same request context, include it in the capture
            if (requestContext.get(uniqueName)) {
                if (parts.length === 1) {
                    logs.push(parts[0]);
                } else {
                    logs.push(parts)
                }
            }
            originals[key].call(console, ...parts);
        }
    }

    return {
        logs,
        // If we deploy to a serverless function, and we're not releasing between background requests...
        //
        // oh well... it should figure itself out... the process will die soon anyway
        //
        // We won't be pushing to the logs anymore because the flag is unset
        release() {
            requestContext.set(uniqueName, false);
            for (const key of replace) {
                console[key] = originals[key];
            }
        }
    }

}