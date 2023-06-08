import {requestContext} from "@fastify/request-context";
import {ok} from "../../is";
import {FastifyPluginAsync} from "fastify";
import {isNumberString} from "../calculations";
import {getOrigin} from "../listen/config";

const ABORT_CONTROLLER = "abortController";
const ABORT_CONTROLLER_CLEAR_TIMEOUT = "abortControllerClearTimeout";
const EXECUTION_START_AT_MS = "executionStartAtMilliseconds";
const EXECUTION_END_AT_MS = "executionEndAtMilliseconds";

export const {
    EXECUTION_TIMEOUT_MS: EXECUTION_TIMEOUT_MS_STRING = "10000"
} = process.env;

ok(isNumberString(EXECUTION_TIMEOUT_MS_STRING), "Expected EXECUTION_TIMEOUT_MS to be a number");
const EXECUTION_TIMEOUT_MS = +EXECUTION_TIMEOUT_MS_STRING;

export const EXECUTION_TIMEOUT_REASON = "Execution Timeout";

export const signalMiddleware: FastifyPluginAsync = async (instance) => {
    instance.addHook("onRequest", (request, response, done) => {
        setExecutionTimeout(request.url);
        if (response.raw) {
            response.raw.once("close", signalExecutionFinish);
        }
        done();
    });
    instance.addHook("onRequestAbort", (request, done) => {
        signalExecutionFinish();
        done();
    });
}

function getExecutionTimeout(url: string) {
    const { pathname } = new URL(url, getOrigin());
    const key = pathname
        .replace(/^\/+/, "")
        .replace(/\//g, "_")
        .toUpperCase();
    const envKey = `EXECUTION_TIMEOUT_MS_${key}`
    const value = process.env[envKey];
    if (isNumberString(value)) {
        console.log(`Using timeout ${value} from ${envKey}`);
        return +value;
    }
    return EXECUTION_TIMEOUT_MS;
}

export function setExecutionTimeout(url: string) {
    const timeout = getExecutionTimeout(url);
    const controller = setAbortController();
    const timeoutReference = setTimeout(() => {
        controller.abort(EXECUTION_TIMEOUT_REASON)
    }, timeout);
    requestContext.set(ABORT_CONTROLLER_CLEAR_TIMEOUT, () => {
        clearTimeout(timeoutReference);
    });
    const now = Date.now()
    requestContext.set(EXECUTION_START_AT_MS, now);
    requestContext.set(EXECUTION_END_AT_MS, now + timeout);
}

export function getExecutionEndAt() {
    const ms = requestContext.get(EXECUTION_END_AT_MS);
    ok(typeof ms === "number", "Expected EXECUTION_END_AT_MS");
    return ms;
}

export function getTimeRemaining() {
    const now = Date.now();
    const endAt = getExecutionEndAt();
    if (now < endAt) {
        return 0;
    }
    return now - endAt;
}

export function signalExecutionFinish() {
    const controller = getAbortController();
    controller.abort();
    const clearTimeout = requestContext.get(ABORT_CONTROLLER_CLEAR_TIMEOUT);
    ok(typeof clearTimeout === "function", "Expected ABORT_CONTROLLER_CLEAR_TIMEOUT");
    clearTimeout();
}

export function setAbortController() {
    const controller = new AbortController();
    requestContext.set(ABORT_CONTROLLER, controller);
    return controller;
}

function getAbortController() {
    const controller = requestContext.get(ABORT_CONTROLLER);
    ok(controller, "Expected AbortController to be available");
    return controller;
}

function getSignal() {
    return getAbortController().signal;
}