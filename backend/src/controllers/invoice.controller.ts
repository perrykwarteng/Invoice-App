import { Request, Response } from "express";
import { AuthUser } from "../types/auth.js";
import { and, count, eq, gte, lt, lte, ne } from "drizzle-orm";

import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../services/fileUpload.js";
import {
  CompanySnapshot,
  InvoiceCustomization,
  Items,
} from "../types/types.js";
import { clients } from "../config/db/tables/clients.js";
import { db } from "../config/db/index.js";
import { settings } from "../config/db/tables/settings.js";
import { invoices } from "../config/db/tables/invoice.js";
import { invoiceItems } from "../config/db/tables/invoiceItem.js";
import { users } from "../config/db/tables/users.js";
import { invoiceCustomizations } from "../config/db/tables/invoiceCustomization.js";
import { subItems } from "../config/db/tables/subItem.js";

export const createInvoice = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const {
    invoiceNumber,
    status,
    clientId,
    currency,
    issueDate,
    dueDate,
    subtotal,
    discountValue,
    vatPercentage,
    nhilPercentage,
    getfundPercentage,
    taxAmount,
    totalAmount,
    notes,
    terms,
    companySnapshot,
    invoiceCustomization,
    invoiceItem,
  } = req.body;
  const file: any = req.files as Express.Multer.File[];

  if (!authUser.organisationId)
    return res.status(400).json({ message: "Sorry no organisation found" });

  if (!authUser.userId)
    return res.status(400).json({ message: "Sorry no user found" });

  const allowedRoles = ["super_admin", "org_admin", "staff"];

  if (!allowedRoles.includes(authUser.role))
    return res.status(403).json({ message: "Sorry access denied" });

  if (!invoiceNumber) {
    return res.status(400).json({
      message: `${status === "draft" ? "Sorry Invoice Number Needed to Draft Invoice" : "Sorry Invoice Number Needed to Save Invoice"}`,
    });
  }

  let companySnapshotObj: any = null;
  let invoiceItemArr: any[] = [];

  try {
    if (companySnapshot) companySnapshotObj = JSON.parse(companySnapshot);
    if (invoiceItem) {
      const parsed = JSON.parse(invoiceItem);
      invoiceItemArr = Array.isArray(parsed) ? parsed : [parsed];
    }
  } catch (parseError) {
    return res.status(400).json({
      message:
        "Invalid format for companySnapshot or invoiceItem. Ensure they are JSON strings.",
    });
  }

  if (status === "saved") {
    if (!issueDate || !dueDate) {
      return res.status(400).json({
        message: "Issue Date and Due Date are required.",
      });
    }
  }
  const issueDateChange =
    issueDate && !isNaN(new Date(issueDate).getTime())
      ? new Date(issueDate)
      : null;

  const dueDateChange =
    dueDate && !isNaN(new Date(dueDate).getTime()) ? new Date(dueDate) : null;

  const numericFields = {
    subtotal,
    discountValue,
    vatPercentage,
    nhilPercentage,
    getfundPercentage,
    taxAmount,
    totalAmount,
  };

  const parsedNumbers: Record<string, number> = {};
  for (const [key, value] of Object.entries(numericFields)) {
    if (value === undefined || value === null || value === "") continue;
    const num = Number(value);
    if (isNaN(num)) {
      return res
        .status(400)
        .json({ message: `Invalid numeric value for ${key}` });
    }
    parsedNumbers[key] = num;
  }

  if (status === "saved") {
    if (
      !invoiceNumber ||
      !status ||
      !clientId ||
      !currency ||
      parsedNumbers.subtotal === undefined ||
      parsedNumbers.discountValue === undefined ||
      parsedNumbers.vatPercentage === undefined ||
      parsedNumbers.nhilPercentage === undefined ||
      parsedNumbers.getfundPercentage === undefined ||
      parsedNumbers.taxAmount === undefined ||
      parsedNumbers.totalAmount === undefined ||
      !companySnapshotObj ||
      invoiceItemArr.length === 0
    ) {
      return res.status(400).json({ message: "All fields are to be filled" });
    }
  }

  for (const item of invoiceItemArr) {
    const qty = Number(item.quantity);
    const price = Number(item.unitPrice);

    if (status === "saved") {
      if (!item.itemName || isNaN(qty) || isNaN(price)) {
        return res.status(400).json({
          message: `Invalid invoice item: ${item.itemName ?? "unnamed item"}`,
        });
      }
    }
  }

  const expectedTotal =
    (parsedNumbers.subtotal ?? 0) -
    (parsedNumbers.discountValue ?? 0) +
    (parsedNumbers.taxAmount ?? 0);
  const providedTotal = parsedNumbers.totalAmount ?? 0;
  if (Math.abs(expectedTotal - providedTotal) > 0.01) {
    return res.status(400).json({
      message: "Total amount does not match subtotal, discount, and tax",
    });
  }

  try {
    const organisationId = Number(authUser.organisationId);
    const userId = authUser.userId;

    if (clientId) {
      const [ownedClient] = await db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.id, Number(clientId)),
            eq(clients.organisationId, organisationId),
          ),
        );

      if (!ownedClient) {
        return res.status(403).json({
          message: "Sorry, this client does not belong to your organisation",
        });
      }
    }

    const [orgSettings] = await db
      .select()
      .from(settings)
      .where(eq(settings.organisationId, organisationId));

    const nextNumber = orgSettings?.nextInvoiceNumber! + 1;

    const [checkInvoice] = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.invoiceNumber, invoiceNumber),
          eq(invoices.organisationId, organisationId),
        ),
      );

    if (checkInvoice) {
      return res.status(400).json({ message: "Invoice Already Exists" });
    }

    const safeSubtotal = parsedNumbers.subtotal ?? 0;
    const safeDiscount = parsedNumbers.discountValue ?? 0;
    const safeVat = parsedNumbers.vatPercentage ?? 0;
    const safeNhil = parsedNumbers.nhilPercentage ?? 0;
    const safeGetfund = parsedNumbers.getfundPercentage ?? 0;
    const safeTaxAmount = parsedNumbers.taxAmount ?? 0;
    const safeTotalAmount = parsedNumbers.totalAmount ?? 0;

    const customization: InvoiceCustomization =
      JSON.parse(invoiceCustomization);

    const uploadResults: {
      companyLogo?: { secure_url: string; public_id: string };
      letterHeadHeaderImg?: { secure_url: string; public_id: string };
      letterHeadFooterImg?: { secure_url: string; public_id: string };
      signatureImg?: { secure_url: string; public_id: string };
    } = {};

    const uploadPromises: Promise<void>[] = [];

    if (file?.["companyLogo"]?.[0]?.path) {
      uploadPromises.push(
        uploadToCloudinary(file["companyLogo"][0].path).then((res) => {
          if (res) uploadResults.companyLogo = res;
        }),
      );
    }

    if (file?.["letterHeadHeaderImg"]?.[0]?.path) {
      uploadPromises.push(
        uploadToCloudinary(file["letterHeadHeaderImg"][0].path).then((res) => {
          if (res) uploadResults.letterHeadHeaderImg = res;
        }),
      );
    }

    if (file?.["letterHeadFooterImg"]?.[0]?.path) {
      uploadPromises.push(
        uploadToCloudinary(file["letterHeadFooterImg"][0].path).then((res) => {
          if (res) uploadResults.letterHeadFooterImg = res;
        }),
      );
    }

    if (file?.["signatureImg"]?.[0]?.path) {
      uploadPromises.push(
        uploadToCloudinary(file["signatureImg"][0].path).then((res) => {
          if (res) uploadResults.signatureImg = res;
        }),
      );
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }

    const logo = uploadResults.companyLogo
      ? {
          imageUrl: uploadResults.companyLogo?.secure_url,
          public_id: uploadResults.companyLogo?.public_id,
        }
      : companySnapshotObj
        ? {
            imageUrl: companySnapshotObj.logo.imageUrl,
            public_id: companySnapshotObj.logo.public_id,
          }
        : { imageUrl: null, public_id: null };

    const letterHeaderImage = uploadResults.letterHeadHeaderImg
      ? {
          imageUrl: uploadResults.letterHeadHeaderImg?.secure_url,
          public_id: uploadResults.letterHeadHeaderImg?.public_id,
        }
      : customization.letterHeadHeaderImg
        ? {
            imageUrl: customization?.letterHeadHeaderImg?.imageUrl,
            public_id: customization?.letterHeadHeaderImg?.public_id,
          }
        : {};

    const letterFooterImage = uploadResults.letterHeadFooterImg
      ? {
          imageUrl: uploadResults.letterHeadFooterImg?.secure_url,
          public_id: uploadResults.letterHeadFooterImg?.public_id,
        }
      : customization.letterHeadFooterImg
        ? {
            imageUrl: customization?.letterHeadFooterImg?.imageUrl,
            public_id: customization?.letterHeadFooterImg?.public_id,
          }
        : {};

    const signatureImage = uploadResults.signatureImg
      ? {
          imageUrl: uploadResults.signatureImg?.secure_url,
          public_id: uploadResults.signatureImg?.public_id,
        }
      : customization.signatureImg
        ? {
            imageUrl: customization?.signatureImg?.imageUrl,
            public_id: customization?.signatureImg?.public_id,
          }
        : {};

    const snapShot: CompanySnapshot = {
      name: companySnapshotObj?.name,
      email: companySnapshotObj?.email,
      address: companySnapshotObj?.address,
      invoicePrefix: companySnapshotObj?.invoicePrefix,
      paymentMethods: companySnapshotObj?.paymentMethods,
      logo,
    };

    let invoiceId: number | undefined;

    await db.transaction(async (tx) => {
      const newInvoice = await tx
        .insert(invoices)
        .values({
          organisationId,
          clientId: clientId ? Number(clientId) : null,
          createdBy: userId,
          invoiceNumber,
          status,
          currency,
          issueDate: issueDateChange,
          dueDate: dueDateChange,
          subtotal: String(safeSubtotal),
          discountValue: String(safeDiscount),
          vatPercentage: String(safeVat),
          nhilPercentage: String(safeNhil),
          getfundPercentage: String(safeGetfund),
          taxAmount: String(safeTaxAmount),
          totalAmount: String(safeTotalAmount),
          notes,
          terms,
          companySnapshot: snapShot,
        })
        .$returningId();

      invoiceId = newInvoice[0]?.id;

      if (!invoiceId) throw new Error("Failed to retrieve new Invoice ID");

      if (invoiceItemArr.length > 0) {
        const itemsToInsert = invoiceItemArr.map((item: any) => ({
          invoiceId: Number(invoiceId),
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: String(Number(item.quantity) * Number(item.unitPrice)),
        }));

        const item = await tx
          .insert(invoiceItems)
          .values(itemsToInsert)
          .$returningId();

        const itemId = item;

        const allSubItems = [];

        for (let i = 0; i < invoiceItemArr.length; i++) {
          const invoiceItemId = itemId[i]?.id;

          const subs = invoiceItemArr[i].subItems ?? [];

          for (const sub of subs) {
            allSubItems.push({
              invoiceItemId: Number(invoiceItemId),
              subItemName: sub.subItemName,
              subItemPrice: sub.subItemPrice,
            });
          }
        }

        if (allSubItems.length) {
          await tx.insert(subItems).values(allSubItems);
        }
      }
      await tx.update(settings).set({
        nextInvoiceNumber: Number(nextNumber),
      });
      await tx.insert(invoiceCustomizations).values({
        invoiceId: Number(invoiceId),
        primaryColor: customization.primaryColor,
        secondaryColor: customization.secondaryColor,
        letterHeadHeaderImg: {
          imageUrl: letterHeaderImage.imageUrl || "",
          public_id: letterHeaderImage.public_id || "",
        },
        letterHeadFooterImg: {
          imageUrl: letterFooterImage.imageUrl || "",
          public_id: letterFooterImage.public_id || "",
        },
        signatureImg: {
          imageUrl: signatureImage.imageUrl || "",
          public_id: signatureImage.public_id || "",
        },
        showLogo: customization.showLogo,
        showLetterHead: customization.showLetterHead,
        showSignature: customization.showSignature,
        showCompanySnapshot: customization.showCompanySnapshot,
        showPaymentMethods: customization.showPaymentMethods,
        showNotes: customization.showNotes,
        showTerms: customization.showTerms,
        showItemTable: customization.showItemTable,
      });
    });

    res.status(201).json({
      message: `${status === "draft" ? "Invoice Saved in Draft Successfully" : "Invoice Created Successfully"}`,
      invoiceId,
      totalAmount: safeTotalAmount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const listInvoices = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;

  if (!authUser.organisationId)
    return res.status(400).json({ message: "Sorry no organisation found" });

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;

  try {
    const organisationId = Number(authUser.organisationId);
    const results = await db
      .select()
      .from(invoices)
      .leftJoin(
        clients,
        and(
          eq(clients.id, invoices.clientId),
          eq(clients.organisationId, invoices.organisationId),
        ),
      )
      .where(eq(invoices.organisationId, organisationId))
      .limit(limit)
      .offset(offset);

    const formattedResults = results.map(({ invoices, clients }) => ({
      ...invoices,
      client: clients
        ? {
            id: clients.id,
            organisationId: clients.organisationId,
            createdBy: clients.createdBy,
            name: clients.name,
            email: clients.email,
            address: clients.address,
            createdAt: clients.createdAt,
            updatedAt: clients.updatedAt,
          }
        : null,
    }));

    const totalCount = await db.$count(
      invoices,
      eq(invoices.organisationId, organisationId),
    );

    return res.status(200).json({
      message: "Invoices Retrieved Successfully",
      page,
      limit,
      count: results.length,
      totalCount,
      totalPages: Math.max(Math.ceil(totalCount / limit), 1),
      data: formattedResults,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const { id } = req.params;

  if (!authUser.organisationId)
    return res.status(400).json({ message: "Sorry no organisation found" });

  if (!id || isNaN(Number(id)))
    return res.status(400).json({ message: "Valid invoice id required" });

  try {
    const organisationId = Number(authUser.organisationId);

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.id, Number(id)),
          eq(invoices.organisationId, organisationId),
        ),
      );

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const [clientDetails] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, Number(invoice.clientId)));

    const items = await db
      .select()
      .from(invoiceItems)
      .leftJoin(subItems, eq(invoiceItems.id, subItems.invoiceItemId))
      .where(eq(invoiceItems.invoiceId, invoice.id));

    const result: Record<number, any> = {};

    items.forEach((curr) => {
      const id = curr.invoice_items.id;

      if (!result[id]) {
        result[id] = {
          ...curr.invoice_items,
          subItems: [],
        };
      }

      if (curr.sub_item?.id) {
        result[id].subItems.push({
          id: curr.sub_item.id,
          invoiceItemId: curr.sub_item.invoiceItemId,
          subItemName: curr.sub_item.subItemName,
          subItemPrice: curr.sub_item.subItemPrice,
          createdAt: curr.sub_item.createdAt,
          updatedAt: curr.sub_item.updatedAt,
        });
      }
    });

    const formattedItems = Object.values(result);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(invoice.createdBy)));

    const [invoiceCustomization] = await db
      .select()
      .from(invoiceCustomizations)
      .where(eq(invoiceCustomizations?.invoiceId, invoice.id))
      .limit(1);

    return res.status(200).json({
      message: "Invoice Retrieved Successfully",
      data: {
        ...{
          id: invoice.id,
          organisationId: invoice.organisationId,
          clientInfo: {
            id: clientDetails?.id,
            name: clientDetails?.name,
            email: clientDetails?.email,
            address: clientDetails?.address,
          },
          createdBy: user?.name,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          currency: invoice.currency,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          subtotal: invoice.subtotal,
          discountValue: invoice.discountValue,
          vatPercentage: invoice.vatPercentage,
          nhilPercentage: invoice.nhilPercentage,
          getfundPercentage: invoice.getfundPercentage,
          taxAmount: invoice.taxAmount,
          totalAmount: invoice.totalAmount,
          notes: invoice.notes,
          terms: invoice.terms,
          companySnapshot: invoice.companySnapshot,
          createdAt: invoice.createdAt,
          updatedAt: invoice.updatedAt,
        },
        items: formattedItems,
        invoiceCustomization,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const editInvoice = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const { id } = req.params;
  const files = req.files as {
    companyLogo?: Express.Multer.File[];
    letterHeadHeaderImg?: Express.Multer.File[];
    letterHeadFooterImg?: Express.Multer.File[];
    signatureImg?: Express.Multer.File[];
  };

  if (!authUser.organisationId)
    return res.status(400).json({ message: "Sorry no organisation found" });

  if (!authUser.userId)
    return res.status(400).json({ message: "Sorry no user found" });

  const allowedRoles = ["super_admin", "org_admin", "staff"];
  if (!allowedRoles.includes(authUser.role))
    return res.status(403).json({ message: "Sorry access denied" });

  if (!id || isNaN(Number(id)))
    return res.status(400).json({ message: "Valid invoice id required" });

  const {
    invoiceNumber,
    status,
    clientId,
    currency,
    issueDate,
    dueDate,
    subtotal,
    discountValue,
    vatPercentage,
    nhilPercentage,
    getfundPercentage,
    taxAmount,
    totalAmount,
    notes,
    terms,
    companySnapshot,
    invoiceItem,
    invoiceCustomization,
  } = req.body;

  let companySnapshotObj: any = null;
  let invoiceItemArr: any[] | null = null;
  let customizationObj: any = null;

  try {
    if (companySnapshot) companySnapshotObj = JSON.parse(companySnapshot);
    if (invoiceItem) {
      const parsed = JSON.parse(invoiceItem);
      invoiceItemArr = Array.isArray(parsed) ? parsed : [parsed];
    }
    if (invoiceCustomization)
      customizationObj = JSON.parse(invoiceCustomization);
  } catch (parseError) {
    return res.status(400).json({
      message:
        "Invalid format for companySnapshot, invoiceItem, or invoiceCustomization. Ensure they are JSON strings.",
    });
  }

  const numericFields = {
    subtotal,
    discountValue,
    vatPercentage,
    nhilPercentage,
    getfundPercentage,
    taxAmount,
    totalAmount,
  };

  const parsedNumbers: Record<string, number> = {};
  for (const [key, value] of Object.entries(numericFields)) {
    if (value === undefined || value === null || value === "") continue;
    const num = Number(value);
    if (isNaN(num)) {
      return res
        .status(400)
        .json({ message: `Invalid numeric value for ${key}` });
    }
    parsedNumbers[key] = num;
  }

  if (invoiceItemArr) {
    for (const item of invoiceItemArr) {
      const qty = Number(item.quantity);
      const price = Number(item.unitPrice);
      if (!item.itemName || isNaN(qty) || isNaN(price)) {
        return res.status(400).json({
          message: `Invalid invoice item: ${item.itemName ?? "unnamed item"}`,
        });
      }
    }
  }

  try {
    const organisationId = Number(authUser.organisationId);

    const [existingInvoice] = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.id, Number(id)),
          eq(invoices.organisationId, organisationId),
        ),
      );

    if (!existingInvoice)
      return res.status(404).json({ message: "Invoice not found" });

    const [existingCustomization] = await db
      .select()
      .from(invoiceCustomizations)
      .where(eq(invoiceCustomizations.invoiceId, Number(id)));

    if (clientId) {
      const [ownedClient] = await db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.id, Number(clientId)),
            eq(clients.organisationId, organisationId),
          ),
        );

      if (!ownedClient) {
        return res.status(403).json({
          message: "Sorry, this client does not belong to your organisation",
        });
      }
    }

    if (invoiceNumber && invoiceNumber !== existingInvoice.invoiceNumber) {
      const [checkInvoice] = await db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.invoiceNumber, invoiceNumber),
            eq(invoices.organisationId, organisationId),
          ),
        );

      if (checkInvoice) {
        return res
          .status(400)
          .json({ message: "Invoice Number Already Exists" });
      }
    }

    const uploadResults: {
      companyLogo?: { secure_url: string; public_id: string };
      letterHeadHeaderImg?: { secure_url: string; public_id: string };
      letterHeadFooterImg?: { secure_url: string; public_id: string };
      signatureImg?: { secure_url: string; public_id: string };
    } = {};

    const uploadPromises: Promise<void>[] = [];

    if (files?.companyLogo?.[0]?.path) {
      uploadPromises.push(
        uploadToCloudinary(files.companyLogo[0].path).then((res) => {
          if (res) uploadResults.companyLogo = res;
        }),
      );
    }

    if (files?.letterHeadHeaderImg?.[0]?.path) {
      uploadPromises.push(
        uploadToCloudinary(files.letterHeadHeaderImg[0].path).then((res) => {
          if (res) uploadResults.letterHeadHeaderImg = res;
        }),
      );
    }

    if (files?.letterHeadFooterImg?.[0]?.path) {
      uploadPromises.push(
        uploadToCloudinary(files.letterHeadFooterImg[0].path).then((res) => {
          if (res) uploadResults.letterHeadFooterImg = res;
        }),
      );
    }

    if (files?.signatureImg?.[0]?.path) {
      uploadPromises.push(
        uploadToCloudinary(files.signatureImg[0].path).then((res) => {
          if (res) uploadResults.signatureImg = res;
        }),
      );
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }

    const oldLogoPublicId = (existingInvoice.companySnapshot as any)?.logo
      ?.public_id;
    const oldLetterHeadHeaderPublicId = (existingCustomization as any)
      ?.letterHeadHeaderImg?.public_id;
    const oldLetterHeadFooterPublicId = (existingCustomization as any)
      ?.letterHeadFooterImg?.public_id;
    const oldSignaturePublicId = (existingCustomization as any)?.signatureImg
      ?.public_id;

    const cleanupTasks: Promise<any>[] = [];
    if (uploadResults.companyLogo && oldLogoPublicId) {
      cleanupTasks.push(deleteFromCloudinary(oldLogoPublicId));
    }
    if (uploadResults.letterHeadHeaderImg && oldLetterHeadHeaderPublicId) {
      cleanupTasks.push(deleteFromCloudinary(oldLetterHeadHeaderPublicId));
    }

    if (uploadResults.letterHeadFooterImg && oldLetterHeadFooterPublicId) {
      cleanupTasks.push(deleteFromCloudinary(oldLetterHeadFooterPublicId));
    }

    if (uploadResults.signatureImg && oldSignaturePublicId) {
      cleanupTasks.push(deleteFromCloudinary(oldSignaturePublicId));
    }
    if (cleanupTasks.length > 0) {
      try {
        await Promise.all(cleanupTasks);
      } catch (cleanupError) {
        console.error("Failed to delete old asset(s):", cleanupError);
      }
    }

    const logo = uploadResults.companyLogo
      ? {
          imageUrl: uploadResults.companyLogo.secure_url,
          public_id: uploadResults.companyLogo.public_id,
        }
      : {
          imageUrl:
            (companySnapshotObj?.logo?.imageUrl ?? oldLogoPublicId)
              ? (existingInvoice.companySnapshot as any)?.logo?.imageUrl
              : companySnapshotObj?.logo?.imageUrl,
          public_id:
            companySnapshotObj?.logo?.public_id ??
            (existingInvoice.companySnapshot as any)?.logo?.public_id,
        };

    const letterHeadHeaderImage = uploadResults.letterHeadHeaderImg
      ? {
          imageUrl: uploadResults.letterHeadHeaderImg.secure_url,
          public_id: uploadResults.letterHeadHeaderImg.public_id,
        }
      : {
          imageUrl:
            (existingCustomization as any)?.letterHeadHeaderImg?.imageUrl ??
            null,
          public_id:
            (existingCustomization as any)?.letterHeadHeaderImg?.public_id ??
            null,
        };

    const letterHeadFooterImage = uploadResults.letterHeadFooterImg
      ? {
          imageUrl: uploadResults.letterHeadFooterImg.secure_url,
          public_id: uploadResults.letterHeadFooterImg.public_id,
        }
      : {
          imageUrl:
            (existingCustomization as any)?.letterHeadFooterImg?.imageUrl ??
            null,
          public_id:
            (existingCustomization as any)?.letterHeadFooterImg?.public_id ??
            null,
        };

    const signatureImage = uploadResults.signatureImg
      ? {
          imageUrl: uploadResults.signatureImg.secure_url,
          public_id: uploadResults.signatureImg.public_id,
        }
      : {
          imageUrl:
            (existingCustomization as any)?.signatureImg?.imageUrl ?? null,
          public_id:
            (existingCustomization as any)?.signatureImg?.public_id ?? null,
        };

    const snapShot: CompanySnapshot = {
      name:
        companySnapshotObj?.name ??
        (existingInvoice.companySnapshot as any)?.name,
      email:
        companySnapshotObj?.email ??
        (existingInvoice.companySnapshot as any)?.email,
      address:
        companySnapshotObj?.address ??
        (existingInvoice.companySnapshot as any)?.address,
      invoicePrefix:
        companySnapshotObj?.invoicePrefix ??
        (existingInvoice.companySnapshot as any)?.invoicePrefix,
      paymentMethods:
        companySnapshotObj?.paymentMethods ??
        (existingInvoice.companySnapshot as any)?.paymentMethods,
      logo,
    };

    const updateValues: Record<string, any> = {};

    if (invoiceNumber !== undefined) updateValues.invoiceNumber = invoiceNumber;
    if (status !== undefined) updateValues.status = status;
    if (clientId !== undefined) updateValues.clientId = Number(clientId);
    if (currency !== undefined) updateValues.currency = currency;
    if (notes !== undefined) updateValues.notes = notes;
    if (terms !== undefined) updateValues.terms = terms;
    if (companySnapshotObj || uploadResults.companyLogo) {
      updateValues.companySnapshot = snapShot;
    }

    if (issueDate) {
      const issueDateChange = new Date(issueDate);
      if (isNaN(issueDateChange.getTime()))
        return res.status(400).json({ message: "Invalid issue date" });
      updateValues.issueDate = issueDateChange;
    }

    if (dueDate) {
      const dueDateChange = new Date(dueDate);
      if (isNaN(dueDateChange.getTime()))
        return res.status(400).json({ message: "Invalid due date" });
      updateValues.dueDate = dueDateChange;
    }

    for (const key of Object.keys(numericFields)) {
      if (parsedNumbers[key] !== undefined) {
        updateValues[key] = String(parsedNumbers[key]);
      }
    }

    if (status === "saved") {
      const merged = { ...existingInvoice, ...updateValues };
      if (
        !merged.invoiceNumber ||
        !merged.clientId ||
        !merged.currency ||
        !merged.issueDate ||
        !merged.dueDate ||
        merged.subtotal === undefined ||
        merged.discountValue === undefined ||
        merged.vatPercentage === undefined ||
        merged.nhilPercentage === undefined ||
        merged.getfundPercentage === undefined ||
        merged.taxAmount === undefined ||
        merged.totalAmount === undefined ||
        !snapShot.name ||
        (!invoiceItemArr && !existingInvoice.id)
      ) {
        return res.status(400).json({
          message: "All fields are to be filled to save this invoice",
        });
      }
    }

    await db.transaction(async (tx) => {
      if (Object.keys(updateValues).length > 0) {
        await tx
          .update(invoices)
          .set(updateValues)
          .where(eq(invoices.id, Number(id)));
      }

      if (invoiceItemArr) {
        const invoiceItemsFound = await tx
          .select({ id: invoiceItems.id })
          .from(invoiceItems)
          .where(eq(invoiceItems.invoiceId, Number(id)));

        for (const item of invoiceItemsFound) {
          await tx.delete(subItems).where(eq(subItems.invoiceItemId, item.id));
        }

        await tx
          .delete(invoiceItems)
          .where(eq(invoiceItems.invoiceId, Number(id)));

        const itemsToInsert = invoiceItemArr.map((item: any) => {
          const qty = Number(item.quantity);
          const price = Number(item.unitPrice);
          return {
            invoiceId: Number(id),
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: String(qty * price),
          };
        });

        const insertedItems = await tx
          .insert(invoiceItems)
          .values(itemsToInsert)
          .$returningId();

        const allSubItems = [];

        for (let i = 0; i < invoiceItemArr.length; i++) {
          const invoiceItemId = insertedItems[i]?.id;

          const subs = invoiceItemArr[i].subItems ?? [];

          for (const sub of subs) {
            allSubItems.push({
              invoiceItemId: Number(invoiceItemId),
              subItemName: sub.subItemName,
              subItemPrice: sub.subItemPrice,
            });
          }
        }

        if (allSubItems.length) {
          await tx.insert(subItems).values(allSubItems);
        }
      }

      const hasCustomizationChange =
        customizationObj ||
        uploadResults.letterHeadHeaderImg ||
        uploadResults.letterHeadFooterImg ||
        uploadResults.signatureImg;

      if (hasCustomizationChange) {
        const customizationValues = {
          primaryColor:
            customizationObj?.primaryColor ??
            existingCustomization?.primaryColor,
          secondaryColor:
            customizationObj?.secondaryColor ??
            existingCustomization?.secondaryColor,
          letterHeadHeaderImg: letterHeadHeaderImage,
          letterHeadFooterImg: letterHeadFooterImage,
          signatureImg: signatureImage,
          showLogo:
            customizationObj?.showLogo ?? existingCustomization?.showLogo,
          showLetterHead:
            customizationObj?.showLetterHead ??
            existingCustomization?.showLetterHead,
          showSignature:
            customizationObj?.showSignature ??
            existingCustomization?.showSignature,
          showCompanySnapshot:
            customizationObj?.showCompanySnapshot ??
            existingCustomization?.showCompanySnapshot,
          showPaymentMethods:
            customizationObj?.showPaymentMethods ??
            existingCustomization?.showPaymentMethods,
          showNotes:
            customizationObj?.showNotes ?? existingCustomization?.showNotes,
          showTerms:
            customizationObj?.showTerms ?? existingCustomization?.showTerms,
          showItemTable:
            customizationObj?.showItemTable ??
            existingCustomization?.showItemTable,
        };

        if (existingCustomization) {
          await tx
            .update(invoiceCustomizations)
            .set(customizationValues)
            .where(eq(invoiceCustomizations.invoiceId, Number(id)));
        } else {
          await tx.insert(invoiceCustomizations).values({
            invoiceId: Number(id),
            ...customizationValues,
          });
        }
      }
    });

    return res.status(200).json({ message: "Invoice Updated Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const { id } = req.params;

  if (!authUser.organisationId)
    return res.status(400).json({ message: "Sorry no organisation found" });

  const allowedRoles = ["super_admin", "org_admin"];
  if (!allowedRoles.includes(authUser.role))
    return res.status(403).json({ message: "Sorry access denied" });

  if (!id || isNaN(Number(id)))
    return res.status(400).json({ message: "Valid invoice id required" });

  try {
    const organisationId = Number(authUser.organisationId);

    const [existingInvoice] = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.id, Number(id)),
          eq(invoices.organisationId, organisationId),
        ),
      );

    if (!existingInvoice)
      return res.status(404).json({ message: "Invoice not found" });

    await db.transaction(async (tx) => {
      await tx
        .delete(invoiceItems)
        .where(eq(invoiceItems.invoiceId, Number(id)));

      await tx.delete(invoices).where(eq(invoices.id, Number(id)));
    });

    return res.status(200).json({ message: "Invoice Deleted Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const invoiceStat = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;

  if (!authUser.organisationId) {
    return res.status(400).json({
      message: "Sorry no organisation found",
    });
  }

  try {
    const organisationId = Number(authUser.organisationId);

    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : null;

    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : null;

    const filters = [eq(invoices.organisationId, organisationId)];

    if (startDate && endDate) {
      filters.push(
        and(
          gte(invoices.createdAt, startDate),
          lte(invoices.createdAt, endDate),
        )!,
      );
    }

    const baseWhere = and(...filters);

    const [total] = await db
      .select({
        count: count(),
      })
      .from(invoices)
      .where(baseWhere);

    const [draft] = await db
      .select({
        count: count(),
      })
      .from(invoices)
      .where(and(baseWhere, eq(invoices.status, "draft")));

    const today = new Date();

    const [overdue] = await db
      .select({
        count: count(),
      })
      .from(invoices)
      .where(
        and(
          baseWhere,
          lte(invoices.issueDate, today),
          lt(invoices.dueDate, today),
        ),
      );

    return res.status(200).json({
      message: "Invoice Stats Retrieved Successfully",
      data: {
        totalInvoices: Number(total?.count ?? 0),
        draftInvoices: Number(draft?.count ?? 0),
        overdueInvoices: Number(overdue?.count ?? 0),
      },
    });
  } catch (error) {
    console.error("Invoice stat error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
