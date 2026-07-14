import { defineConfig } from "drizzle-kit";
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from "./src/config/envs.js";

export default defineConfig({
  dialect: "mysql",
  out: "./src/config/db/migration",
  schema: "./src/config/db/schema.ts",
  dbCredentials: {
    host: DB_HOST,
    user: DB_USER,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    port: DB_PORT,
  },
  verbose: true,
});
