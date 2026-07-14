import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { organisations } from "./organisations.js";
import { imageUrls } from "../../../types/types.js";

export const users = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  organisationId: int().references(() => organisations.id),
  role: mysqlEnum(["super_admin", "org_admin", "staff"]).notNull(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  password: varchar({ length: 255 }).notNull(),
  profilePic: json("profilePic").$type<imageUrls>(),
  isActive: boolean().default(true),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
