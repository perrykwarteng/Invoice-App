import { Router } from "express";
import {
  addUsers,
  deleteUser,
  getUsers,
  updateUser,
} from "../controllers/users.controller.js";
import { authRequest } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/uploads.js";
import { me } from "../controllers/auth.controller.js";

const routes = Router();

routes.get("/users", authRequest, getUsers);
routes.get("/users/me", authRequest, me);
routes.post("/users", authRequest, upload.single("profilePic"), addUsers);
routes.patch(
  "/users/:id",
  authRequest,
  upload.single("profilePic"),
  updateUser,
);
routes.delete("/users/:id", authRequest, deleteUser);

export default routes;
