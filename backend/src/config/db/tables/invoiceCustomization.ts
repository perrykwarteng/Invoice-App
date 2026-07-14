import {
  boolean,
  int,
  json,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { invoices } from "./invoice.js";
import { imageUrls } from "../../../types/types.js";

export const invoiceCustomizations = mysqlTable("invoiceCustomizations", {
  id: int().autoincrement().primaryKey(),
  invoiceId: int()
    .references(() => invoices.id, {
      onDelete: "cascade",
    })
    .notNull()
    .unique(),

  primaryColor: varchar({ length: 20 }),
  secondaryColor: varchar({ length: 20 }),
  letterHeadHeaderImg: json().$type<imageUrls>(),
  letterHeadFooterImg: json().$type<imageUrls>(),
  signatureImg: json().$type<imageUrls>(),
  showLogo: boolean().default(true),
  showLetterHead: boolean().default(false),
  showSignature: boolean().default(false),
  showCompanySnapshot: boolean().default(true),
  showPaymentMethods: boolean().default(true),
  showNotes: boolean().default(true),
  showTerms: boolean().default(true),
  showItemTable: boolean().default(true),

  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
