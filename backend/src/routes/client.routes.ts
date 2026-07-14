import { Router } from "express";
import { authRequest } from "../middleware/auth.middleware.js";
import {
  addClients,
  deleteClient,
  getClients,
  updateClient,
} from "../controllers/clients.controller.js";

const routes = Router();

routes.get("/clients", authRequest, getClients);
routes.post("/client", authRequest, addClients);
routes.patch("/client/:id", authRequest, updateClient);
routes.delete("/client/:id", authRequest, deleteClient);

export default routes;
