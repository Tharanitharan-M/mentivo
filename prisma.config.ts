import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI doesn't load .env.local automatically — do it explicitly.
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Unpooled (direct) connection used for migrations — required when using
    // a connection pooler like PgBouncer/Neon pooler at runtime.
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
