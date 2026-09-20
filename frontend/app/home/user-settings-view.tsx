"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useTable,
  tableFeatures,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  ArrowLeft,
  CheckCircle2,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSnackbar } from "notistack";
import { UserRoleBadge } from "@/components/user-role-badge";
import {
  USER_ROLES,
  USER_STATUSES,
  createUserSchema,
  updateUserSchema,
  type UserItem,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/user-settings-types";

function formatPhone(value?: string | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.startsWith("02")) {
    const limited = digits.slice(0, 9);
    if (limited.length <= 2) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 2)}-${limited.slice(2)}`;
    return `${limited.slice(0, 2)}-${limited.slice(2, 5)}-${limited.slice(5)}`;
  }
  const limited = digits.slice(0, 10);
  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
}

function formatCitizenId(value?: string | null): string {
  if (!value) return "-";
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length === 0) return "-";
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  if (digits.length <= 10)
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`;
}

function formatCitizenIdInput(value?: string | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length === 0) return "";
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  if (digits.length <= 10)
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return dateStr;
  }
}

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, UserItem>();

type UserFormErrors = Partial<Record<keyof CreateUserInput, string>>;

function inputErrorClass(message?: string) {
  return message
    ? "!border-destructive focus-visible:!border-destructive focus:!border-destructive ring-1 !ring-destructive/30"
    : "";
}

function UserFieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  ) : null;
}

