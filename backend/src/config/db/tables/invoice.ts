import { organisations } from "./organisations.js";
import { clients } from "./clients.js";
import { users } from "./users.js";

import {
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const invoices = mysqlTable(
  "invoices",
  {
    id: int().autoincrement().primaryKey(),
    organisationId: int()
      .references(() => organisations.id)
      .notNull(),
    clientId: int().references(() => clients.id),
    createdBy: int()
      .references(() => users.id)
      .notNull(),

    invoiceNumber: varchar({ length: 100 }).notNull(),

    status: mysqlEnum(["draft", "saved"]).default("draft"),
    currency: varchar({ length: 10 }).default("GHS"),
    issueDate: timestamp(),
    dueDate: timestamp(),
    subtotal: decimal({ precision: 10, scale: 2 }).default("0"),
    discountValue: decimal({ precision: 10, scale: 2 }).default("0"),
    vatPercentage: decimal({ precision: 5, scale: 2 }).default("0"),
    nhilPercentage: decimal({ precision: 5, scale: 2 }).default("0"),
    getfundPercentage: decimal({ precision: 5, scale: 2 }).default("0"),
    taxAmount: decimal({ precision: 10, scale: 2 }).default("0"),
    totalAmount: decimal({ precision: 10, scale: 2 }).default("0"),
    notes: varchar({ length: 1000 }),
    terms: varchar({ length: 1000 }),
    companySnapshot: json("company_snapshot"),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow(),
  },
  (table) => ({
    organisationInvoiceUnique: uniqueIndex("organisation_invoice_unique").on(
      table.organisationId,
      table.invoiceNumber,
    ),
  }),
);
