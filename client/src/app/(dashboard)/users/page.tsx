"use client";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Button from "@/components/ui/btn";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { CustomTable } from "@/components/ui/CustomTable";
import CustomInput from "@/components/ui/Input";
import { Modal } from "@/components/ui/modal";
import Select from "@/components/ui/select";
import { createUser, deleteUser, editUser, getUser } from "@/services/users";
import { User } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DiamondPlus, Pencil, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const roleStyles: Record<string, string> = {
  org_admin: "bg-purple-50 text-purple-600 border-purple-200",
  staff: "bg-blue-50 text-blue-600 border-blue-200",
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "",
  isActive: true,
};

export default function Users() {
  const queryClient = useQueryClient();

  const { data: userData = [], isLoading: userLoading } = useQuery({
    queryKey: ["Users"],
    queryFn: getUser,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");

  const [isEdit, setIsEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [id, setId] = useState<number | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredUsers = useMemo(() => {
    return userData.filter((user: User) => {
      const matchesSearch =
        !searchTerm ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && user.isActive) ||
        (statusFilter === "Inactive" && !user.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [userData, searchTerm, statusFilter]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("Image must be 2MB or less");
      return;
    }
    setProfilePic(file);
  };

  const resetModalState = () => {
    setOpen(false);
    setIsEdit(false);
    setId(null);
    setForm(emptyForm);
    setProfilePic(null);
  };

  const { mutate: CreateUserMutate, isPending: createUserPending } =
    useMutation({
      mutationKey: ["CreateUser"],
      mutationFn: createUser,
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["Users"] });
        resetModalState();
      },
      onError: (data: any) => toast.error(data.message),
    });

  const { mutate: UpdateUserMutate, isPending: updateUserPending } =
    useMutation({
      mutationKey: ["UpdateUser"],
      mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
        editUser(formData, id),
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["Users"] });
        resetModalState();
      },
      onError: (data: any) => toast.error(data.message),
    });

  const { mutate: deleteUserMutate, isPending: deleteUserPending } =
    useMutation({
      mutationKey: ["DeleteUser"],
      mutationFn: deleteUser,
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["Users"] });
        setOpenConfirm(false);
        setId(null);
      },
      onError: (data: any) => toast.error(data.message),
    });

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    if (form.password) formData.append("password", form.password);
    formData.append("role", form.role);
    formData.append("isActive", String(form.isActive));
    if (profilePic) formData.append("profilePic", profilePic);
    return formData;
  };

  const handleCreateUser = () => CreateUserMutate(buildFormData());
  const handleUpdateUser = () => {
    if (id == null) return;
    UpdateUserMutate({ id, formData: buildFormData() });
  };

  const handleSubmit = () => {
    if (isEdit) handleUpdateUser();
    else handleCreateUser();
  };

  const handleEdit = (user: User) => {
    setId(user.id);
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      password: "",
      role: user.role ?? "",
      isActive: user.isActive ?? true,
    });
    setProfilePic(null);
    setIsEdit(true);
    setOpen(true);
  };

  const handleAddNew = () => {
    setForm(emptyForm);
    setProfilePic(null);
    setId(null);
    setIsEdit(false);
    setOpen(true);
  };

  const openDeleteConfirm = (id: number) => {
    setId(id);
    setOpenConfirm(true);
  };

  return (
    <DashboardLayout>
      <div className="min-h-full space-y-4">
        <DashboardHeader title="Users" subtitle="List of Users">
          <Button
            className="group"
            leftIcon={
              <DiamondPlus className="w-5 h-5 transition-transform duration-150 group-hover:rotate-45" />
            }
            onClick={handleAddNew}
          >
            Add User
          </Button>
        </DashboardHeader>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-80">
            <CustomInput
              type="text"
              id="search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-48 z-20">
            <Select
              list={["All", "Active", "Inactive"]}
              scrollHeight="max-h-40"
              text="Filter by Status"
              value={statusFilter}
              onChange={(value: string) =>
                setStatusFilter(value as "All" | "Active" | "Inactive")
              }
            />
          </div>
        </div>

        <CustomTable
          data={filteredUsers}
          pageSize={5}
          getRowId={(user) => user.id}
          loading={userLoading}
          columns={[
            { key: "name", title: "Name" },
            { key: "email", title: "Email" },
            {
              key: "role",
              title: "Role",
              render: (user) => {
                const role = user.role;
                return (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      roleStyles[role] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {role}
                  </span>
                );
              },
            },
          ]}
          showStatus
          renderStatus={(user) => (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                user.isActive
                  ? "bg-green-50 text-green-600 border-green-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          )}
          showActions
          renderActions={(user) => (
            <div className="flex items-center justify-end gap-2">
              <button
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition"
                onClick={() => handleEdit(user)}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition"
                onClick={() => openDeleteConfirm(user.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        />
      </div>

      <Modal
        open={open}
        onClose={resetModalState}
        title={isEdit ? "Edit User" : "Add User"}
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={resetModalState}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isEdit ? updateUserPending : createUserPending}
            >
              {isEdit ? "Update User" : "Create User"}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            label="Full Name"
            value={form.name}
            placeholder="Emmanuel Kusi"
            onChange={(e: any) => handleChange("name", e.target.value)}
          />
          <CustomInput
            label="Email"
            value={form.email}
            placeholder="emmanuel@infinitytel.com"
            disabled={isEdit}
            onChange={(e: any) => handleChange("email", e.target.value)}
          />
          {!isEdit && (
            <CustomInput
              label="Password"
              type="password"
              value={form.password}
              placeholder="***********"
              onChange={(e: any) => handleChange("password", e.target.value)}
            />
          )}
          <Select
            label="Role"
            text="Select Role"
            list={["org_admin", "staff"]}
            value={form.role}
            onChange={(value: string) => handleChange("role", value)}
          />
          <Select
            label="Status"
            text="Select Status"
            list={["Active", "Inactive"]}
            value={form.isActive ? "Active" : "Inactive"}
            onChange={(value: string) =>
              handleChange("isActive", value === "Active")
            }
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Profile Picture
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                handleFileChange(file ?? null);
              }}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
            >
              {profilePic ? (
                <img
                  src={URL.createObjectURL(profilePic)}
                  alt="Profile Preview"
                  className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full object-cover"
                />
              ) : (
                <p className="text-gray-500">
                  Drag & drop image here or click to upload
                </p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        open={openConfirm}
        title="Confirm Deletion"
        message="Are you sure you want to delete this user?"
        onConfirm={() => id !== null && deleteUserMutate(id)}
        onCancel={() => {
          setOpenConfirm(false);
          setId(null);
        }}
        loading={deleteUserPending}
      />
    </DashboardLayout>
  );
}
