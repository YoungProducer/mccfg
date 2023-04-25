export interface EnvConfig {
  DB_PORT: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_EXTERNAL_PORT: string;

  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;

  FILE_UPLOAD_DIR: string;

  // VERIFY_SECRET: string;
  // VERIFY_EXPIRES_IN: string;

  // ==================== will be needed later ====================== //
  // SMTP_USER: string;
  // SMTP_PASS: string;
  // SMTP_HOST: string;
  // SMTP_PORT: string;
}
