import { api } from "@/lib/axois";
import { User } from "@/types/types";
import { AxiosError } from "axios";

export const createUser = async (data: FormData) => {
  try {
    const res = await api.post(`/users/users`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    const Errors = error as AxiosError;
    if (Errors.response) {
      throw Errors.response.data;
    } else {
      throw new Error(Errors.message);
    }
  }
};

export const getUser = async (): Promise<User[]> => {
  try {
    const res = await api.get(`/users/users`);

    return res.data.users;
  } catch (error) {
    const Errors = error as AxiosError;
    if (Errors.response) {
      throw Errors.response.data;
    } else {
      throw new Error(Errors.message);
    }
  }
};

export const getMe = async (): Promise<User> => {
  try {
    const res = await api.get(`/users/users/me`);

    return res.data.user;
  } catch (error) {
    const Errors = error as AxiosError;
    if (Errors.response) {
      throw Errors.response.data;
    } else {
      throw new Error(Errors.message);
    }
  }
};

export const editUser = async (data: FormData, id: number) => {
  try {
    const res = await api.patch(`/users/users/${id}`, data);

    return res.data;
  } catch (error) {
    const Errors = error as AxiosError;
    if (Errors.response) {
      throw Errors.response.data;
    } else {
      throw new Error(Errors.message);
    }
  }
};

export const deleteUser = async (id: number) => {
  try {
    const res = await api.delete(`/users/users/${id}`);

    return res.data;
  } catch (error) {
    const Errors = error as AxiosError;
    if (Errors.response) {
      throw Errors.response.data;
    } else {
      throw new Error(Errors.message);
    }
  }
};
