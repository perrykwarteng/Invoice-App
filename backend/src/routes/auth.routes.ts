import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  refreshToken,
  register,
  resendVerificationCode,
  resetPassword,
  verifyOtps,
} from "../controllers/auth.controller.js";
import { authRequest } from "../middleware/auth.middleware.js";

const routes = Router();

routes.post("/register", register);
routes.post("/login", login);
routes.post("/logout", logout);
routes.post("/verifyOtp", verifyOtps);
routes.post("/resendOtp", resendVerificationCode);
routes.post("/forgetPassword", forgotPassword);
routes.post("/resetPassword", resetPassword);
routes.get("/me", authRequest, me);
routes.post("/refresh", authRequest, refreshToken);

export default routes;
