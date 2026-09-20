"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useTable,
  tableFeatures,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Edit2,
  Eye,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
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
import {
  CUSTOMER_TYPES,
  CUSTOMER_STATUSES,
  createCustomerSchema,
  updateCustomerSchema,
  type CustomerItem,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from "@/lib/customer-types";

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, CustomerItem>();

type CustomerFormErrors = Partial<Record<keyof CreateCustomerInput, string>>;

function inputErrorClass(message?: string) {
  return message
    ? "!border-destructive focus-visible:!border-destructive focus:!border-destructive ring-1 !ring-destructive/30"
    : "";
}

function CustomerFieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  ) : null;
}

function getCustomerFormErrors(
  issues: { path: PropertyKey[]; message: string }[],
): CustomerFormErrors {
  const errors: CustomerFormErrors = {};
  for (const issue of issues) {
    const field = issue.path[0] as keyof CreateCustomerInput | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

function formatPhone(value?: string | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  // Thai landline starts with 02 (9 digits: 02-XXX-XXXX)
  if (digits.startsWith("02")) {
    const limited = digits.slice(0, 9);
    if (limited.length <= 2) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 2)}-${limited.slice(2)}`;
    return `${limited.slice(0, 2)}-${limited.slice(2, 5)}-${limited.slice(5)}`;
  }
  // Thai mobile (10 digits: 0XX-XXX-XXXX) or other standard numbers
  const limited = digits.slice(0, 10);
  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
}

function formatTaxId(value?: string | null): string {
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

export function CustomerView({
  onBack,
  userRole,
}: {
  onBack: () => void;
  userRole?: string | null;
}) {
  const { enqueueSnackbar } = useSnackbar();

  // Roles allowed to manage: SUPER_ADMIN, ADMIN, SALES
  const canManage =
    !userRole ||
    userRole === "SUPER_ADMIN" ||
    userRole === "ADMIN" ||
    userRole === "SALES";

  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Modals state: Add, Edit, View, Delete
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Active customer for view, edit or delete
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateCustomerInput>({
    customerCode: "",
    name: "",
    customerType: "COMPANY",
    taxId: "",
    contactName: "",
    phone: "",
    email: "",
    lineId: "",
    address: "",
    note: "",
    status: "ACTIVE",
  });

  const [editForm, setEditForm] = useState<UpdateCustomerInput>({
    customerCode: "",
    name: "",
    customerType: "COMPANY",
    taxId: "",
    contactName: "",
    phone: "",
    email: "",
    lineId: "",
    address: "",
    note: "",
    status: "ACTIVE",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createErrors, setCreateErrors] = useState<CustomerFormErrors>({});
  const [editErrors, setEditErrors] = useState<CustomerFormErrors>({});

  const [refreshIndex, setRefreshIndex] = useState(0);

  // Fetch customers list trigger
  const fetchCustomers = useCallback(() => {
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
        if (selectedType && selectedType !== "ALL")
          params.set("customerType", selectedType);
        if (selectedStatus && selectedStatus !== "ALL")
          params.set("status", selectedStatus);

        const res = await fetch(`/api/customers?${params.toString()}`);
        const json = await res.json();
        if (!ignore) {
          if (json.success && json.data) {
            setCustomers(json.data.items || []);
            setTotal(json.data.total || 0);
          } else {
            enqueueSnackbar(json.error || "ไม่สามารถโหลดข้อมูลลูกค้าได้", {
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
  }, [page, limit, search, selectedType, selectedStatus, refreshIndex, enqueueSnackbar]);

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  // Open View Dialog
  const handleOpenView = (customer: CustomerItem) => {
    setSelectedCustomer(customer);
    setViewDialogOpen(true);
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    setCreateForm({
      customerCode: "",
      name: "",
      customerType: "COMPANY",
      taxId: "",
      contactName: "",
      phone: "",
      email: "",
      lineId: "",
      address: "",
      note: "",
      status: "ACTIVE",
    });
    setCreateErrors({});
    setCreateDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (customer: CustomerItem) => {
    setSelectedCustomer(customer);
    setEditForm({
      customerCode: customer.customerCode,
      name: customer.name,
      customerType: customer.customerType,
      taxId: formatTaxId(customer.taxId),
      contactName: customer.contactName || "",
      phone: formatPhone(customer.phone),
      email: customer.email || "",
      lineId: customer.lineId || "",
      address: customer.address || "",
      note: customer.note || "",
      status: customer.status,
    });
    setEditErrors({});
    setEditDialogOpen(true);
  };

  // Switch from View Dialog to Edit Dialog
  const handleSwitchToEdit = () => {
    if (!selectedCustomer) return;
    setViewDialogOpen(false);
    handleOpenEdit(selectedCustomer);
  };

  // Open Delete Confirmation Dialog
  const handleOpenDelete = (customer: CustomerItem) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  // Submit Create Customer
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = createCustomerSchema.safeParse(createForm);
    if (!validation.success) {
      setCreateErrors(getCustomerFormErrors(validation.error.issues));
      return;
    }
    setCreateErrors({});

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: validation.data.name,
        customerType: validation.data.customerType,
        status: validation.data.status,
      };
      if (validation.data.customerCode?.trim()) {
        payload.customerCode = validation.data.customerCode.trim();
      }
      if (validation.data.taxId?.trim()) payload.taxId = validation.data.taxId.trim();
      if (validation.data.contactName?.trim()) payload.contactName = validation.data.contactName.trim();
      if (validation.data.phone?.trim()) payload.phone = validation.data.phone.trim();
      if (validation.data.email?.trim()) payload.email = validation.data.email.trim();
      if (validation.data.lineId?.trim()) payload.lineId = validation.data.lineId.trim();
      if (validation.data.address?.trim()) payload.address = validation.data.address.trim();
      if (validation.data.note?.trim()) payload.note = validation.data.note.trim();

      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        enqueueSnackbar("เพิ่มข้อมูลลูกค้าใหม่เรียบร้อยแล้ว", {
          variant: "success",
        });
        setCreateDialogOpen(false);
        fetchCustomers();
      } else {
        enqueueSnackbar(json.error || "ไม่สามารถสร้างข้อมูลลูกค้าได้", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("เกิดข้อผิดพลาดในการสร้างข้อมูลลูกค้า", {
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Customer
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const validation = updateCustomerSchema.safeParse(editForm);
    if (!validation.success) {
      setEditErrors(getCustomerFormErrors(validation.error.issues));
      return;
    }
    setEditErrors({});

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: validation.data.name,
        customerType: validation.data.customerType,
        status: validation.data.status,
        customerCode: validation.data.customerCode || undefined,
        taxId: validation.data.taxId || null,
        contactName: validation.data.contactName || null,
        phone: validation.data.phone || null,
        email: validation.data.email || null,
        lineId: validation.data.lineId || null,
        address: validation.data.address || null,
        note: validation.data.note || null,
      };

      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        enqueueSnackbar("บันทึกการแก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว", {
          variant: "success",
        });
        setEditDialogOpen(false);
        fetchCustomers();
      } else {
        enqueueSnackbar(json.error || "ไม่สามารถแก้ไขข้อมูลลูกค้าได้", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("เกิดข้อผิดพลาดในการแก้ไขข้อมูลลูกค้า", {
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Customer
  const handleDeleteSubmit = async () => {
    if (!selectedCustomer) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        enqueueSnackbar("ลบข้อมูลลูกค้าเรียบร้อยแล้ว", { variant: "success" });
        setDeleteDialogOpen(false);
        fetchCustomers();
      } else {
        enqueueSnackbar(json.error || "ไม่สามารถลบข้อมูลลูกค้าได้", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("เกิดข้อผิดพลาดในการลบข้อมูลลูกค้า", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // TanStack Table Column Definitions
  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("customerCode", {
          header: "รหัสลูกค้า",
          cell: (info) => (
            <button
              type="button"
              onClick={() => handleOpenView(info.row.original)}
              className="font-mono text-xs sm:text-sm font-medium text-primary hover:underline cursor-pointer text-left whitespace-nowrap"
              title="คลิกเพื่อดูรายละเอียดลูกค้า"
            >
              {info.row.original.customerCode}
            </button>
          ),
        }),
        helper.accessor("name", {
          header: "ชื่อลูกค้า / บริษัท",
          cell: (info) => {
            const customer = info.row.original;
            const isCompany = customer.customerType === "COMPANY";
            return (
              <div className="flex flex-col gap-1 py-1">
                <button
                  type="button"
                  onClick={() => handleOpenView(customer)}
                  className="font-medium text-foreground text-sm truncate max-w-[220px] hover:text-primary transition-colors text-left"
                  title={customer.name}
                >
                  {customer.name}
                </button>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="text-xs h-5 px-1.5 font-normal border-border/80 text-muted-foreground gap-1"
                  >
                    {isCompany ? (
                      <>
                        <Building2 className="size-2.5" />
                        <span>นิติบุคคล</span>
                      </>
                    ) : (
                      <>
                        <User className="size-2.5" />
                        <span>บุคคลธรรมดา</span>
                      </>
                    )}
                  </Badge>
                  {customer.taxId && (
                    <span className="text-xs text-muted-foreground font-mono">
                      Tax: {formatTaxId(customer.taxId)}
                    </span>
                  )}
                </div>
              </div>
            );
          },
        }),
        helper.accessor("contactName", {
          header: "ชื่อผู้ติดต่อ",
          cell: (info) => (
            <span className="text-sm text-foreground">
              {info.row.original.contactName || "-"}
            </span>
          ),
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
        helper.accessor("status", {
          header: "สถานะ",
          cell: (info) => {
            const isActive = info.row.original.status === "ACTIVE";
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
            const customer = info.row.original;
            return (
              <div className="flex items-center justify-end gap-1.5">
                {/* ดูข้อมูลลูกค้า */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleOpenView(customer)}
                  className="size-7 rounded-md border border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border transition-colors"
                  title="ดูรายละเอียดลูกค้า"
                  aria-label={`ดูรายละเอียด ${customer.name}`}
                >
                  <Eye className="size-3.5" />
                </Button>
                {/* แก้ไขข้อมูลลูกค้า */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleOpenEdit(customer)}
                  disabled={!canManage}
                  className="size-7 rounded-md border border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="แก้ไขข้อมูลลูกค้า"
                  aria-label={`แก้ไข ${customer.name}`}
                >
                  <Edit2 className="size-3.5" />
                </Button>
                {/* ลบข้อมูลลูกค้า */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleOpenDelete(customer)}
                  disabled={!canManage}
                  className="size-7 rounded-md border border-border/70 bg-muted/50 text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive dark:hover:border-destructive/40 dark:hover:bg-destructive/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="ลบข้อมูลลูกค้า"
                  aria-label={`ลบ ${customer.name}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            );
          },
        }),
      ]),
    [canManage],
  );

  // Initialize TanStack Table instance
  const table = useTable({
    features,
    columns,
    data: customers,
  });

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-5">
      {/* 1. Page Header: ข้อมูลลูกค้า */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="size-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="กลับหน้าภาพรวม"
            title="กลับหน้าภาพรวม"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="w-px self-stretch bg-border" aria-hidden="true" />

          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl leading-tight">
              ข้อมูลลูกค้า
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              จัดการรายชื่อลูกค้าและคู่ค้า แสดงรหัสลูกค้า, ประเภท, ชื่อผู้ติดต่อ, เบอร์โทร และสถานะ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCustomers()}
            disabled={isLoading}
            className="h-9 gap-1.5"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">รีเฟรช</span>
          </Button>

          {canManage && (
            <Button onClick={handleOpenCreate} className="h-9 gap-1.5 shadow-xs">
              <Plus className="size-4" />
              <span>เพิ่มข้อมูลลูกค้า</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Unified Card: ค้นหา + ตาราง (หัวข้อในตารางชื่อ รายชื่อลูกค้าในระบบ) */}
      <Card className="border border-border/80 shadow-xs overflow-hidden">
        {/* Card Header & Search/Filter Toolbar */}
        <div className="p-4 sm:p-5 bg-card space-y-4">
          <div className="flex items-center gap-2.5 w-full justify-between">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              รายชื่อลูกค้าในระบบ
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
                placeholder="ค้นหารหัสลูกค้า, ชื่อบริษัท, ผู้ติดต่อ, เลขผู้เสียภาษี, เบอร์โทร..."
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

            {/* Filter: Customer Type */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative min-w-[160px]">
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground font-medium shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  aria-label="กรองตามประเภทลูกค้า"
                >
                  <option value="ALL">ทุกประเภท (All Types)</option>
                  {CUSTOMER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="size-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>

              {/* Filter: Status */}
              <div className="relative min-w-[140px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground font-medium shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  aria-label="กรองตามสถานะลูกค้า"
                >
                  <option value="ALL">ทุกสถานะ (All Status)</option>
                  {CUSTOMER_STATUSES.map((s) => (
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
            </div>
          </form>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                          กำลังโหลดข้อมูลลูกค้า...
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
                          ไม่พบข้อมูลลูกค้า
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {search
                            ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองประเภท/สถานะ"
                            : 'คลิก "เพิ่มข้อมูลลูกค้า" เพื่อสร้างรายการแรกในระบบ'}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground bg-muted/15">
              <span>
                แสดง {(page - 1) * limit + 1} - {Math.min(page * limit, total)}{" "}
                จาก {total} รายการ
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

      {/* 3. Dialog ดูข้อมูลลูกค้า (กว้าง 2 คอลัมน์) */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl lg:max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="gap-1 border-b border-border pb-3 text-left">
            <div className="flex items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span>รายละเอียดข้อมูลลูกค้า</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  รายละเอียดข้อมูลลูกค้าสำหรับเอกสารใบเสนอราคาและโครงการก่อสร้าง
                </DialogDescription>
              </div>
              {selectedCustomer && (
                <div className="shrink-0 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      selectedCustomer.status === "ACTIVE"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 gap-1 font-medium text-xs"
                        : "border-border bg-muted/60 text-muted-foreground gap-1 font-medium text-xs"
                    }
                  >
                    {selectedCustomer.status === "ACTIVE" && (
                      <CheckCircle2 className="size-3" />
                    )}
                    {selectedCustomer.status === "ACTIVE" ? "ใช้งาน" : "ไม่ใช้งาน"}
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>

          {selectedCustomer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
              {/* คอลัมน์ซ้าย: ข้อมูลทั่วไปและองค์กร */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2.5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    <span>ข้อมูลทั่วไปและองค์กร</span>
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      รหัสลูกค้า (Customer Code)
                    </span>
                    <span className="font-mono text-sm font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 inline-block">
                      {selectedCustomer.customerCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      ชื่อลูกค้า / ชื่อบริษัท
                    </span>
                    <span className="font-medium text-foreground text-sm leading-relaxed block">
                      {selectedCustomer.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      ประเภทลูกค้า
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs font-normal border-border/80 gap-1"
                    >
                      {selectedCustomer.customerType === "COMPANY" ? (
                        <>
                          <Building2 className="size-3" />
                          <span>นิติบุคคล (Company)</span>
                        </>
                      ) : (
                        <>
                          <User className="size-3" />
                          <span>บุคคลธรรมดา (Individual)</span>
                        </>
                      )}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      เลขประจำตัวผู้เสียภาษี / บัตรประชาชน
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      {formatTaxId(selectedCustomer.taxId) || "-"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="block font-medium">วันที่สร้างข้อมูล</span>
                      <span className="mt-0.5 block font-mono">
                        {formatDate(selectedCustomer.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="block font-medium">อัปเดตล่าสุด</span>
                      <span className="mt-0.5 block font-mono">
                        {formatDate(selectedCustomer.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* คอลัมน์ขวา: ข้อมูลติดต่อและที่อยู่ */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2.5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <span>ข้อมูลการติดต่อและที่อยู่</span>
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      ชื่อผู้ติดต่อ
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      {selectedCustomer.contactName || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      เบอร์โทรศัพท์
                    </span>
                    <span className="font-mono text-sm text-foreground flex items-center gap-1.5">
                      {selectedCustomer.phone ? (
                        <>
                          <Phone className="size-3.5 text-muted-foreground" />
                          <span>{formatPhone(selectedCustomer.phone)}</span>
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
                      {selectedCustomer.email ? (
                        <>
                          <Mail className="size-3.5 text-muted-foreground" />
                          <span>{selectedCustomer.email}</span>
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
                      {selectedCustomer.lineId ? (
                        <>
                          <MessageSquare className="size-3.5 text-muted-foreground" />
                          <span>{selectedCustomer.lineId}</span>
                        </>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      ที่อยู่สำหรับออกเอกสาร
                    </span>
                    <div className="text-sm text-foreground flex items-start gap-1.5 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/60">
                      <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{selectedCustomer.address || "-"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      หมายเหตุเพิ่มเติม
                    </span>
                    <div className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/50">
                      {selectedCustomer.note || "ไม่มีหมายเหตุ"}
                    </div>
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
            {canManage && (
              <Button
                type="button"
                onClick={handleSwitchToEdit}
                className="gap-2"
              >
                <Edit2 className="size-4" />
                <span>แก้ไขข้อมูลลูกค้านี้</span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Dialog เพิ่มข้อมูลลูกค้า (กว้าง 2 คอลัมน์) */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-3xl lg:max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="gap-1 border-b border-border pb-3 text-left">
            <DialogTitle className="text-lg font-semibold text-foreground">
              เพิ่มข้อมูลลูกค้าใหม่
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              กรอกข้อมูลลูกค้าหรือบริษัทเพื่อใช้จัดทำใบเสนอราคาและโครงการ (จัดวาง 2 คอลัมน์)
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreateSubmit}
            className="space-y-4 pt-2"
            noValidate
          >
            {/* โครงสร้าง 2 คอลัมน์แบบ Balanced Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* คอลัมน์ที่ 1: ข้อมูลลูกค้าและองค์กร */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    <span>ข้อมูลทั่วไปและองค์กร</span>
                  </h3>
                </div>

                {/* Customer Code */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="create-customerCode"
                      className="text-xs font-medium text-foreground"
                    >
                      รหัสลูกค้า (Customer Code)
                    </label>
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0 h-5 font-normal border-primary/30 bg-primary/10 text-primary"
                    >
                      สร้างให้อัตโนมัติ
                    </Badge>
                  </div>
                  <Input
                    id="create-customerCode"
                    value="(ระบบจะสร้างรหัสให้อัตโนมัติเมื่อกดบันทึก)"
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground h-9 text-sm font-mono cursor-not-allowed border-dashed"
                  />
                  <span className="text-xs text-muted-foreground">
                    รหัสจะถูกสร้างตามลำดับ เช่น CUST-2026-0006
                  </span>
                </div>

                {/* Customer Type */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-customerType"
                    className="text-xs font-medium text-foreground"
                  >
                    ประเภทลูกค้า
                  </label>
                  <div className="relative">
                    <select
                      id="create-customerType"
                      value={createForm.customerType}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, customerType: e.target.value })
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      {CUSTOMER_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
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

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-name"
                    className="text-xs font-medium text-foreground"
                  >
                    ชื่อลูกค้า / ชื่อบริษัท <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="create-name"
                    placeholder="เช่น บริษัท พราวด์ บิลด์ดิ้ง จำกัด"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    maxLength={200}
                    className={`bg-background h-9 text-sm ${inputErrorClass(createErrors.name)}`}
                    aria-invalid={Boolean(createErrors.name)}
                  />
                  <CustomerFieldError
                    id="create-name-error"
                    message={createErrors.name}
                  />
                </div>

                {/* Tax ID */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-taxId"
                    className="text-xs font-medium text-foreground"
                  >
                    เลขประจำตัวผู้เสียภาษี / เลขบัตรประชาชน
                  </label>
                  <Input
                    id="create-taxId"
                    placeholder="เช่น 0-1055-58123-45-6"
                    value={createForm.taxId || ""}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, taxId: formatTaxId(e.target.value) })
                    }
                    maxLength={20}
                    className={`bg-background h-9 text-sm font-mono ${inputErrorClass(createErrors.taxId)}`}
                    aria-invalid={Boolean(createErrors.taxId)}
                  />
                  <CustomerFieldError
                    id="create-taxId-error"
                    message={createErrors.taxId}
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-status"
                    className="text-xs font-medium text-foreground"
                  >
                    สถานะลูกค้า
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
                      {CUSTOMER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
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
              </div>

              {/* คอลัมน์ที่ 2: ข้อมูลผู้ติดต่อและที่อยู่ */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <span>ข้อมูลการติดต่อและที่อยู่</span>
                  </h3>
                </div>

                {/* Contact Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-contactName"
                    className="text-xs font-medium text-foreground"
                  >
                    ชื่อผู้ติดต่อ
                  </label>
                  <Input
                    id="create-contactName"
                    placeholder="เช่น คุณสมชาย เข็มกลัด"
                    value={createForm.contactName || ""}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, contactName: e.target.value })
                    }
                    maxLength={160}
                    className={`bg-background h-9 text-sm ${inputErrorClass(createErrors.contactName)}`}
                    aria-invalid={Boolean(createErrors.contactName)}
                  />
                  <CustomerFieldError
                    id="create-contactName-error"
                    message={createErrors.contactName}
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
                  <CustomerFieldError
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
                    placeholder="เช่น contact@example.com"
                    value={createForm.email || ""}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    maxLength={160}
                    className={`bg-background h-9 text-sm ${inputErrorClass(createErrors.email)}`}
                    aria-invalid={Boolean(createErrors.email)}
                  />
                  <CustomerFieldError
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
                    placeholder="เช่น @proudbuilding หรือ somchai_line"
                    value={createForm.lineId || ""}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, lineId: e.target.value })
                    }
                    maxLength={100}
                    className={`bg-background h-9 text-sm ${inputErrorClass(createErrors.lineId)}`}
                    aria-invalid={Boolean(createErrors.lineId)}
                  />
                  <CustomerFieldError
                    id="create-lineId-error"
                    message={createErrors.lineId}
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-address"
                    className="text-xs font-medium text-foreground"
                  >
                    ที่อยู่สำหรับออกเอกสาร
                  </label>
                  <Input
                    id="create-address"
                    placeholder="ที่อยู่สำหรับออกเอกสารและใบเสนอราคา"
                    value={createForm.address || ""}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, address: e.target.value })
                    }
                    maxLength={500}
                    className={`bg-background h-9 text-sm ${inputErrorClass(createErrors.address)}`}
                    aria-invalid={Boolean(createErrors.address)}
                  />
                  <CustomerFieldError
                    id="create-address-error"
                    message={createErrors.address}
                  />
                </div>

                {/* Note */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-note"
                    className="text-xs font-medium text-foreground"
                  >
                    หมายเหตุเพิ่มเติม
                  </label>
                  <Input
                    id="create-note"
                    placeholder="รายละเอียดเพิ่มเติม"
                    value={createForm.note || ""}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, note: e.target.value })
                    }
                    maxLength={500}
                    className={`bg-background h-9 text-sm ${inputErrorClass(createErrors.note)}`}
                    aria-invalid={Boolean(createErrors.note)}
                  />
                  <CustomerFieldError
                    id="create-note-error"
                    message={createErrors.note}
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
                  <span>บันทึกข้อมูลลูกค้า</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Dialog แก้ไขข้อมูลลูกค้า (กว้าง 2 คอลัมน์) */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl lg:max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="gap-1 border-b border-border pb-3 text-left">
            <DialogTitle className="text-lg font-semibold text-foreground">
              แก้ไขข้อมูลลูกค้า
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              แก้ไขรายละเอียดของ {selectedCustomer?.name} (จัดวาง 2 คอลัมน์)
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleEditSubmit}
            className="space-y-4 pt-2"
            noValidate
          >
            {/* โครงสร้าง 2 คอลัมน์แบบ Balanced Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* คอลัมน์ที่ 1: ข้อมูลลูกค้าและองค์กร */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    <span>ข้อมูลทั่วไปและองค์กร</span>
                  </h3>
                </div>

                {/* Customer Code */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="edit-customerCode"
                      className="text-xs font-medium text-foreground"
                    >
                      รหัสลูกค้า (Customer Code)
                    </label>
                    <span className="text-xs text-muted-foreground">
                      ไม่สามารถแก้ไขได้
                    </span>
                  </div>
                  <Input
                    id="edit-customerCode"
                    value={editForm.customerCode || ""}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground h-9 text-sm font-mono cursor-not-allowed"
                  />
                </div>

                {/* Customer Type */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-customerType"
                    className="text-xs font-medium text-foreground"
                  >
                    ประเภทลูกค้า
                  </label>
                  <div className="relative">
                    <select
                      id="edit-customerType"
                      value={editForm.customerType}
                      onChange={(e) =>
                        setEditForm({ ...editForm, customerType: e.target.value })
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      {CUSTOMER_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
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

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-name"
                    className="text-xs font-medium text-foreground"
                  >
                    ชื่อลูกค้า / ชื่อบริษัท <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    maxLength={200}
                    className={`bg-background h-9 text-sm ${inputErrorClass(editErrors.name)}`}
                    aria-invalid={Boolean(editErrors.name)}
                  />
                  <CustomerFieldError
                    id="edit-name-error"
                    message={editErrors.name}
                  />
                </div>

                {/* Tax ID */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-taxId"
                    className="text-xs font-medium text-foreground"
                  >
                    เลขประจำตัวผู้เสียภาษี / เลขบัตรประชาชน
                  </label>
                  <Input
                    id="edit-taxId"
                    value={editForm.taxId || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, taxId: formatTaxId(e.target.value) })
                    }
                    maxLength={20}
                    className={`bg-background h-9 text-sm font-mono ${inputErrorClass(editErrors.taxId)}`}
                    aria-invalid={Boolean(editErrors.taxId)}
                  />
                  <CustomerFieldError
                    id="edit-taxId-error"
                    message={editErrors.taxId}
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-status"
                    className="text-xs font-medium text-foreground"
                  >
                    สถานะลูกค้า
                  </label>
                  <div className="relative">
                    <select
                      id="edit-status"
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({ ...editForm, status: e.target.value })
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      {CUSTOMER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
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
              </div>

              {/* คอลัมน์ที่ 2: ข้อมูลผู้ติดต่อและที่อยู่ */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <span>ข้อมูลการติดต่อและที่อยู่</span>
                  </h3>
                </div>

                {/* Contact Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-contactName"
                    className="text-xs font-medium text-foreground"
                  >
                    ชื่อผู้ติดต่อ
                  </label>
                  <Input
                    id="edit-contactName"
                    value={editForm.contactName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, contactName: e.target.value })
                    }
                    maxLength={160}
                    className={`bg-background h-9 text-sm ${inputErrorClass(editErrors.contactName)}`}
                    aria-invalid={Boolean(editErrors.contactName)}
                  />
                  <CustomerFieldError
                    id="edit-contactName-error"
                    message={editErrors.contactName}
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
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: formatPhone(e.target.value) })
                    }
                    maxLength={20}
                    className={`bg-background h-9 text-sm font-mono ${inputErrorClass(editErrors.phone)}`}
                    aria-invalid={Boolean(editErrors.phone)}
                  />
                  <CustomerFieldError
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
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    maxLength={160}
                    className={`bg-background h-9 text-sm ${inputErrorClass(editErrors.email)}`}
                    aria-invalid={Boolean(editErrors.email)}
                  />
                  <CustomerFieldError
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
                    placeholder="เช่น @proudbuilding หรือ somchai_line"
                    value={editForm.lineId || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lineId: e.target.value })
                    }
                    maxLength={100}
                    className={`bg-background h-9 text-sm ${inputErrorClass(editErrors.lineId)}`}
                    aria-invalid={Boolean(editErrors.lineId)}
                  />
                  <CustomerFieldError
                    id="edit-lineId-error"
                    message={editErrors.lineId}
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-address"
                    className="text-xs font-medium text-foreground"
                  >
                    ที่อยู่สำหรับออกเอกสาร
                  </label>
                  <Input
                    id="edit-address"
                    value={editForm.address || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    maxLength={500}
                    className={`bg-background h-9 text-sm ${inputErrorClass(editErrors.address)}`}
                    aria-invalid={Boolean(editErrors.address)}
                  />
                  <CustomerFieldError
                    id="edit-address-error"
                    message={editErrors.address}
                  />
                </div>

                {/* Note */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-note"
                    className="text-xs font-medium text-foreground"
                  >
                    หมายเหตุเพิ่มเติม
                  </label>
                  <Input
                    id="edit-note"
                    value={editForm.note || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, note: e.target.value })
                    }
                    maxLength={500}
                    className={`bg-background h-9 text-sm ${inputErrorClass(editErrors.note)}`}
                    aria-invalid={Boolean(editErrors.note)}
                  />
                  <CustomerFieldError
                    id="edit-note-error"
                    message={editErrors.note}
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
                  <span>บันทึกการแก้ไข</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Dialog ยืนยันการลบลูกค้า */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="gap-1 border-b border-border pb-3 text-left">
            <DialogTitle className="text-lg font-semibold text-destructive">
              ยืนยันการลบข้อมูลลูกค้า
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้ารายนี้ออกจากระบบ?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs space-y-1.5">
              <p className="font-semibold text-destructive">
                ชื่อลูกค้า: {selectedCustomer?.name}
              </p>
              <p className="text-muted-foreground">
                รหัสลูกค้า: {selectedCustomer?.customerCode}
              </p>
              <p className="text-muted-foreground">
                การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลลูกค้าจะถูกลบออกจากฐานข้อมูล
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
                <span>ยืนยันลบลูกค้า</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
