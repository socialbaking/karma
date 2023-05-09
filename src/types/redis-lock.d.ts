declare module "redis-lock" {
    import { RedisClientType } from "redis";

    export interface UnlockFn {
        (): Promise<void>;
    }

    export interface LockFn {
        (name: string): Promise<UnlockFn>
    }

    export default function lock(client: RedisClientType): LockFn

}