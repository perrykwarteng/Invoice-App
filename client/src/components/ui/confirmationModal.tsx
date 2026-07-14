import { Modal } from "./modal";

type ConfirmationModalProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmationModal = ({
  open,
  title = "Confirmation",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-accent/30 px-4 py-2 text-accent hover:bg-gray-100"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-white ${
              destructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-accent hover:opacity-90"
            }`}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
};