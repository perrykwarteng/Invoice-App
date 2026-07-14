import { Router } from "express";
import { authRequest } from "../middleware/auth.middleware.js";
import {
  changePassword,
  changeProfilePicture,
  companyProfile,
  getSettings,
  paymentMethod,
  updateInvoiceCustomization,
} from "../controllers/settings.controller.js";
import { upload } from "../middleware/uploads.js";

const routes = Router();

routes.get("/settings", authRequest, getSettings);
routes.patch(
  "/settings/companyProfile",
  authRequest,
  upload.single("companyLogo"),
  companyProfile,
);
routes.patch("/settings/paymentMethod", authRequest, paymentMethod);
routes.patch(
  "/settings/profilePic",
  authRequest,
  upload.single("profilePic"),
  changeProfilePicture,
);
routes.patch(
  "/settings/updateInvoiceCustomization",
  authRequest,
  upload.fields([
    { name: "letterHeadHeaderImg" },
    { name: "letterHeadFooterImg" },
    { name: "signatureImg" },
  ]),
  updateInvoiceCustomization,
);
routes.patch("/settings/changePassword", authRequest, changePassword);

export default routes;
