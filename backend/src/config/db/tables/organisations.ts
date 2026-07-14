import {
    int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const organisations = mysqlTable("organisations", {
id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 100 }),
  email: varchar({ length: 255 }).notNull(),
  status: mysqlEnum(["pending", "active", "inactive", "suspended"]).default(
    "pending",
  ),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

// plan: "free" | "pro" | "enterprise"
// subscriptionStatus: "active" | "expired" | "cancelled"
