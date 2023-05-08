import { config } from "dotenv";

config();

import { HoneycombSDK } from "@honeycombio/opentelemetry-node"
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { FastifyInstrumentation } from "@opentelemetry/instrumentation-fastify";
import {getOrigin} from "./karma/listen/config";

const FILTER_HTTP_WORDS = [
    "accessToken",
    "apiToken",
    "authorization"
].flatMap(value => [value, value.toLowerCase(), value.toUpperCase()]);
const FILTERED_WORD_VALUE = "*****";

const { HONEYCOMB_API_KEY, OTEL_SERVICE_NAME } = process.env;

export let sdk: HoneycombSDK | undefined = undefined;

if (HONEYCOMB_API_KEY && OTEL_SERVICE_NAME) {
    sdk = new HoneycombSDK({
        instrumentations: [
            getNodeAutoInstrumentations({
                // we recommend disabling fs autoinstrumentation since it can be noisy
                // and expensive during startup
                "@opentelemetry/instrumentation-fs": {
                    enabled: false,
                },
                "@opentelemetry/instrumentation-fastify": {
                    // TODO Doesn't work
                    requestHook(span, info) {
                        const { request } = info;
                        const { query } = request;
                        const url = new URL(request.url, getOrigin());
                        // Search can only be completely reset using the string
                        url.search = new URLSearchParams(
                            Object.entries(query)
                                .map(mapEntry)
                        ).toString();
                        const { origin } = url;
                        const urlStringWithoutOrigin = url.toString().replace(origin, "");
                        span.setAttribute("request.target", urlStringWithoutOrigin);
                        span.setAttribute("request.url", url.toString());

                        function mapEntry([key, value]: [string, string]) {
                            if (FILTER_HTTP_WORDS.includes(key)) return [key, FILTERED_WORD_VALUE];
                            return [key, value]
                        }
                    }
                }
            })
        ],
    });

    sdk.start();
}

export async function shutdown() {
    return sdk?.shutdown()
}