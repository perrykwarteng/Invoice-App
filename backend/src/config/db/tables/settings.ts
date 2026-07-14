import {
  int,
  json,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { organisations } from "./organisations.js";
import { InvoiceCus, PaymentMethod } from "../../../types/types.js";

export const settings = mysqlTable("settings", {
  id: int().autoincrement().primaryKey(),
  organisationId: int()
    .references(() => organisations.id)
    .notNull(),
  defaultCurrency: varchar({ length: 10 }).default("GHS"),
  invoicePrefix: varchar({ length: 20 }).default("INV"),
  nextInvoiceNumber: int().default(1),
  paymentTermsDays: int().default(7),
  vatRate: varchar({ length: 10 }).default("0"),
  nhilRate: varchar({ length: 10 }).default("0"),
  getfundRate: varchar({ length: 10 }).default("0"),
  companyName: varchar({ length: 255 }),
  companyAddress: varchar({ length: 255 }),
  companyPhone: varchar({ length: 50 }),
  companyEmail: varchar({ length: 50 }),
  companyWebsite: varchar({ length: 255 }),
  companyLogo: json("companyLogo"),
  invoiceFooter: varchar({ length: 500 }),
  paymentMethod: json().$type<PaymentMethod[]>().default([]),
  invoiceCustomization: json().$type<InvoiceCus>(),
  extras: json("extras"),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
