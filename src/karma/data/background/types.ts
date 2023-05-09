

export interface BackgroundData extends Record<string, unknown> {
    expiresIn?: number;
}

export interface Background extends BackgroundData {
    backgroundKey: string;
    backgroundId: string;
    createdAt: string;
    expiresAt: string;
    completedAt?: string;
}