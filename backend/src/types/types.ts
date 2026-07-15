export type imageUrls = {
  imageUrl: string;
  public_id: string;
};

type BankPaymentMethod = {
  paymentType: "Bank";
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankBranch: string;
  swiftCode: string;
};

type MomoPaymentMethod = {
  paymentType: "Momo";
  momoWallet: string;
  momoName: string;
  momoVendor: string;
};

export type PaymentMethod = BankPaymentMethod | MomoPaymentMethod;

export type CompanySnapshot = {
  invoicePrefix?: string;
  logo?: imageUrls;
  name: string;
  email: string;
  address: string;
  paymentMethods?: PaymentMethod[];
};

export type InvoiceCustomization = {
  primaryColor: string | null;
  secondaryColor: string | null;
  letterHeadHeaderImg: imageUrls;
  letterHeadFooterImg: imageUrls;
  signatureImg: imageUrls;

  showLogo: boolean;
  showLetterHead: boolean;
  showSignature: boolean;
  showCompanySnapshot: boolean;
  showPaymentMethods: boolean;
  showNotes: boolean;
  showTerms: boolean;
  showItemTable: boolean;
};

export type InvoiceCus = {
  primaryColor: string | null;
  secondaryColor: string | null;
  letterHeadHeaderImg: imageUrls;
  letterHeadFooterImg: imageUrls;
  signatureImg: imageUrls;
};

export type SubItems = {
  id: number;
  invoiceItemId: number;
  subItemName: string;
  subItemPrice: string;
};

export type Items = {
  id: number;
  invoiceId: number;
  itemName: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  createdAt: string;
  updatedAt: string;
};
