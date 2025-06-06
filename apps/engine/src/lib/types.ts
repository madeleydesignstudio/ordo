export interface CloudflareBindings {
  DATABASE_URL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  ENVIRONMENT?: string
  DEV_BASE_URL?: string
  PROD_BASE_URL?: string
  STORAGE_AUTH_SECRET: string
}

export type AppEnv = {
  Bindings: CloudflareBindings
} 