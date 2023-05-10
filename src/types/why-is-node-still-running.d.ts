declare module "why-is-node-still-running" {
    export function whyIsNodeStillRunning(): void;
    export interface WhyModule {
        whyIsNodeStillRunning: () => void,
    }
    const why: WhyModule;
    export default why;
}