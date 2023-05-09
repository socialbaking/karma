import {Background, BackgroundData} from "./types";
import { getBackgroundStore } from "./store";
import {v4} from "uuid";
import {lock} from "../lock";

export * from "./store";
export * from "./types";

export const BACKGROUND_STATIC = "background-static";
export const BACKGROUND_LOCK = "background-lock";
export const DEFAULT_BACKGROUND_EXPIRES_IN = 2 * 60 * 1000; // Default 2 minutes, longest vercel time is 1 minute AFAIK

export function getBackground(data?: BackgroundData) {
    return getIdentifiedBackground(BACKGROUND_STATIC, data);
}

export async function getIdentifiedBackground(backgroundId: string, data?: BackgroundData) {
    const done = await lock(BACKGROUND_LOCK);

    const store = await getBackgroundStore();
    const backgroundKey = v4();

    return get();

    async function get() {
        const expiresIn = data?.expiresIn ?? DEFAULT_BACKGROUND_EXPIRES_IN;

        const existing = await store.get(backgroundId);

        if (existing && !isExpired(existing)) {
            throw new Error(`Background task scheduled and not yet expired, please try again at ${existing.expiresAt}`);
        }

        const background: Background = {
            ...data,
            backgroundId,
            backgroundKey,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + expiresIn).toISOString()
        };

        await store.set(backgroundId, background);

        // Make sure we stored the document that we were thought we were storing
        const stored = await store.get(backgroundId);

        if (stored.backgroundKey !== backgroundKey) {
            throw new Error("Failed to schedule background task");
        }

        return createBackgroundCompleteFn(background)

    }

    function createBackgroundCompleteFn(background: Background) {
        return async (update?: BackgroundData) => {

            const current = await store.get(backgroundId);

            if (current.backgroundKey !== backgroundKey) {
                return;
            }

            const completedAt = new Date().toISOString();

            // Set expiry now so next background task can run when requested
            const updated: Background =  {
                ...background,
                ...update,
                expiresAt: completedAt,
                completedAt
            };

            await store.set(backgroundId, updated);

            await done();
        };
    }


    function isExpired(document: Background) {
        const expiresAt = new Date(document.expiresAt).getTime();
        const now = Date.now();
        return expiresAt < now;
    }
}