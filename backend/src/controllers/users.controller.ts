import { Request, Response } from "express";
import { AuthUser } from "../types/auth.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "../services/fileUpload.js";
import { db } from "../config/db/index.js";
import { users } from "../config/db/tables/users.js";

export const getUsers = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;

  if (!authUser.organisationId)
    return res.status(400).json({ message: "No organisation found" });

  if (!authUser.userId)
    return res.status(400).json({ message: "No user found" });

  const allowedRoles = ["super_admin", "org_admin"];

  if (!allowedRoles.includes(authUser.role))
    return res.status(403).json({ message: "Access denied" });

  try {
    const organisationId = authUser.organisationId;

    let query = db.select().from(users);
    if (authUser.role === "org_admin") {
      query.where(eq(users.organisationId, organisationId));
    }

    const usersList = await query;

    return res.status(200).json({
      message: "Users fetched successfully",
      users: usersList,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addUsers = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const file = req.file?.path;
  const { role, name, email, password, isActive } = req.body;

  if (!authUser.organisationId)
    return res.status(400).json({ message: "Sorry no organisation found" });

  if (!authUser.userId)
    return res.status(400).json({ message: "Sorry no user found" });

  const allowedRoles = ["super_admin", "org_admin"];

  if (!allowedRoles.includes(authUser.role))
    return res.status(403).json({ message: "Sorry access denied" });

  if (role !== "staff" && role !== "org_admin")
    return res.status(400).json({ message: "Only staff allow" });

  if (!name || !email || !role || !password || !isActive) {
    return res.status(400).json({
      message: "Name, email, role, password and active status are required",
    });
  }

  try {
    const organisationId = authUser.organisationId;
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (user) return res.status(409).json({ message: "User already exist" });

    const hashPassword = await bcrypt.hash(password, 10);

    let result;
    if (file) {
      result = await uploadToCloudinary(file!);
    }

    if (file && !result) {
      return res
        .status(400)
        .json({ message: "Failed to upload profile picture" });
    }

    const imageData = {
      imageUrl: result?.secure_url!,
      public_id: result?.public_id!,
    };

    const addUser = await db.insert(users).values({
      organisationId,
      role: role,
      name,
      email,
      password: hashPassword,
      profilePic: imageData,
      isActive: isActive === "true" ? true : false,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: addUser,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const { id } = req.params;
  const { name, email, profilePic, isActive, role } = req.body;

  if (!authUser.organisationId) {
    return res.status(400).json({ message: "No organisation found" });
  }

  const allowedRoles = ["super_admin", "org_admin"];

  if (!allowedRoles.includes(authUser.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const userId = Number(id);

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingUser.organisationId !== authUser.organisationId) {
      return res.status(403).json({
        message: "You are not allowed to update this user.",
      });
    }

    const isEditingSelf = authUser.userId === userId;
    const isOrgAdminEditingSelf =
      isEditingSelf && authUser.role === "org_admin";

    const updateData: any = {
      name,
      email,
      profilePic,
      updatedAt: new Date(),
    };

    if (isOrgAdminEditingSelf) {
      if (role !== undefined && role !== existingUser.role) {
        return res.status(400).json({
          message: "You cannot change your own role.",
        });
      }

      if (
        isActive !== undefined &&
        (isActive === "true") !== existingUser.isActive
      ) {
        return res.status(400).json({
          message: "You cannot change your own account status.",
        });
      }
    } else {
      if (role !== undefined) {
        updateData.role = role;
      }

      if (isActive !== undefined) {
        updateData.isActive =
          typeof isActive === "boolean" ? isActive : isActive === "true";
      }
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));

    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const { id } = req.params;

  if (!authUser.organisationId)
    return res.status(400).json({ message: "No organisation found" });

  const allowedRoles = ["super_admin", "org_admin"];

  if (!allowedRoles.includes(authUser.role))
    return res.status(403).json({ message: "Access denied" });

  try {
    const userId = Number(id);
    const organisationId = authUser.organisationId;
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!existingUser)
      return res.status(404).json({ message: "User not found" });

    if (existingUser.organisationId !== organisationId)
      return res
        .status(400)
        .json({ message: "Sorry user not part of your organisation" });

    await db.delete(users).where(eq(users.id, userId));

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
