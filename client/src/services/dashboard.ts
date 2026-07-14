import { api } from "@/lib/axois";
import { AxiosError } from "axios";

export const getDashboardStats = async (
  filter?: string,
  startDate?: Date,
  endDate?: Date,
) => {
  try {
    const params = new URLSearchParams();

    if (filter) params.append("filter", filter);
    if (startDate) {
      params.append("startDate", startDate.toISOString());
    }
    if (endDate) {
      params.append("endDate", endDate.toISOString());
    }
    const res = await api.get(`/statistics/dashboard?${params.toString()}`);
    return res.data.data;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response) {
      throw err.response.data;
    }
    throw new Error(err.message);
  }
};
