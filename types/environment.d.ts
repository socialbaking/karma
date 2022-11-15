export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SENDGRID_API_KEY: string;
    }
  }
}
