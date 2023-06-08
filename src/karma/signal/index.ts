import {requestContext} from "@fastify/request-context";
import {ok} from "../../is";
import {FastifyPluginAsync} from "fastify";

const ABORT_CONTROLLER = "abortController";
const ABORT_CONTROLLER_CLEAR_TIMEOUT = "abortControllerClearTimeout";
const EXECUTION_START_AT_MS = "executionStartAtMilliseconds";
const EXECUTION_END_AT_MS = "executionEndAtMilliseconds";

export const {
    EXECUTION_TIMEOUT_MS: EXECUTION_TIMEOUT_MS_STRING = "10000"
} = process.env;

ok(/^\d+$/.test(EXECUTION_TIMEOUT_MS_STRING), "Expected EXECUTION_TIMEOUT_MS to be a number");
const EXECUTION_TIMEOUT_MS = +EXECUTION_TIMEOUT_MS_STRING;

export const EXECUTION_TIMEOUT_REASON = "Execution Timeout";

export const signalMiddleware: FastifyPluginAsync = async (instance) => {
    instance.addHook("onRequest", (request, response, done) => {
        setExecutionTimeout();
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

export function setExecutionTimeout() {
    const controller = setAbortController();
    const timeout = setTimeout(() => {
        controller.abort(EXECUTION_TIMEOUT_REASON)
    }, EXECUTION_TIMEOUT_MS);
    requestContext.set(ABORT_CONTROLLER_CLEAR_TIMEOUT, () => {
        clearTimeout(timeout);
    });
    const now = Date.now()
    requestContext.set(EXECUTION_START_AT_MS, now);
    requestContext.set(EXECUTION_END_AT_MS, now + EXECUTION_TIMEOUT_MS);
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