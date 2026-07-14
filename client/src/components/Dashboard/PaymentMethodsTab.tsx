// "use client";

// import { useState } from "react";
// import { Plus, Trash2, Banknote, Smartphone } from "lucide-react";
// import { BankPaymentMethod, MomoPaymentMethod } from "@/types/types";
// import Button from "../ui/btn";
// import CustomInput from "../ui/Input";

// type PaymentMethod = BankPaymentMethod | MomoPaymentMethod;

// type PaymentMethodsTabProps = {
//   initialMethods?: PaymentMethod[];
// };

// const emptyBank: BankPaymentMethod = {
//   paymentType: "Bank",
//   accountName: "",
//   accountNumber: "",
//   bankName: "",
//   bankBranch: "",
//   swiftCode: "",
// };

// const emptyMomo: MomoPaymentMethod = {
//   paymentType: "Momo",
//   momoWallet: "",
//   momoName: "",
//   momoVendor: "",
// };

// export default function PaymentMethodsTab({
//   initialMethods = [],
// }: PaymentMethodsTabProps) {
//   const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
//   const [saving, setSaving] = useState(false);

//   const updateMethod = (index: number, patch: Partial<PaymentMethod>) => {
//     setMethods((prev) =>
//       prev.map((m, i) =>
//         i === index ? ({ ...m, ...patch } as PaymentMethod) : m,
//       ),
//     );
//   };

//   const removeMethod = (index: number) => {
//     setMethods((prev) => prev.filter((_, i) => i !== index));
//   };

//   const addMethod = (type: "Bank" | "Momo") => {
//     setMethods((prev) => [
//       ...prev,
//       type === "Bank" ? { ...emptyBank } : { ...emptyMomo },
//     ]);
//   };

//   const handleSave = async () => {
//     setSaving(true);
//   };

//   return (
//     <div className="rounded-2xl border border-accent/30 bg-white p-5 sm:p-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-base font-semibold text-gray-900">
//             Payment methods
//           </h2>
//           <p className="mt-1 text-sm text-gray-500">
//             These show up on invoices so customers know how to pay you.
//           </p>
//         </div>

//         <div className="flex gap-2">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => addMethod("Bank")}
//             leftIcon={<Plus className="h-3.5 w-3.5" />}
//           >
//             Bank
//           </Button>

//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => addMethod("Momo")}
//             leftIcon={<Plus className="h-3.5 w-3.5" />}
//           >
//             Momo
//           </Button>
//         </div>
//       </div>

//       <div className="mt-6 space-y-4">
//         {methods.length === 0 && (
//           <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
//             No payment methods yet. Add a bank account or mobile money wallet
//             above.
//           </div>
//         )}

//         {methods.map((method, index) => (
//           <div
//             key={index}
//             className="rounded-xl border border-gray-100 bg-bg-soft/40 p-4"
//           >
//             <div className="flex items-center justify-between mb-3">
//               <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
//                 {method.paymentType}
//               </span>

//               <button
//                 onClick={() => removeMethod(index)}
//                 className="text-gray-400 hover:text-red-500"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </button>
//             </div>

