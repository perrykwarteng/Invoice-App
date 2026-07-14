import { Request, Response } from "express";
import { AuthUser } from "../types/auth.js";
import { eq } from "drizzle-orm";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../services/fileUpload.js";
import { db } from "../config/db/index.js";
import { settings } from "../config/db/tables/settings.js";
import { users } from "../config/db/schema.js";
import bcrypt from "bcrypt";

export const getSettings = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const { organisationId } = authUser;

  if (!organisationId)
    return res.status(400).json({ message: "No organisation found" });

  try {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.organisationId, organisationId));

    res
      .status(200)
      .json({ message: "Settings Fetched successfully", data: setting });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const companyProfile = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const { organisationId, userId } = authUser;
  const { name, email, address, invoicePrefix, website } = req.body;
  const file = req.file?.path;

  if (!organisationId)
    return res.status(400).json({
      message: "No organisation found",
    });
  if (!userId)
    return res.status(400).json({
      message: "No user found",
    });

  if (!name || !email || !address || !invoicePrefix) {
    return res.status(400).json({
      message: "Name, email, address and invoice prefix are required",
    });
  }

  try {
    const [currentSettings] = await db
      .select()
      .from(settings)
      .where(eq(settings.organisationId, organisationId));

    if (!currentSettings) {
      return res.status(404).json({
        message: "Settings not found",
      });
    }

    let logo = currentSettings.companyLogo;
    if (file) {
      const uploadResult = await uploadToCloudinary(file);

      if (!uploadResult) {
        return res.status(400).json({
          message: "Failed to upload company logo",
        });
      }
      const oldPublicId = (currentSettings.companyLogo as any)?.public_id;
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId);
        } catch (err) {
          console.error("Failed to delete old logo:", err);
        }
      }

      logo = {
        imageUrl: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    await db
      .update(settings)
      .set({
        companyName: name,
        companyEmail: email,
        companyAddress: address,
        companyWebsite: website,
        invoicePrefix,
        companyLogo: logo,
      })
      .where(eq(settings.organisationId, organisationId));

    return res.status(200).json({
      message: "Company profile updated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const paymentMethod = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser;
  const { organisationId, userId } = authUser;
  const data = req.body;

  if (!organisationId)
    return res.status(400).json({
      message: "No organisation found",
    });
  if (!userId)
    return res.status(400).json({
      message: "No user found",
    });

  if (!data) {
    return res.status(400).json({
      message: "Bank or Momo details are required",
    });
  }

  try {
    const [currentSettings] = await db
      .select()
      .from(settings)
      .where(eq(settings.organisationId, organisationId));

    if (!currentSettings) {
      return res.status(404).json({
        message: "Settings not found",
      });
    }

    await db
      .update(settings)
      .set({ paymentMethod: data })
      .where(eq(settings.organisationId, organisationId));

    return res.status(200).json({
      message: "Company profile updated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const changeProfilePicture = async (req: Request, res: Response) => {
  try {
    const authUser = req.user as AuthUser;
    const userId = authUser.userId;
    const file = req.file?.path;
    const { profileImage } = req.body;

    if (!file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let uploadResult: { secure_url: string; public_id: string } | undefined;

    if (file) {
      uploadResult = await uploadToCloudinary(file);
      if (!uploadResult) {
        return res
          .status(400)
          .json({ message: "Failed to upload company logo" });
      }

      const oldPublicId = profileImage?.public_id;

      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId);
        } catch (cleanupError) {
          console.error("Failed to delete old company logo:", cleanupError);
        }
      }
    }

    await db
      .update(users)
      .set({
        profilePic: {
          imageUrl: uploadResult?.secure_url || "",
          public_id: uploadResult?.public_id || "",
        },
      })
      .where(eq(users.id, userId));

    const image = {
      imageUrl: uploadResult?.secure_url || "",
      public_id: uploadResult?.public_id || "",
    };

    return res.status(200).json({
      message: "Profile picture updated",
      profilePicture: image,
    });
  } catch (error) {
    console.error("changeProfilePicture error:", error);
    return res
      .status(500)
      .json({ message: "Failed to update profile picture" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const authUser = req.user as AuthUser;
    const userId = authUser.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res.status(400).json({
        message: "New password must be different from the current one",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("changePassword error:", error);
    return res.status(500).json({ message: "Failed to change password" });
  }
};

export const updateInvoiceCustomization = async (
  req: Request,
  res: Response,
) => {
  const authUser = req.user as AuthUser;
  const { invoiceCustomization } = req.body;
  const file: any = req.files as Express.Multer.File[];

  if (!authUser.organisationId)
    return res.status(400).json({ message: "Sorry no organisation found" });

  if (!authUser.userId)
    return res.status(400).json({ message: "Sorry no user found" });

  if (!invoiceCustomization)
    return res.status(400).json({ message: "No fieled setted" });

  try {
    const organisationId = authUser.organisationId;
    const customization = JSON.parse(invoiceCustomization);

    const uploadResults: {
      letterHeadHeaderImg?: { secure_url: string; public_id: string };
      letterHeadFooterImg?: { secure_url: string; public_id: string };
      signatureImg?: { secure_url: string; public_id: string };
    } = {};

    const uploadPromises: Promise<void>[] = [];

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

    const [existingCustomization] = await db
      .select()
      .from(settings)
      .where(eq(settings.organisationId, Number(organisationId)));

    const oldLetterHeadHeaderPublicId = (
      existingCustomization?.invoiceCustomization as any
    )?.letterHeadHeaderImg?.public_id;

    const oldLetterHeadFooterPublicId = (
      existingCustomization?.invoiceCustomization as any
    )?.letterHeadFooterImg?.public_id;

    const oldSignaturePublicId = (
      existingCustomization?.invoiceCustomization as any
    )?.signatureImg?.public_id;

    const cleanupTasks: Promise<any>[] = [];

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

    const [currentSettings] = await db
      .select()
      .from(settings)
      .where(eq(settings.organisationId, organisationId));

    if (!currentSettings) {
      return res.status(404).json({
        message: "Settings not found",
      });
    }

    await db
      .update(settings)
      .set({
        invoiceCustomization: {
          primaryColor: customization.primaryColor,
          secondaryColor: customization.secondaryColor,
          letterHeadHeaderImg: {
            imageUrl: letterHeaderImage.imageUrl,
            public_id: letterHeaderImage.public_id,
          },
          letterHeadFooterImg: {
            imageUrl: letterFooterImage.imageUrl,
            public_id: letterFooterImage.public_id,
          },
          signatureImg: {
            imageUrl: signatureImage.imageUrl,
            public_id: signatureImage.public_id,
          },
        },
      })
      .where(eq(settings.organisationId, organisationId));

    return res.status(200).json({
      message: "Invoice Customization Updated successfully",
    });
  } catch (error) {
    console.error("Update Invoice Customization error:", error);
    return res
      .status(500)
      .json({ message: "Update Invoice Customization error" });
  }
};
