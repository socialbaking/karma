export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SENDGRID_API_KEY: string;
      API_URL: string;
    }
  }
}
