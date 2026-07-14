import {
  int,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { organisations } from "./organisations.js";
import { users } from "./users.js";

export const clients = mysqlTable("clients", {
  id: int().autoincrement().primaryKey(),
  organisationId: int("organisation_id")
    .references(() => organisations.id)
    .notNull(),
  createdBy: int()
    .references(() => users.id)
    .notNull(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }),
  address: varchar({ length: 500 }),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
