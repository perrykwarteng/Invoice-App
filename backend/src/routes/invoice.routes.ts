import { Router } from "express";
import { authRequest } from "../middleware/auth.middleware.js";
import {
  createInvoice,
  deleteInvoice,
  editInvoice,
  getInvoiceById,
  invoiceStat,
  listInvoices,
} from "../controllers/invoice.controller.js";
import { upload } from "../middleware/uploads.js";

const routes = Router();

routes.post(
  "/invoices",
  authRequest,
  upload.fields([
    { name: "companyLogo}" },
    { name: "letterHeadHeaderImg" },
    { name: "letterHeadFooterImg" },
    { name: "signatureImg" },
  ]),
  createInvoice,
);
routes.get("/invoices", authRequest, listInvoices);
routes.get("/invoices/:id", authRequest, getInvoiceById);
routes.patch(
  "/invoices/:id",
  authRequest,
  upload.fields([
    { name: "companyLogo}" },
    { name: "letterHeadHeaderImg" },
    { name: "letterHeadFooterImg" },
    { name: "signatureImg" },
  ]),
  editInvoice,
);
routes.delete("/invoices/:id", authRequest, deleteInvoice);
routes.get("/stats", authRequest, invoiceStat);

export default routes;
