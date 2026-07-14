import { Stat } from "@/components/Dashboard/OverviewStats";
import { api } from "@/lib/axois";
import { Invoice, SingleInvoice } from "@/types/types";
import { AxiosError } from "axios";

export const createInvoice = async (data: FormData) => {
  try {
    const res = await api.post(`/invoices/invoices`, data, {
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

export const getInvoices = async (
  page?: number,
  limit?: number,
): Promise<Invoice[]> => {
  try {
    const res = await api.get(`/invoices/invoices?page=${page}&limit=${limit}`);

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

export const getSingleInvoice = async (id: number): Promise<SingleInvoice> => {
  try {
    const res = await api.get(`/invoices/invoices/${id}`);
    console.log(res.data);

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

export const editInvoice = async (data: FormData, id: number) => {
  try {
    const res = await api.patch(`/invoices/invoices/${id}`, data, {
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

export const deleteInvoice = async (id: number) => {
  try {
    const res = await api.delete(`/invoices/invoices/${id}`);

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

export const getStatInvoices = async ():Promise<Stat> => {
  try {
    const res = await api.get(`/invoices/stats`);

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
