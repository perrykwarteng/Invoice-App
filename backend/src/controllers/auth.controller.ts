import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { and, desc, eq, gt } from "drizzle-orm";
import { generateOtp } from "../services/generateOtp.js";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../config/envs.js";
import { AuthUser, RegisterData } from "../types/auth.js";
import { sendOtp } from "../services/emailserice.js";
import { organisations } from "../config/db/tables/organisations.js";
import { db } from "../config/db/index.js";
import { users } from "../config/db/tables/users.js";
import { otps } from "../config/db/tables/otps.js";
import { settings } from "../config/db/tables/settings.js";

const OTP_EXPIRY_MS = 15 * 60 * 1000;

// Register
export const register = async (req: Request, res: Response) => {
  const { orgName, orgType, orgEmail, adminName, adminEmail, adminPassword } =
    req.body as RegisterData;
  if (
    !orgName ||
    !orgType ||
    !orgEmail ||
    !adminName ||
    !adminEmail ||
    !adminPassword
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const orgCheck = await db
      .select()
      .from(organisations)
      .where(eq(organisations.email, orgEmail));

    if (orgCheck.length > 0) {
      return res.status(400).json({ message: "Organisation already exists" });
    }

    const userCheck = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (userCheck.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otpCode = generateOtp();

    const result = await db.transaction(async (tx) => {
      const org = await tx
        .insert(organisations)
        .values({
          name: orgName,
          email: orgEmail,
          type: orgType,
          status: "pending",
        })
        .$returningId();

      const orgId = org[0]!.id;

      const hashPassword = await bcrypt.hash(adminPassword, 10);

      const user = await tx
        .insert(users)
        .values({
          name: adminName,
          email: adminEmail,
          password: hashPassword,
          isActive: false,
          role: "org_admin",
          organisationId: orgId,
        })
        .$returningId();

      const userId = user[0]!.id;

      await tx.insert(otps).values({
        userId,
        otpCode,
        type: "register",
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        isUsed: false,
      });

      await tx.insert(settings).values({
        organisationId: orgId,
        companyName: orgName,
        companyEmail: orgEmail,
      });

      return { orgId, userId };
    });

    const sendDetails = {
      email: adminEmail,
      name: adminName,
      otp: otpCode,
    };

    await sendOtp(sendDetails.email, sendDetails.otp, sendDetails.name);

    return res.status(201).json({
      message: "Registration successful",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email & password required",
    });
  }

  try {
    const user = await db.select().from(users).where(eq(users.email, email));

    const userExist = user[0];

    if (!userExist) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!userExist.isActive) {
      return res.status(403).json({
        message: "Account is inactive, please see your admin",
      });
    }

    const checkPass = await bcrypt.compare(password, userExist.password);

    if (!checkPass) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const checkOrg = await db
      .select()
      .from(organisations)
      .where(eq(organisations.id, Number(userExist.organisationId)));

    const org = checkOrg[0];

    if (userExist.role !== "super_admin") {
      if (!org) {
        return res.status(404).json({
          message: "Organisation not found",
        });
      }

      if (org.status === "pending") {
        return res.status(403).json({
          message: "Organisation not verified",
        });
      }

      if (org.status === "suspended") {
        return res.status(403).json({
          message: "Organisation suspended",
        });
      }
    }

    const accessToken = jwt.sign(
      {
        userId: userExist.id,
        organisationId: userExist.organisationId,
        role: userExist.role,
      },
      JWT_ACCESS_SECRET,
      { expiresIn: "3d" },
    );

    const refreshToken = jwt.sign(
      {
        userId: userExist.id,
        organisationId: userExist.organisationId,
        role: userExist.role,
      },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Logged in successfully",
      data: {
        accessToken,
        organisation:
          userExist.role === "super_admin"
            ? null
            : {
                orgName: org?.name,
                orgEmail: org?.email,
              },
        user: {
          id: userExist.id,
          name: userExist.name,
          email: userExist.email,
          role: userExist.role,
          profilePic: userExist.profilePic,
          isActive: userExist.isActive,
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

//OTPVERFICATION

type OtpType = "login" | "register" | "reset_password" | "forgot_password";

export const verifyOtps = async (req: Request, res: Response) => {
  const { otp, userId, type } = req.body as {
    otp: string;
    userId: number;
    type: OtpType;
  };

  if (!otp || !userId || !type) {
    return res.status(400).json({
      message: "otp, userId, and type are required",
    });
  }

  try {
    const [otpRecord] = await db
      .select()
      .from(otps)
      .where(and(eq(otps.userId, userId), eq(otps.type, type)))
      .orderBy(desc(otps.id))
      .limit(1);

    if (!otpRecord) {
      return res.status(404).json({ message: "No OTP found for this request" });
    }

    if (otpRecord.isUsed) {
      return res.status(400).json({ message: "OTP already used" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ message: "OTP expired. Request a new one." });
    }

    if (otpRecord.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const result = await db.transaction(async (tx) => {
      await tx
        .update(otps)
        .set({ isUsed: true })
        .where(eq(otps.id, otpRecord.id));

      switch (otpRecord.type as OtpType) {
        case "register": {
          const [userExist] = await tx
            .select()
            .from(users)
            .where(eq(users.id, userId));

          if (!userExist) {
            throw new Error("User not found");
          }

          await tx
            .update(users)
            .set({ isActive: true })
            .where(eq(users.id, userId));

          if (userExist.organisationId) {
            await tx
              .update(organisations)
              .set({ status: "active" })
              .where(eq(organisations.id, Number(userExist.organisationId)));
          }

          return { flow: "register", nextStep: null };
        }

        case "forgot_password": {
          return { flow: "forgot_password" };
        }

        default:
          return { flow: otpRecord.type, nextStep: null };
      }
    });

    return res.status(200).json({
      message: "OTP verified successfully",
      data: {
        verified: true,
        ...result,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { userId, type } = req.body;

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otpCode = generateOtp();

    await db.transaction(async (tx) => {
      await tx
        .update(otps)
        .set({ isUsed: true })
        .where(
          and(
            eq(otps.userId, userId),
            eq(otps.type, type),
            eq(otps.isUsed, false),
          ),
        );

      await tx.insert(otps).values({
        userId,
        otpCode,
        type,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        isUsed: false,
      });
    });

    const sendDetails = {
      email: user.email,
      name: user.name,
      otp: otpCode,
    };

    await sendOtp(sendDetails.email, sendDetails.otp, sendDetails.name);

    return res.status(200).json({ message: "Verification code resent" });
  } catch (error) {
    console.error("resendVerificationCode error:", error);
    return res
      .status(500)
      .json({ message: "Failed to resend verification code" });
  }
};

// me
export const me = async (req: Request, res: Response) => {
  try {
    const authUser = req.user as AuthUser;

    if (!authUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.userId));

    const userExist = user[0];

    if (!userExist) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user: {
        id: userExist.id,
        name: userExist.name,
        email: userExist.email,
        role: userExist.role,
        profilePic: userExist.profilePic,
        isActive: userExist.isActive,
        organisationId: userExist.organisationId,
        createdAt: userExist.createdAt,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// refreshtoken
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    console.log("token: ", token);

    if (!token)
      return res.status(401).json({ message: "Refresh token not found" });

    const decode = jwt.verify(token, JWT_REFRESH_SECRET) as AuthUser;

    const accessToken = jwt.sign(
      {
        userId: decode.userId,
        organisationId: decode.organisationId,
        role: decode.role,
      },
      JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      },
    );

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};

//Logout
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists for this email, a reset code has been sent",
      });
    }

    const otpCode = generateOtp();

    await db.transaction(async (tx) => {
      await tx.insert(otps).values({
        userId: user.id,
        otpCode,
        type: "forgot_password",
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        isUsed: false,
      });
    });

    const sendDetails = {
      email: user.email,
      name: user.name,
      otp: otpCode,
    };

    await sendOtp(sendDetails.email, sendDetails.otp, sendDetails.name);

    return res.status(200).json({
      message:
        "If an account exists for this email, a reset code has been sent",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ message: "Failed to process request" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(400).json({ message: "User don't exist" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));

      await tx
        .update(otps)
        .set({ isUsed: true })
        .where(eq(otps.userId, user.id));
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};
