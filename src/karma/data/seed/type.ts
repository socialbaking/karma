export interface SeedOptions extends Record<string, unknown> {
  seed?: string;
}

export interface Seed {
  seed(options: SeedOptions): void | Promise<void>;
  seed(): void | Promise<void>;
}
