import dotenv from "dotenv";

dotenv.config();

// PORT
export const PORT = process.env.PORT || 9000;
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

// DB
export const DB_USER = process.env.DB_USER as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const DB_DATABASE = process.env.DB_DATABASE as string;
export const DB_HOST = process.env.DB_HOST as string;
export const DB_PORT = parseInt((process.env.DB_PORT as string) || "3306");

// MAIL
export const SMTP_HOST = process.env.SMTP_HOST as string;
export const SMTP_PORT = process.env.SMTP_PORT as string;
export const SMTP_SERVICE = process.env.SMTP_SERVICE as string;
export const SMTP_USER = process.env.SMTP_USER as string;
export const SMTP_PASS = process.env.SMTP_PASS as string;

// CLOUDINARY
export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME as string;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY as string;
export const CLOUDINARY_API_SECRET = process.env
  .CLOUDINARY_API_SECRET as string;

// FRONTEND
export const FRONTEND_LOCAL_URL = process.env.FRONTEND_LOCAL_URL as string;
export const FRONTEND_URL = process.env.FRONTEND_URL as string;
