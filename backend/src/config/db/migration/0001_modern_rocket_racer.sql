ALTER TABLE `invoices` DROP INDEX `invoices_invoiceNumber_unique`;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `organisation_invoice_unique` UNIQUE(`organisationId`,`invoiceNumber`);