import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../config/envs.js";
import { AuthUser } from "../types/auth.js";

export const authRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const headers = req.headers.authorization;

  if (!headers) {
    return res.status(401).json({
      message: "Token not found",
    });
  }

  const token = headers.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      message: "Not authorized",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as AuthUser;
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const roleAuth = (...role: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser;
    try {
      if (!user)
        return res
          .status(401)
          .json({ message: "Unauthorized: User not found" });

      const userRole = req.user?.role;

      if (!role.includes(userRole!))
        return res
          .status(403)
          .json({ message: "Forbidden: You do not have permission" });

      return next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  };
};
