declare global {
  namespace NodeJS {
    interface ProcessEnv {
      IMS_API_TOKEN: string;
      PORT?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      ALLOWED_ORIGINS?: string;
    }
  }
}

export {};
