import { api } from "@/lib/axois";
import { OrgSettingsType, PaymentMethod } from "@/types/types";
import { AxiosError } from "axios";

export const getSettings = async (): Promise<OrgSettingsType> => {
  try {
    const res = await api.get(`/settings/settings`);

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

export const updateCompanyProfile = async (data: FormData) => {
  try {
    const res = await api.patch(`/settings/settings/companyProfile`, data, {
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
export const updatePaymentMethods = async (data: PaymentMethod[]) => {
  try {
    const res = await api.patch(`/settings/settings/paymentMethod`, data, {});

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

export const updateUserProfile = async (data: FormData) => {
  try {
    const res = await api.patch(`/settings/settings/profilePic`, data, {
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

type changePasswordType = {
  currentPassword: string;
  newPassword: string;
};

export const changePassword = async ({
  currentPassword,
  newPassword,
}: changePasswordType) => {
  try {
    const res = await api.patch(`/settings/settings/changePassword`, {
      currentPassword,
      newPassword,
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

export const updateInvoiceCustomization = async (data: FormData) => {
  try {
    const res = await api.patch(
      `/settings/settings/updateInvoiceCustomization`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

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
