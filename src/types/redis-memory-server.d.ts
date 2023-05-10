declare module "redis-memory-server" {

    export class RedisMemoryServer {
        getHost(): Promise<string>;
        getPort(): Promise<number>;
        stop(): Promise<void>;
    }
}