function getUserFormErrors(
  issues: { path: PropertyKey[]; message: string }[],
): UserFormErrors {
  const errors: UserFormErrors = {};
  for (const issue of issues) {
    const field = issue.path[0] as keyof CreateUserInput | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export function UserSettingsView({
  onBack,
  currentUserId,
}: {
  onBack: () => void;
  currentUserId?: string | null;
}) {
  const { enqueueSnackbar } = useSnackbar();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Modals state: View, Edit, Create, Delete
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Password visibility state
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Active user for view, edit or delete
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserInput>({
    username: "",
    password: "",
    role: "ADMIN",
    status: "ACTIVE",
    fullName: "",
    nickname: "",
    phone: "",
    email: "",
    lineId: "",
    citizenId: "",
  });

  const [editForm, setEditForm] = useState<UpdateUserInput>({
    role: "ADMIN",
    status: "ACTIVE",
    fullName: "",
    nickname: "",
    phone: "",
    email: "",
    lineId: "",
    citizenId: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createErrors, setCreateErrors] = useState<UserFormErrors>({});
  const [editErrors, setEditErrors] = useState<UserFormErrors>({});

  const [refreshIndex, setRefreshIndex] = useState(0);

  // Fetch users list trigger
  const fetchUsers = useCallback(() => {
    setIsLoading(true);
    setRefreshIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ignore = false;
    const executeFetch = async () => {
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", limit.toString());
        if (search.trim()) params.set("search", search.trim());
        if (selectedRole && selectedRole !== "ALL")
          params.set("role", selectedRole);
        if (selectedStatus && selectedStatus !== "ALL")
          params.set("status", selectedStatus);

        const res = await fetch(`/api/settings/users?${params.toString()}`);
        const json = await res.json();
        if (!ignore) {
          if (json.success && json.data) {
            setUsers(json.data.items || []);
            setTotal(json.data.total || 0);
          } else {
            enqueueSnackbar(json.error || "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้", {
              variant: "error",
            });
          }
        }
      } catch {
        if (!ignore) {
          enqueueSnackbar("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", {
            variant: "error",
          });
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void executeFetch();
    return () => {
      ignore = true;
    };
  }, [page, limit, search, selectedRole, selectedStatus, refreshIndex, enqueueSnackbar]);

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // Open View Dialog
  const handleOpenView = (user: UserItem) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    setShowCreatePassword(false);
    setCreateForm({
      username: "",
      password: "",
      role: "ADMIN",
      status: "ACTIVE",
      fullName: "",
      nickname: "",
      phone: "",
      email: "",
      lineId: "",
      citizenId: "",
    });
    setCreateErrors({});
    setCreateDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (user: UserItem) => {
    setShowEditPassword(false);
    setSelectedUser(user);
    setEditForm({
      role: user.role,
      status: user.status || "ACTIVE",
      fullName: user.fullName || "",
      nickname: user.nickname || "",
      phone: formatPhone(user.phone),
      email: user.email || "",
      lineId: user.lineId || "",
      citizenId: formatCitizenIdInput(user.citizenId),
      password: "",
    });
    setEditErrors({});
    setEditDialogOpen(true);
  };

  // Switch from View Dialog to Edit Dialog
  const handleSwitchToEdit = () => {
    if (!selectedUser) return;
    setViewDialogOpen(false);
    handleOpenEdit(selectedUser);
  };

  // Open Delete Confirmation Dialog
  const handleOpenDelete = (user: UserItem) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Submit Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = createUserSchema.safeParse(createForm);
    if (!validation.success) {
      setCreateErrors(getUserFormErrors(validation.error.issues));
      return;
    }
    setCreateErrors({});

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        username: validation.data.username,
        password: validation.data.password,
        role: validation.data.role,
        status: validation.data.status || "ACTIVE",
        fullName: validation.data.fullName,
      };
      if (validation.data.nickname?.trim()) payload.nickname = validation.data.nickname.trim();
      if (validation.data.phone?.trim()) payload.phone = validation.data.phone.trim();
      if (validation.data.email?.trim()) payload.email = validation.data.email.trim();
      if (validation.data.citizenId?.trim()) payload.citizenId = validation.data.citizenId.trim();
      if (validation.data.lineId?.trim()) payload.lineId = validation.data.lineId.trim();

      const res = await fetch("/api/settings/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        enqueueSnackbar("เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว", {
          variant: "success",
        });
        setCreateDialogOpen(false);
        fetchUsers();
      } else {
        enqueueSnackbar(json.error || "ไม่สามารถสร้างผู้ใช้งานได้", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน", {
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (
      selectedUser.username.toLowerCase() === "admin" &&
      editForm.status === "INACTIVE"
    ) {
      enqueueSnackbar(
        "ไม่สามารถระงับการใช้งานบัญชีผู้ดูแลระบบหลัก (admin) ได้",
        {
          variant: "error",
        },
      );
      return;
    }

    const validation = updateUserSchema.safeParse(editForm);
    if (!validation.success) {
      setEditErrors(getUserFormErrors(validation.error.issues));
      return;
    }
    setEditErrors({});

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        role: validation.data.role,
        status: validation.data.status || "ACTIVE",
        fullName: validation.data.fullName,
        nickname: validation.data.nickname?.trim() || null,
        phone: validation.data.phone?.trim() || null,
        email: validation.data.email?.trim() || null,
        citizenId: validation.data.citizenId?.trim() || null,
        lineId: validation.data.lineId?.trim() || null,
      };
      if (editForm.password && editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const res = await fetch(`/api/settings/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        enqueueSnackbar("บันทึกการแก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว", {
          variant: "success",
        });
        setEditDialogOpen(false);
        fetchUsers();
      } else {
        enqueueSnackbar(json.error || "ไม่สามารถแก้ไขข้อมูลผู้ใช้งานได้", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้งาน", {
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete User
  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;

    if (selectedUser.username.toLowerCase() === "admin") {
      enqueueSnackbar("ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (admin) ได้", {
        variant: "error",
      });
      setDeleteDialogOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/settings/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        enqueueSnackbar("ลบผู้ใช้งานเรียบร้อยแล้ว", { variant: "success" });
        setDeleteDialogOpen(false);
        fetchUsers();
      } else {
        enqueueSnackbar(json.error || "ไม่สามารถลบผู้ใช้งานได้", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("เกิดข้อผิดพลาดในการลบผู้ใช้งาน", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // TanStack Table Column Definitions
  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("role", {
          header: "Role",
          cell: (info) => (
            <div className="py-0.5">
              <UserRoleBadge role={info.row.original.role} />
            </div>
          ),
        }),
        helper.accessor("fullName", {
          header: "ชื่อ-นามสกุล",
          cell: (info) => {
            const user = info.row.original;
            return (
              <div className="flex flex-col gap-0.5 py-1">
                <button
                  type="button"
                  onClick={() => handleOpenView(user)}
                  className="font-medium text-foreground text-sm truncate max-w-[180px] hover:text-primary transition-colors text-left"
                  title={user.fullName || ""}
                >
                  {user.fullName || "-"}
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-muted-foreground">
                    @{user.username}
                  </span>
                  {user.nickname && (
                    <span className="text-xs text-muted-foreground">
                      ({user.nickname})
                    </span>
                  )}
                </div>
              </div>
            );
          },
        }),
        helper.accessor("phone", {
          header: "เบอร์โทร",
          cell: (info) => (
            <span className="text-sm font-mono text-muted-foreground whitespace-nowrap">
              {formatPhone(info.row.original.phone) || "-"}
            </span>
          ),
        }),
        helper.accessor("email", {
          header: "Email",
          cell: (info) => (
            <span
              className="text-sm text-muted-foreground truncate max-w-[170px] inline-block"
              title={info.row.original.email || ""}
            >
              {info.row.original.email || "-"}
            </span>
          ),
        }),
        helper.accessor("lineId", {
          header: "Line ID",
          cell: (info) => (
            <span
              className="text-sm font-mono text-muted-foreground truncate max-w-[140px] inline-block"
              title={info.row.original.lineId || ""}
            >
              {info.row.original.lineId || "-"}
            </span>
          ),
        }),
        helper.accessor("citizenId", {
          header: "เลขบัตรประชาชน",
          cell: (info) => (
            <span className="text-sm font-mono text-muted-foreground whitespace-nowrap">
              {formatCitizenId(info.row.original.citizenId)}
            </span>
          ),
        }),
        helper.accessor("status", {
          header: "สถานะ",
          cell: (info) => {
            const isActive = (info.row.original.status || "ACTIVE") === "ACTIVE";
            return (
              <Badge
                variant="outline"
                className={
                  isActive
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 gap-1 font-medium text-xs"
                    : "border-border bg-muted/60 text-muted-foreground gap-1 font-medium text-xs"
                }
              >
                {isActive && <CheckCircle2 className="size-3" />}
                {isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
              </Badge>
            );
          },
        }),
        helper.display({
          id: "actions",
          header: () => <div className="text-right">การจัดการ</div>,
          cell: (info) => {
            const user = info.row.original;
            const isSelf = user.id === currentUserId;
            const isAdmin = user.username.toLowerCase() === "admin";
            const canDelete = !isSelf && !isAdmin;
            return (
              <div className="flex items-center justify-end gap-1.5">
                {/* ดูข้อมูลผู้ใช้งาน */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleOpenView(user)}
                  className="size-7 rounded-md border border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border transition-colors"
                  title="ดูรายละเอียดผู้ใช้งาน"
                  aria-label={`ดูรายละเอียด ${user.username}`}
                >
                  <Eye className="size-3.5" />
                </Button>
                {/* แก้ไขข้อมูลผู้ใช้งาน */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleOpenEdit(user)}
                  className="size-7 rounded-md border border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border transition-colors"
                  title="แก้ไขข้อมูลผู้ใช้งาน"
                  aria-label={`แก้ไข ${user.username}`}
                >
                  <Edit2 className="size-3.5" />
                </Button>
                {/* ลบข้อมูลผู้ใช้งาน */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleOpenDelete(user)}
                  disabled={!canDelete}
                  className="size-7 rounded-md border border-border/70 bg-muted/50 text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive dark:hover:border-destructive/40 dark:hover:bg-destructive/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title={
                    isSelf
                      ? "ไม่สามารถลบบัญชีตนเองได้"
                      : isAdmin
                      ? "ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (admin) ได้"
                      : "ลบข้อมูลผู้ใช้งาน"
                  }
                  aria-label={`ลบ ${user.username}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            );
          },
        }),
      ]),
    [currentUserId],
  );

  // Initialize TanStack Table instance
  const table = useTable({
    features,
    columns,
    data: users,
  });

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-5">
      {/* 1. Page Header: การตั้งค่าผู้ใช้งาน */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="size-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="กลับหน้าการตั้งค่า"
            title="กลับหน้าการตั้งค่า"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="w-px self-stretch bg-border" aria-hidden="true" />

          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl leading-tight">
              การตั้งค่าผู้ใช้งาน
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              จัดการบัญชี กำหนดบทบาท สถานะ และสิทธิ์การเข้าใช้งานระบบ SGQ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={isLoading}
            className="h-9 gap-1.5 text-xs font-normal"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">รีเฟรช</span>
          </Button>

          <Button onClick={handleOpenCreate} className="h-9 gap-1.5 shadow-xs">
            <Plus className="size-4" />
            <span>เพิ่มผู้ใช้งาน</span>
          </Button>
        </div>
      </div>

      {/* 2. Unified Card: ค้นหา + ตาราง (หัวข้อในตารางชื่อ รายชื่อผู้ใช้งานในระบบ) */}
      <Card className="border border-border/80 shadow-xs overflow-hidden">
        {/* Card Header & Search/Filter Toolbar */}
        <div className="p-4 sm:p-5 bg-card space-y-4">
          <div className="flex items-center gap-2.5 w-full justify-between">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              รายชื่อผู้ใช้งานในระบบ
            </h2>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3"
            noValidate
          >
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="ค้นหาชื่อเต็ม, ชื่อเล่น, username, email, เบอร์โทร, เลขบัตรประชาชน..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                maxLength={100}
                className="pl-9 pr-8 h-9 text-sm w-full bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-sm"
                  aria-label="ล้างคำค้นหา"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter: Role & Status */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Role Filter */}
              <div className="relative min-w-[150px]">
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground font-medium shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  aria-label="กรองตามบทบาทผู้ใช้งาน"
                >
                  <option value="ALL">ทุกบทบาท (All Roles)</option>
                  {USER_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="size-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>

              {/* Status Filter */}
              <div className="relative min-w-[140px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground font-medium shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  aria-label="กรองตามสถานะผู้ใช้งาน"
                >
                  <option value="ALL">สถานะทั้งหมด</option>
                  {USER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="size-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                className="h-9 text-xs px-3 font-medium"
              >
                ค้นหา
              </Button>
            </div>
          </form>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent border-b border-border bg-muted/30"
                  >
                    {headerGroup.headers.map((header, index) => (
                      <TableHead
                        key={header.id}
                        className={`text-xs font-semibold text-muted-foreground ${
                          index === 0 ? "pl-5" : ""
                        } ${index === headerGroup.headers.length - 1 ? "pr-5" : ""}`}
                      >
                        {header.isPlaceholder ? null : (
                          <table.FlexRender header={header} />
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-40 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-6 animate-spin text-primary" />
                        <span className="text-xs font-medium">
                          กำลังโหลดข้อมูลผู้ใช้งาน...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-40 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="size-8 text-muted-foreground/40" />
                        <p className="text-sm font-semibold text-foreground">
                          ไม่พบข้อมูลผู้ใช้งาน
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {search || selectedRole !== "ALL" || selectedStatus !== "ALL"
                            ? "ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง"
                            : 'คลิก "เพิ่มผู้ใช้งาน" เพื่อสร้างรายการแรกในระบบ'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-muted/40 transition-colors border-b border-border/60"
                    >
                      {row.getAllCells().map((cell, index) => (
                        <TableCell
                          key={cell.id}
                          className={`${index === 0 ? "pl-5" : ""} ${
                            index === row.getAllCells().length - 1 ? "pr-5" : ""
                          }`}
                        >
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Pagination */}
          {!isLoading && total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/80 text-xs text-muted-foreground">
              <span>
                แสดง {(page - 1) * limit + 1} ถึง{" "}
                {Math.min(page * limit, total)} จาก {total} รายการ
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 text-xs px-2.5"
                >
                  ก่อนหน้า
                </Button>
                <span className="px-2 font-semibold text-foreground">
                  หน้า {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 text-xs px-2.5"
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Dialog ดูข้อมูลผู้ใช้งาน (กว้าง 2 คอลัมน์ เหมือนหน้าลูกค้า) */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl lg:max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="gap-1 border-b border-border pb-3 text-left">
            <div className="flex items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span>รายละเอียดข้อมูลผู้ใช้งาน</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  รายละเอียดข้อมูลผู้ใช้สำหรับสิทธิ์การทำงานในระบบ SGQ
                </DialogDescription>
              </div>
              {selectedUser && (
                <div className="shrink-0 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      (selectedUser.status || "ACTIVE") === "ACTIVE"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 gap-1 font-medium text-xs"
                        : "border-border bg-muted/60 text-muted-foreground gap-1 font-medium text-xs"
                    }
                  >
                    {(selectedUser.status || "ACTIVE") === "ACTIVE" && (
                      <CheckCircle2 className="size-3" />
                    )}
                    {(selectedUser.status || "ACTIVE") === "ACTIVE"
                      ? "ใช้งาน"
                      : "ไม่ใช้งาน"}
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>

          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
              {/* คอลัมน์ซ้าย: ข้อมูลบัญชีและสิทธิ์ */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2.5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    <span>ข้อมูลบัญชีและสิทธิ์การใช้งาน</span>
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      ชื่อผู้ใช้ (Username)
                    </span>
                    <span className="font-mono text-sm font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 inline-block">
                      @{selectedUser.username}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-1">
                      บทบาทผู้ใช้งาน (Role)
                    </span>
                    <div>
                      <UserRoleBadge role={selectedUser.role} />
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-1">
                      สถานะบัญชี (Status)
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        (selectedUser.status || "ACTIVE") === "ACTIVE"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 gap-1 font-medium text-xs"
                          : "border-border bg-muted/60 text-muted-foreground gap-1 font-medium text-xs"
                      }
                    >
                      {(selectedUser.status || "ACTIVE") === "ACTIVE" && (
                        <CheckCircle2 className="size-3" />
                      )}
                      {(selectedUser.status || "ACTIVE") === "ACTIVE"
                        ? "ใช้งานปกติ (Active)"
                        : "ระงับการใช้งาน (Inactive)"}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="block font-medium">วันที่สร้างข้อมูล</span>
                      <span className="mt-0.5 block font-mono">
                        {formatDate(selectedUser.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="block font-medium">อัปเดตล่าสุด</span>
                      <span className="mt-0.5 block font-mono">
                        {formatDate(selectedUser.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* คอลัมน์ขวา: ข้อมูลส่วนตัวและการติดต่อ */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2.5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <span>ข้อมูลส่วนตัวและการติดต่อ</span>
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      ชื่อ-นามสกุล
                    </span>
                    <span className="font-medium text-foreground text-sm leading-relaxed block">
                      {selectedUser.fullName || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      ชื่อเล่น
                    </span>
                    {selectedUser.nickname ? (
                      <Badge variant="secondary" className="font-normal text-xs">
                        {selectedUser.nickname}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      เบอร์โทรศัพท์
                    </span>
                    <span className="font-mono text-sm text-foreground flex items-center gap-1.5">
                      {selectedUser.phone ? (
                        <>
                          <Phone className="size-3.5 text-muted-foreground" />
                          <span>{formatPhone(selectedUser.phone)}</span>
                        </>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      อีเมล
                    </span>
                    <span className="text-sm text-foreground flex items-center gap-1.5">
                      {selectedUser.email ? (
                        <>
                          <Mail className="size-3.5 text-muted-foreground" />
                          <span>{selectedUser.email}</span>
                        </>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      Line ID
                    </span>
                    <span className="font-mono text-sm text-foreground flex items-center gap-1.5">
                      {selectedUser.lineId ? (
                        <>
                          <MessageSquare className="size-3.5 text-muted-foreground" />
                          <span>{selectedUser.lineId}</span>
                        </>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      เลขประจำตัวประชาชน
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      {formatCitizenId(selectedUser.citizenId)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 border-t border-border pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
            >
              ปิดหน้าต่าง
            </Button>
            <Button
              type="button"
              onClick={handleSwitchToEdit}
              className="gap-2"
            >
              <Edit2 className="size-4" />
              <span>แก้ไขข้อมูลผู้ใช้นี้</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Dialog เพิ่มข้อมูลผู้ใช้งาน (กว้าง 2 คอลัมน์ เหมือนหน้าลูกค้า) */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-3xl lg:max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="gap-1 border-b border-border pb-3 text-left">
            <DialogTitle className="text-lg font-semibold text-foreground">
              เพิ่มผู้ใช้งานใหม่
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานใหม่ในระบบ SGQ (จัดวาง 2 คอลัมน์)
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreateSubmit}
            className="space-y-4 pt-2"
            noValidate
          >
            {/* โครงสร้าง 2 คอลัมน์แบบ Balanced Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* คอลัมน์ที่ 1: ข้อมูลบัญชีและสิทธิ์ */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    <span>ข้อมูลบัญชีและสิทธิ์การใช้งาน</span>
                  </h3>
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-role"
                    className="text-xs font-medium text-foreground"
                  >
                    บทบาทผู้ใช้งาน (Role) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="create-role"
                      value={createForm.role}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, role: e.target.value })
                      }
                      className={`h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${inputErrorClass(createErrors.role)}`}
                      aria-invalid={Boolean(createErrors.role)}
                    >
                      {USER_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label} — {role.desc}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg className="size-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  <UserFieldError
                    id="create-role-error"
                    message={createErrors.role}
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-status"
                    className="text-xs font-medium text-foreground"
                  >
                    สถานะการใช้งาน (Status)
                  </label>
                  <div className="relative">
                    <select
                      id="create-status"
                      value={createForm.status}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, status: e.target.value })
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      {USER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label} — {s.desc}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg className="size-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-username"
                    className="text-xs font-medium text-foreground"
                  >
                    ชื่อผู้ใช้ (Username) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="create-username"
                    placeholder="เช่น somchai_k"
                    value={createForm.username}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        username: e.target.value.toLowerCase(),
                      })
                    }
                    maxLength={64}
                    className={`bg-background h-9 text-sm font-mono ${inputErrorClass(createErrors.username)}`}
                    aria-invalid={Boolean(createErrors.username)}
                  />
                  <UserFieldError
                    id="create-username-error"
                    message={createErrors.username}
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-password"
                    className="text-xs font-medium text-foreground"
                  >
                    รหัสผ่าน (Password) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="create-password"
                      type={showCreatePassword ? "text" : "password"}
                      placeholder="กำหนดรหัสผ่านอย่างน้อย 8 ตัวอักษร"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, password: e.target.value })
                      }
                      maxLength={128}
                      className={`bg-background h-9 text-sm pr-9 ${inputErrorClass(createErrors.password)}`}
                      aria-invalid={Boolean(createErrors.password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showCreatePassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                      }
                    >
                      {showCreatePassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <UserFieldError
                    id="create-password-error"
                    message={createErrors.password}
                  />
                </div>
              </div>

              {/* คอลัมน์ที่ 2: ข้อมูลส่วนตัวและการติดต่อ */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <span>ข้อมูลส่วนตัวและการติดต่อ</span>
                  </h3>
                </div>

                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-fullName"
                    className="text-xs font-medium text-foreground"
                  >
                    ชื่อ-นามสกุล <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="create-fullName"
                    placeholder="เช่น นายสมชาย เข็มกลัด"
                    value={createForm.fullName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, fullName: e.target.value })
                    }
                    maxLength={160}
                    className={`bg-background h-9 text-sm ${inputErrorClass(createErrors.fullName)}`}
                    aria-invalid={Boolean(createErrors.fullName)}
                  />
                  <UserFieldError
                    id="create-fullName-error"
                    message={createErrors.fullName}
                  />
                </div>

                {/* Nickname */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-nickname"
                    className="text-xs font-medium text-foreground"
                  >
                    ชื่อเล่น
                  </label>
                  <Input
                    id="create-nickname"
                    placeholder="เช่น เต๋า"
                    value={createForm.nickname || ""}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, nickname: e.target.value })
                    }
                    maxLength={64}
                    className={`bg-background h-9 text-sm ${inputErrorClass(createErrors.nickname)}`}
                    aria-invalid={Boolean(createErrors.nickname)}
                  />
                  <UserFieldError
                    id="create-nickname-error"
                    message={createErrors.nickname}
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-phone"
                    className="text-xs font-medium text-foreground"
                  >
                    เบอร์โทรศัพท์
                  </label>
                  <Input
                    id="create-phone"
                    placeholder="เช่น 081-234-5678 หรือ 02-123-4567"
                    value={createForm.phone || ""}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: formatPhone(e.target.value) })
                    }
                    maxLength={20}
                    className={`bg-background h-9 text-sm font-mono ${inputErrorClass(createErrors.phone)}`}
                    aria-invalid={Boolean(createErrors.phone)}
                  />
                  <UserFieldError
                    id="create-phone-error"
                    message={createErrors.phone}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-email"
                    className="text-xs font-medium text-foreground"
                  >
                    อีเมล
                  </label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="เช่น somchai@example.com"
                    value={createForm.email || ""}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    maxLength={160}
                    className={`bg-background h-9 text-sm ${inputErrorClass(createErrors.email)}`}
                    aria-invalid={Boolean(createErrors.email)}
                  />
                  <UserFieldError
                    id="create-email-error"
                    message={createErrors.email}
                  />
                </div>

                {/* Line ID */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-lineId"
                    className="text-xs font-medium text-foreground"
                  >
                    Line ID
                  </label>
                  <Input
                    id="create-lineId"
                    placeholder="เช่น @somchai หรือ somchai_line"
                    value={createForm.lineId || ""}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, lineId: e.target.value })
                    }
                    maxLength={100}
                    className={`bg-background h-9 text-sm font-mono ${inputErrorClass(createErrors.lineId)}`}
                    aria-invalid={Boolean(createErrors.lineId)}
                  />
                  <UserFieldError
                    id="create-lineId-error"
                    message={createErrors.lineId}
                  />
                </div>

                {/* Citizen ID */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-citizenId"
                    className="text-xs font-medium text-foreground"
                  >
                    เลขบัตรประจำตัวประชาชน
                  </label>
                  <Input
                    id="create-citizenId"
                    placeholder="เช่น 1-1004-00123-45-6 (13 หลัก)"
                    value={createForm.citizenId || ""}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        citizenId: formatCitizenIdInput(e.target.value),
                      })
                    }
                    maxLength={20}
                    className={`bg-background h-9 text-sm font-mono ${inputErrorClass(createErrors.citizenId)}`}
                    aria-invalid={Boolean(createErrors.citizenId)}
                  />
                  <UserFieldError
                    id="create-citizenId-error"
                    message={createErrors.citizenId}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-border pt-4 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <span>บันทึกข้อมูลผู้ใช้งาน</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Dialog แก้ไขข้อมูลผู้ใช้งาน (กว้าง 2 คอลัมน์ เหมือนหน้าลูกค้า) */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl lg:max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="gap-1 border-b border-border pb-3 text-left">
            <DialogTitle className="text-lg font-semibold text-foreground">
              แก้ไขข้อมูลผู้ใช้งาน
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              แก้ไขบทบาท สถานะ และข้อมูลส่วนตัวของ {selectedUser?.username} (จัดวาง 2 คอลัมน์)
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleEditSubmit}
            className="space-y-4 pt-2"
            noValidate
          >
            {/* โครงสร้าง 2 คอลัมน์แบบ Balanced Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* คอลัมน์ที่ 1: ข้อมูลบัญชีและสิทธิ์ */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    <span>ข้อมูลบัญชีและสิทธิ์การใช้งาน</span>
                  </h3>
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-role"
                    className="text-xs font-medium text-foreground"
                  >
                    บทบาทผู้ใช้งาน (Role) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="edit-role"
                      value={editForm.role || "ADMIN"}
                      onChange={(e) =>
                        setEditForm({ ...editForm, role: e.target.value })
                      }
                      className={`h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${inputErrorClass(editErrors.role)}`}
                      aria-invalid={Boolean(editErrors.role)}
                    >
                      {USER_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label} — {role.desc}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg className="size-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  <UserFieldError
                    id="edit-role-error"
                    message={editErrors.role}
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="edit-status"
                      className="text-xs font-medium text-foreground"
                    >
                      สถานะการใช้งาน (Status)
                    </label>
                    {selectedUser?.username.toLowerCase() === "admin" && (
                      <span className="text-xs text-muted-foreground font-medium">
                        ไม่สามารถระงับการใช้งาน admin ได้
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      id="edit-status"
                      value={editForm.status || "ACTIVE"}
                      disabled={selectedUser?.username.toLowerCase() === "admin"}
                      onChange={(e) =>
                        setEditForm({ ...editForm, status: e.target.value })
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:bg-muted/50 disabled:text-muted-foreground disabled:cursor-not-allowed"
                    >
                      {USER_STATUSES.map((s) => (
                        <option
                          key={s.value}
                          value={s.value}
                          disabled={
                            selectedUser?.username.toLowerCase() === "admin" &&
                            s.value === "INACTIVE"
                          }
                        >
                          {s.label} — {s.desc}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg className="size-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Username (Read Only) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="edit-username"
                      className="text-xs font-medium text-foreground"
                    >
                      ชื่อผู้ใช้ (Username)
                    </label>
                    <span className="text-xs text-muted-foreground">
                      ไม่สามารถแก้ไขได้
                    </span>
                  </div>
                  <Input
                    id="edit-username"
                    value={selectedUser?.username ?? ""}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground h-9 text-sm font-mono cursor-not-allowed"
                  />
                </div>

                {/* Password Change (Optional) */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-password"
                    className="text-xs font-medium text-foreground"
                  >
                    เปลี่ยนรหัสผ่านใหม่ (ไม่บังคับ)
                  </label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      type={showEditPassword ? "text" : "password"}
                      placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสเดิม"
                      value={editForm.password || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, password: e.target.value })
                      }
                      maxLength={128}
                      className={`bg-background h-9 text-sm pr-9 ${inputErrorClass(editErrors.password)}`}
                      aria-invalid={Boolean(editErrors.password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showEditPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                      }
                    >
                      {showEditPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <UserFieldError
                    id="edit-password-error"
                    message={editErrors.password}
                  />
                </div>
              </div>

              {/* คอลัมน์ที่ 2: ข้อมูลส่วนตัวและการติดต่อ */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <span>ข้อมูลส่วนตัวและการติดต่อ</span>
                  </h3>
                </div>

                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-fullName"
                    className="text-xs font-medium text-foreground"
                  >
                    ชื่อ-นามสกุล <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="edit-fullName"
                    placeholder="เช่น นายสมชาย เข็มกลัด"
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                    maxLength={160}
                    className={`bg-background h-9 text-sm ${inputErrorClass(editErrors.fullName)}`}
                    aria-invalid={Boolean(editErrors.fullName)}
                  />
                  <UserFieldError
                    id="edit-fullName-error"
                    message={editErrors.fullName}
                  />
                </div>

                {/* Nickname */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-nickname"
                    className="text-xs font-medium text-foreground"
                  >
                    ชื่อเล่น
                  </label>
                  <Input
                    id="edit-nickname"
                    placeholder="เช่น เต๋า"
                    value={editForm.nickname || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nickname: e.target.value })
                    }
                    maxLength={64}
                    className={`bg-background h-9 text-sm ${inputErrorClass(editErrors.nickname)}`}
                    aria-invalid={Boolean(editErrors.nickname)}
                  />
                  <UserFieldError
                    id="edit-nickname-error"
                    message={editErrors.nickname}
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-phone"
                    className="text-xs font-medium text-foreground"
                  >
                    เบอร์โทรศัพท์
                  </label>
                  <Input
                    id="edit-phone"
                    placeholder="เช่น 081-234-5678 หรือ 02-123-4567"
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: formatPhone(e.target.value) })
                    }
                    maxLength={20}
                    className={`bg-background h-9 text-sm font-mono ${inputErrorClass(editErrors.phone)}`}
                    aria-invalid={Boolean(editErrors.phone)}
                  />
                  <UserFieldError
                    id="edit-phone-error"
                    message={editErrors.phone}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-email"
                    className="text-xs font-medium text-foreground"
                  >
                    อีเมล
                  </label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="เช่น somchai@example.com"
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    maxLength={160}
                    className={`bg-background h-9 text-sm ${inputErrorClass(editErrors.email)}`}
                    aria-invalid={Boolean(editErrors.email)}
                  />
                  <UserFieldError
                    id="edit-email-error"
                    message={editErrors.email}
                  />
                </div>

                {/* Line ID */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-lineId"
                    className="text-xs font-medium text-foreground"
                  >
                    Line ID
                  </label>
                  <Input
                    id="edit-lineId"
                    placeholder="เช่น @somchai หรือ somchai_line"
                    value={editForm.lineId || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lineId: e.target.value })
                    }
                    maxLength={100}
                    className={`bg-background h-9 text-sm font-mono ${inputErrorClass(editErrors.lineId)}`}
                    aria-invalid={Boolean(editErrors.lineId)}
                  />
                  <UserFieldError
                    id="edit-lineId-error"
                    message={editErrors.lineId}
                  />
                </div>

                {/* Citizen ID */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-citizenId"
                    className="text-xs font-medium text-foreground"
                  >
                    เลขบัตรประจำตัวประชาชน
                  </label>
                  <Input
                    id="edit-citizenId"
                    placeholder="เช่น 1-1004-00123-45-6 (13 หลัก)"
                    value={editForm.citizenId || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        citizenId: formatCitizenIdInput(e.target.value),
                      })
                    }
                    maxLength={20}
                    className={`bg-background h-9 text-sm font-mono ${inputErrorClass(editErrors.citizenId)}`}
                    aria-invalid={Boolean(editErrors.citizenId)}
                  />
                  <UserFieldError
                    id="edit-citizenId-error"
                    message={editErrors.citizenId}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-border pt-4 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <span>บันทึกการเปลี่ยนแปลง</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Dialog ยืนยันการลบผู้ใช้งาน */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="gap-1 border-b border-border pb-3 text-left">
            <DialogTitle className="text-lg font-semibold text-destructive">
              ยืนยันการลบผู้ใช้งาน
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้งานนี้ออกจากระบบ?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs space-y-1.5">
              <p className="font-semibold text-destructive">
                ชื่อผู้ใช้: @{selectedUser?.username} ({selectedUser?.fullName})
              </p>
              <p className="text-muted-foreground">
                การกระทำนี้ไม่สามารถย้อนกลับได้ บัญชีผู้ใช้จะถูกลบออกจากฐานข้อมูล
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>กำลังลบ...</span>
                </>
              ) : (
                <span>ยืนยันลบผู้ใช้งาน</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
