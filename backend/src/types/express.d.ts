import "express";

declare module "express" {
  export interface Request {
    user?: {
      userId: number;
      organisationId: number;
      role: "super_admin" | "org_admin" | "staff";
    };
  }
}
