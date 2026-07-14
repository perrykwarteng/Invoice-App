import { Request, Response } from "express";
import { AuthUser } from "../types/auth.js";

import { and, eq } from "drizzle-orm";
import { clients } from "../config/db/tables/clients.js";
import { db } from "../config/db/index.js";

export const getClients = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;

  if (!authUser.organisationId) {
    return res.status(400).json({
      message: "No organisation found",
    });
  }

  if (!authUser.userId)
    return res.status(400).json({ message: "No user found" });

  try {
    let query = await db.select().from(clients);

    const allowedRoles = ["org_admin", "staff"];
    if (allowedRoles.includes(authUser.role)) {
      query = await db
        .select()
        .from(clients)
        .where(eq(clients.organisationId, Number(authUser.organisationId)));
    }

    const clientsList = query;

    return res.status(200).json({
      message: "Clients fetched successfully",
      data: clientsList,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const addClients = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const { organisationId, userId } = authUser;
  const { email, name, address } = req.body;

  if (!organisationId)
    return res.status(400).json({ message: "No organisation found" });

  if (!userId) return res.status(400).json({ message: "No user found" });

  if (!name || !email || !address) {
    return res.status(400).json({
      message: "Name, email and address are required",
    });
  }

  try {
    const [clientExist] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.email, email),
          eq(clients.organisationId, organisationId),
        ),
      );

    if (clientExist) {
      return res.status(400).json({
        message: "Client already exists",
      });
    }

    const [newClient] = await db.insert(clients).values({
      organisationId: organisationId,
      createdBy: userId,
      name,
      email,
      address,
    });

    res
      .status(201)
      .json({ message: "Created client successfully", data: newClient });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const { id } = req.params;
  const { name, email, address } = req.body;
  const clientId = Number(id);

  if (!authUser.organisationId) {
    return res.status(400).json({
      message: "No organisation found",
    });
  }

  try {
    const [client] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.organisationId, Number(authUser.organisationId)),
        ),
      );

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    if (email && email !== client.email) {
      const [existingClient] = await db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.email, email),
            eq(clients.organisationId, Number(authUser.organisationId)),
          ),
        );

      if (existingClient) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }
    }

    await db
      .update(clients)
      .set({
        name,
        email,
        address,
      })
      .where(eq(clients.id, clientId));

    return res.status(200).json({
      message: "Client updated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const { id } = req.params;
  const clientId = Number(id);

  if (!authUser.organisationId) {
    return res.status(400).json({
      message: "No organisation found",
    });
  }

  try {
    const [client] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.organisationId, authUser.organisationId),
        ),
      );

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    await db.delete(clients).where(eq(clients.id, clientId));

    return res.status(200).json({
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
