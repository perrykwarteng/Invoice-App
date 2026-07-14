import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users.js";

export const otps = mysqlTable("otps", {
  id: int().autoincrement().primaryKey(),
  userId: int()
    .references(() => users.id)
    .notNull(),
  otpCode: varchar({ length: 10 }).notNull(),
  type: mysqlEnum([
    "login",
    "register",
    "reset_password",
    "forgot_password",
  ]).notNull(),
  expiresAt: timestamp().notNull(),
  isUsed: boolean().default(false),
  createdAt: timestamp().defaultNow(),
});