//             {method.paymentType === "Bank" ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <CustomInput
//                   id={"accountName"}
//                   value={method.accountName}
//                   onChange={(e) =>
//                     updateMethod(index, { accountName: e.target.value })
//                   }
//                   placeholder="Account name"
//                 />
//                 <CustomInput
//                   id={"accountNumber"}
//                   value={method.accountNumber}
//                   onChange={(e) =>
//                     updateMethod(index, { accountNumber: e.target.value })
//                   }
//                   placeholder="Account number"
//                 />
//                 <CustomInput
//                   id={"bankName"}
//                   value={method.bankName}
//                   onChange={(e) =>
//                     updateMethod(index, { bankName: e.target.value })
//                   }
//                   placeholder="Bank name"
//                 />
//                 <CustomInput
//                   id={"branch"}
//                   value={method.bankBranch}
//                   onChange={(e) =>
//                     updateMethod(index, { bankBranch: e.target.value })
//                   }
//                   placeholder="Branch"
//                 />
//                 <CustomInput
//                   id={"swiftCode"}
//                   value={method.swiftCode}
//                   onChange={(e) =>
//                     updateMethod(index, { swiftCode: e.target.value })
//                   }
//                   placeholder="Swift code"
//                 />
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <CustomInput
//                   id={"momoName"}
//                   value={method.momoName}
//                   onChange={(e) =>
//                     updateMethod(index, { momoName: e.target.value })
//                   }
//                   placeholder="Registered name"
//                 />
//                 <CustomInput
//                   id={"walletNumber"}
//                   value={method.momoWallet}
//                   onChange={(e) =>
//                     updateMethod(index, { momoWallet: e.target.value })
//                   }
//                   placeholder="Wallet number"
//                 />
//                 <CustomInput
//                   id={"momoVendor"}
//                   value={method.momoVendor}
//                   onChange={(e) =>
//                     updateMethod(index, { momoVendor: e.target.value })
//                   }
//                   placeholder="Network (MTN, Telecel, AirtelTigo)"
//                 />
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {methods.length > 0 && (
//         <div className="flex justify-end pt-5">
//           <Button
//             type="button"
//             variant="primary"
//             onClick={handleSave}
//             disabled={saving}
//           >
//             {saving ? "Saving..." : "Save changes"}
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  BankPaymentMethod,
  MomoPaymentMethod,
  PaymentMethod,
} from "@/types/types";

import Button from "../ui/btn";
import CustomInput from "../ui/Input";
import { updatePaymentMethods } from "@/services/settings";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/useStoreOrgSeetings";

const emptyBank: BankPaymentMethod = {
  paymentType: "Bank",
  accountName: "",
  accountNumber: "",
  bankName: "",
  bankBranch: "",
  swiftCode: "",
};

const emptyMomo: MomoPaymentMethod = {
  paymentType: "Momo",
  momoWallet: "",
  momoName: "",
  momoVendor: "",
};

export default function PaymentMethodsTab() {
  const { orgSettings } = useSettingsStore();
  const [methods, setMethods] = useState<PaymentMethod[]>(
    orgSettings?.paymentMethod,
  );

  const { mutate: paymentMutate, isPending: paymentPending } = useMutation({
    mutationFn: updatePaymentMethods,
    onSuccess: (data) => {
      toast.success(data?.message);
    },
    onError: (data) => {
      toast.error(data?.message);
    },
  });

  const updateMethod = (index: number, patch: Partial<PaymentMethod>) => {
    setMethods((prev) =>
      prev.map((m, i) =>
        i === index ? ({ ...m, ...patch } as PaymentMethod) : m,
      ),
    );
  };

  const removeMethod = (index: number) => {
    setMethods((prev) => prev.filter((_, i) => i !== index));
  };

  const addMethod = (type: "Bank" | "Momo") => {
    setMethods((prev) => [
      ...prev,
      type === "Bank" ? { ...emptyBank } : { ...emptyMomo },
    ]);
  };

  const handleSave = () => {
    paymentMutate(methods);
  };

  return (
    <div className="rounded-2xl border border-accent/30 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Payment methods
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            These show up on invoices so customers know how to pay you.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => addMethod("Bank")}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Bank
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => addMethod("Momo")}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Momo
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {methods?.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
            No payment methods yet. Add a bank account or mobile money wallet
            above.
          </div>
        )}

        {methods?.map((method, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-100 bg-bg-soft/40 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-gray-500">
                {method.paymentType}
              </span>

              <button
                onClick={() => removeMethod(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {method.paymentType === "Bank" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CustomInput
                  value={method.accountName}
                  onChange={(e) =>
                    updateMethod(index, { accountName: e.target.value })
                  }
                  placeholder="Account name"
                  id="accountName"
                />
                <CustomInput
                  value={method.accountNumber}
                  onChange={(e) =>
                    updateMethod(index, { accountNumber: e.target.value })
                  }
                  placeholder="Account number"
                  id="accountNumber"
                />
                <CustomInput
                  value={method.bankName}
                  onChange={(e) =>
                    updateMethod(index, { bankName: e.target.value })
                  }
                  placeholder="Bank name"
                  id="bankName"
                />
                <CustomInput
                  value={method.bankBranch}
                  onChange={(e) =>
                    updateMethod(index, { bankBranch: e.target.value })
                  }
                  placeholder="Branch"
                  id="branch"
                />
                <CustomInput
                  value={method.swiftCode}
                  onChange={(e) =>
                    updateMethod(index, { swiftCode: e.target.value })
                  }
                  placeholder="Swift code"
                  id="SwiftCode"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CustomInput
                  value={method.momoName}
                  onChange={(e) =>
                    updateMethod(index, { momoName: e.target.value })
                  }
                  placeholder="Registered name"
                  id="momoName"
                />
                <CustomInput
                  value={method.momoWallet}
                  onChange={(e) =>
                    updateMethod(index, { momoWallet: e.target.value })
                  }
                  placeholder="Wallet number"
                  id="walletNumber"
                />
                <CustomInput
                  value={method.momoVendor}
                  onChange={(e) =>
                    updateMethod(index, { momoVendor: e.target.value })
                  }
                  placeholder="Network"
                  id="network"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {methods?.length > 0 && (
        <div className="flex justify-end pt-5">
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={paymentPending}
          >
            {paymentPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
