export type AppEnv = {
  Bindings: {
    DB: D1Database;
    PHOTOS: R2Bucket;
    ASSETS: Fetcher;
    SESSION_SECRET: string;
    DEMO_EMAIL?: string;
    DEMO_PASSWORD?: string;
  };
  Variables: {
    sessionEmail: string;
  };
};
