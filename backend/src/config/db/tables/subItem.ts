import {
  mysqlTable,
  int,
  varchar,
  decimal,
  timestamp,
} from "drizzle-orm/mysql-core";
import { invoiceItems } from "./invoiceItem.js";

export const subItems = mysqlTable("sub_item", {
  id: int().autoincrement().primaryKey(),
  invoiceItemId: int()
    .references(() => invoiceItems.id)
    .notNull(),
  subItemName: varchar({ length: 255 }).notNull(),
  subItemPrice: decimal({ precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

//   subItemName: 'Sound',
//     subItemPrice: 6000
