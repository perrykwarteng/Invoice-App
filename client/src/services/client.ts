import { api } from "@/lib/axois";
import { ClientResponseType, ClientType } from "@/types/types";
import { AxiosError } from "axios";

export const createClient = async ({ name, email, address }: ClientType) => {
  try {
    const res = await api.post(`/clients/client`, {
      name,
      email,
      address,
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

export const getClient = async (): Promise<ClientResponseType[]> => {
  try {
    const res = await api.get(`/clients/clients`);

    return res.data.data;
  } catch (error) {
    const Errors = error as AxiosError;
    if (Errors.response) {
      throw Errors.response.data;
    } else {
      throw new Error(Errors.message);
    }
  }
};

export const editClient = async ({
  id,
  name,
  email,
  address,
}: ClientResponseType) => {
  try {
    const res = await api.patch(`/clients/client/${id}`, {
      name,
      email,
      address,
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

export const deleteClient = async (id: number) => {
  try {
    const res = await api.delete(`/clients/client/${id}`);

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
