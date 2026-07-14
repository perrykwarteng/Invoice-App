CREATE TABLE `organisations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(100),
	`email` varchar(255) NOT NULL,
	`status` enum('pending','active','inactive','suspended') DEFAULT 'pending',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `organisations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organisationId` int,
	`role` enum('super_admin','org_admin','staff') NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`profilePic` json,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organisation_id` int NOT NULL,
	`createdBy` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`address` varchar(500),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organisationId` int NOT NULL,
	`clientId` int,
	`createdBy` int NOT NULL,
	`invoiceNumber` varchar(100) NOT NULL,
	`status` enum('draft','saved') DEFAULT 'draft',
	`currency` varchar(10) DEFAULT 'GHS',
	`issueDate` timestamp,
	`dueDate` timestamp,
	`subtotal` decimal(10,2) DEFAULT '0',
	`discountValue` decimal(10,2) DEFAULT '0',
	`vatPercentage` decimal(5,2) DEFAULT '0',
	`nhilPercentage` decimal(5,2) DEFAULT '0',
	`getfundPercentage` decimal(5,2) DEFAULT '0',
	`taxAmount` decimal(10,2) DEFAULT '0',
	`totalAmount` decimal(10,2) DEFAULT '0',
	`notes` varchar(1000),
	`terms` varchar(1000),
	`company_snapshot` json,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organisationId` int NOT NULL,
	`defaultCurrency` varchar(10) DEFAULT 'GHS',
	`invoicePrefix` varchar(20) DEFAULT 'INV',
	`nextInvoiceNumber` int DEFAULT 1,
	`paymentTermsDays` int DEFAULT 7,
	`vatRate` varchar(10) DEFAULT '0',
	`nhilRate` varchar(10) DEFAULT '0',
	`getfundRate` varchar(10) DEFAULT '0',
	`companyName` varchar(255),
	`companyAddress` varchar(255),
	`companyPhone` varchar(50),
	`companyEmail` varchar(50),
	`companyWebsite` varchar(255),
	`companyLogo` json,
	`invoiceFooter` varchar(500),
	`paymentMethod` json DEFAULT ('[]'),
	`extras` json,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `otps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`otpCode` varchar(10) NOT NULL,
	`type` enum('login','register','reset_password','forgot_password') NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`isUsed` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `otps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoiceCustomizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`primaryColor` varchar(20),
	`secondaryColor` varchar(20),
	`letterHeadImg` json,
	`signatureImg` json,
	`showLogo` boolean DEFAULT true,
	`showLetterHead` boolean DEFAULT false,
	`showSignature` boolean DEFAULT false,
	`showCompanySnapshot` boolean DEFAULT true,
	`showPaymentMethods` boolean DEFAULT true,
	`showNotes` boolean DEFAULT true,
	`showTerms` boolean DEFAULT true,
	`showItemTable` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoiceCustomizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoiceCustomizations_invoiceId_unique` UNIQUE(`invoiceId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_organisationId_organisations_id_fk` FOREIGN KEY (`organisationId`) REFERENCES `organisations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_organisationId_organisations_id_fk` FOREIGN KEY (`organisationId`) REFERENCES `organisations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_invoiceId_invoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `settings` ADD CONSTRAINT `settings_organisationId_organisations_id_fk` FOREIGN KEY (`organisationId`) REFERENCES `organisations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `otps` ADD CONSTRAINT `otps_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoiceCustomizations` ADD CONSTRAINT `invoiceCustomizations_invoiceId_invoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;