import { api } from "@/lib/axois";
import { LoginResponse } from "@/types/types";
import { LoginData, RegisterData } from "@/utils/Zod";
import { AxiosError } from "axios";

export const onRegister = async (data: RegisterData) => {
  try {
    const res = await api.post("/auth/register", data);

    return res.data;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response) {
      throw err.response.data;
    }
    throw new Error(err.message);
  }
};

export const onLogin = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const res = await api.post("/auth/login", data);

    return res.data;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response) {
      throw err.response.data;
    }
    throw new Error(err.message);
  }
};

export const onLogout = async () => {
  try {
    const res = await api.post("/auth/logout");

    return res.data;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response) {
      throw err.response.data;
    }
    throw new Error(err.message);
  }
};

type optType = {
  otp?: string;
  userId?: number;
  type?: string;
};

type resetPasswordType = {
  email: string;
  newPassword?: string;
};

export const verifyOtp = async ({ otp, userId, type }: optType) => {
  try {
    const res = await api.post("/auth/verifyOtp", { otp, userId, type });

    return res.data;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response) {
      throw err.response.data;
    }
    throw new Error(err.message);
  }
};

export const resendOtp = async ({ userId, type }: optType) => {
  try {
    const res = await api.post("/auth/resendOtp", { userId, type });

    return res.data;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response) {
      throw err.response.data;
    }
    throw new Error(err.message);
  }
};

export const forgetPassword = async (email: string) => {
  try {
    const res = await api.post("/auth/forgetPassword", { email });

    return res.data;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response) {
      throw err.response.data;
    }
    throw new Error(err.message);
  }
};

export const resetPassword = async ({
  email,
  newPassword,
}: resetPasswordType) => {
  try {
    const res = await api.post("/auth/resetPassword", { email, newPassword });
    return res.data;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response) {
      throw err.response.data;
    }
    throw new Error(err.message);
  }
};
