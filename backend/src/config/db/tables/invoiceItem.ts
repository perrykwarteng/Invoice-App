import {
  mysqlTable,
  int,
  varchar,
  decimal,
  timestamp,
} from "drizzle-orm/mysql-core";
import { invoices } from "./invoice.js";

export const invoiceItems = mysqlTable("invoice_items", {
 id: int().autoincrement().primaryKey(),
  invoiceId: int()
    .references(() => invoices.id)
    .notNull(),
  itemName: varchar({ length: 255 }).notNull(),
  quantity: int().notNull(),
  unitPrice: decimal({ precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal({ precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
