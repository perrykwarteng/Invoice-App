export type AuthUser = {
  userId: number;
  organisationId: number;
  role: "super_admin" | "org_admin" | "staff";
};

export type RegisterData = {
  orgName: string;
  orgType: string;
  orgEmail: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminConfirmPassword: string;
};
