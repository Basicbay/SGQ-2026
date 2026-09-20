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
  Calendar,
  CheckCircle2,
  Clock3,
  Coins,
  Edit2,
  Eye,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  PauseCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
  X,
  XCircle,
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
  PROJECT_TYPES,
  PROJECT_STATUSES,
  createProjectSchema,
  updateProjectSchema,
  type ProjectItem,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/project-types";
import type { CustomerItem } from "@/lib/customer-types";

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, ProjectItem>();

type ProjectFormErrors = Partial<Record<keyof CreateProjectInput, string>>;

function inputErrorClass(message?: string) {
  return message
    ? "!border-destructive focus-visible:!border-destructive focus:!border-destructive ring-1 !ring-destructive/30"
    : "";
}

function ProjectFieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  ) : null;
}

function getProjectFormErrors(
  issues: { path: PropertyKey[]; message: string }[],
): ProjectFormErrors {
  const errors: ProjectFormErrors = {};
  for (const issue of issues) {
    const field = issue.path[0] as keyof CreateProjectInput | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PLANNING":
      return (
        <Badge
          variant="outline"
          className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-400 gap-1 font-medium text-xs"
        >
          <Clock3 className="size-3" />
          วางแผน
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400 gap-1 font-medium text-xs"
        >
          <Loader2 className="size-3 animate-spin" />
          กำลังดำเนินการ
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 gap-1 font-medium text-xs"
        >
          <CheckCircle2 className="size-3" />
          เสร็จสิ้น
        </Badge>
      );
    case "ON_HOLD":
      return (
        <Badge
          variant="outline"
          className="border-orange-500/30 bg-orange-500/10 text-orange-600 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-400 gap-1 font-medium text-xs"
        >
          <PauseCircle className="size-3" />
          พักโครงการ
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className="border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/15 dark:text-destructive gap-1 font-medium text-xs"
        >
          <XCircle className="size-3" />
          ยกเลิก
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground gap-1 font-medium text-xs">
          {status}
        </Badge>
      );
  }
}

function getProjectTypeLabel(type: string) {
  const found = PROJECT_TYPES.find((t) => t.value === type);
  return found ? found.label.split(" (")[0] : type;
}

export function ProjectView({
  onBack,
  userRole,
}: {
  onBack: () => void;
  userRole?: string | null;
}) {
  const { enqueueSnackbar } = useSnackbar();

  // Permissions: SUPER_ADMIN, ADMIN, SALES, ESTIMATOR
  const canManage =
    !userRole ||
    userRole === "SUPER_ADMIN" ||
    userRole === "ADMIN" ||
    userRole === "SALES" ||
    userRole === "ESTIMATOR";

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateProjectInput>({
    projectCode: "",
    name: "",
    customerId: "",
    projectType: "CONSTRUCTION",
    location: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "PLANNING",
    description: "",
    note: "",
  });
  const [createErrors, setCreateErrors] = useState<ProjectFormErrors>({});

  const [editForm, setEditForm] = useState<UpdateProjectInput>({
    projectCode: "",
    name: "",
    customerId: "",
    projectType: "CONSTRUCTION",
    location: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "PLANNING",
    description: "",
    note: "",
  });
  const [editErrors, setEditErrors] = useState<ProjectFormErrors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Fetch customers for dropdown
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers?limit=100", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data?.items) {
        setCustomers(data.data.items);
      }
    } catch {
      // Ignore customer dropdown load error silently
    }
  }, []);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  // Fetch projects list
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search.trim()) params.set("search", search.trim());
      if (selectedType !== "ALL") params.set("projectType", selectedType);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);

      const res = await fetch(`/api/projects?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "ไม่สามารถดึงข้อมูลโครงการได้");
      }

      setProjects(data.data.items || []);
      setTotal(data.data.total || 0);
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูลโครงการ",
        { variant: "error" },
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, selectedType, selectedStatus, enqueueSnackbar]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (search.trim()) params.set("search", search.trim());
        if (selectedType !== "ALL") params.set("projectType", selectedType);
        if (selectedStatus !== "ALL") params.set("status", selectedStatus);

        const res = await fetch(`/api/projects?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!ignore) {
          if (!res.ok || !data.success) {
            throw new Error(data?.error || "ไม่สามารถดึงข้อมูลโครงการได้");
          }
          setProjects(data.data.items || []);
          setTotal(data.data.total || 0);
        }
      } catch (err) {
        if (!ignore) {
          enqueueSnackbar(
            err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูลโครงการ",
            { variant: "error" },
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    void run();
    return () => {
      ignore = true;
    };
  }, [page, limit, search, selectedType, selectedStatus, refreshIndex, enqueueSnackbar]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const handleOpenView = (project: ProjectItem) => {
    setSelectedProject(project);
    setViewDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setCreateForm({
      projectCode: "",
      name: "",
      customerId: "",
      projectType: "CONSTRUCTION",
      location: "",
      budget: "",
      startDate: "",
      endDate: "",
      status: "PLANNING",
      description: "",
      note: "",
    });
    setCreateErrors({});
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (project: ProjectItem) => {
    setSelectedProject(project);
    setEditForm({
      projectCode: project.projectCode,
      name: project.name,
      customerId: project.customerId || "",
      projectType: project.projectType,
      location: project.location || "",
      budget: project.budget !== undefined && project.budget !== null ? String(project.budget) : "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      status: project.status,
      description: project.description || "",
      note: project.note || "",
    });
    setEditErrors({});
    setEditDialogOpen(true);
  };

  const handleSwitchToEdit = () => {
    if (!selectedProject) return;
    setViewDialogOpen(false);
    handleOpenEdit(selectedProject);
  };

  const handleOpenDelete = (project: ProjectItem) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  // Submit Create Project
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = createProjectSchema.safeParse(createForm);
    if (!validation.success) {
      setCreateErrors(getProjectFormErrors(validation.error.issues));
      return;
    }
    setCreateErrors({});

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: validation.data.name,
        projectType: validation.data.projectType,
        status: validation.data.status,
      };
      if (validation.data.customerId) {
        payload.customerId = validation.data.customerId;
      }
      if (validation.data.location?.trim()) {
        payload.location = validation.data.location.trim();
      }
      if (validation.data.budget !== undefined && validation.data.budget !== "") {
        payload.budget = Number(validation.data.budget);
      }
      if (validation.data.startDate) {
        payload.startDate = validation.data.startDate;
      }
      if (validation.data.endDate) {
        payload.endDate = validation.data.endDate;
      }
      if (validation.data.description?.trim()) {
        payload.description = validation.data.description.trim();
      }
      if (validation.data.note?.trim()) {
        payload.note = validation.data.note.trim();
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "เกิดข้อผิดพลาดในการสร้างโครงการ");
      }

      enqueueSnackbar("สร้างข้อมูลโครงการใหม่สำเร็จ", { variant: "success" });
      setCreateDialogOpen(false);
      setRefreshIndex((i) => i + 1);
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างโครงการ",
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Project
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const validation = updateProjectSchema.safeParse(editForm);
    if (!validation.success) {
      setEditErrors(getProjectFormErrors(validation.error.issues));
      return;
    }
    setEditErrors({});

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: validation.data.name,
        projectType: validation.data.projectType,
        status: validation.data.status,
      };
      payload.customerId = validation.data.customerId || null;
      payload.location = validation.data.location?.trim() || null;
      if (validation.data.budget !== undefined && validation.data.budget !== "") {
        payload.budget = Number(validation.data.budget);
      } else {
        payload.budget = 0;
      }
      payload.startDate = validation.data.startDate || null;
      payload.endDate = validation.data.endDate || null;
      payload.description = validation.data.description?.trim() || null;
      payload.note = validation.data.note?.trim() || null;

      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "เกิดข้อผิดพลาดในการอัปเดตข้อมูลโครงการ");
      }

      enqueueSnackbar("แก้ไขข้อมูลโครงการสำเร็จ", { variant: "success" });
      setEditDialogOpen(false);
      setRefreshIndex((i) => i + 1);
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปเดตข้อมูลโครงการ",
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Project
  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "เกิดข้อผิดพลาดในการลบข้อมูลโครงการ");
      }

      enqueueSnackbar("ลบข้อมูลโครงการเรียบร้อยแล้ว", { variant: "success" });
      setDeleteDialogOpen(false);
      setSelectedProject(null);
      setRefreshIndex((i) => i + 1);
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบข้อมูลโครงการ",
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // TanStack columns definition
  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("projectCode", {
          header: "รหัสโครงการ",
          cell: (info) => (
            <span className="font-mono text-xs font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 whitespace-nowrap">
              {info.getValue()}
            </span>
          ),
        }),
        helper.accessor("name", {
          header: "ชื่อโครงการ / ทำเลที่ตั้ง",
          cell: (info) => {
            const project = info.row.original;
            return (
              <div className="flex flex-col gap-1 min-w-[200px] max-w-[360px]">
                <span className="font-medium text-sm text-foreground break-words whitespace-normal leading-snug">
                  {project.name}
                </span>
                {project.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                    <MapPin className="size-3 shrink-0 text-muted-foreground/70" />
                    <span className="truncate" title={project.location}>
                      {project.location}
                    </span>
                  </div>
                )}
              </div>
            );
          },
        }),
        helper.accessor("customerName", {
          header: "ลูกค้าผู้ว่าจ้าง",
          cell: (info) => {
            const project = info.row.original;
            const customerName = project.customer?.name || project.customerName;
            return (
              <div className="flex items-center gap-1.5 text-sm text-foreground max-w-[200px] truncate">
                <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{customerName || "-"}</span>
              </div>
            );
          },
        }),
        helper.accessor("projectType", {
          header: "ประเภท",
          cell: (info) => (
            <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
              {getProjectTypeLabel(info.getValue())}
            </span>
          ),
        }),
        helper.accessor("budget", {
          header: "งบประมาณ (บาท)",
          cell: (info) => (
            <span className="text-sm font-mono font-medium text-foreground whitespace-nowrap">
              {formatCurrency(info.getValue())}
            </span>
          ),
        }),
        helper.accessor("startDate", {
          header: "ระยะเวลาโครงการ",
          cell: (info) => {
            const project = info.row.original;
            if (!project.startDate && !project.endDate) return <span className="text-muted-foreground">-</span>;
            return (
              <div className="flex flex-col text-xs font-mono text-muted-foreground whitespace-nowrap">
                <span>เริ่ม: {formatDate(project.startDate)}</span>
                {project.endDate && <span>สิ้นสุด: {formatDate(project.endDate)}</span>}
              </div>
            );
          },
        }),
        helper.accessor("status", {
          header: "สถานะ",
          cell: (info) => getStatusBadge(info.getValue()),
        }),
        helper.display({
          id: "actions",
          header: () => <div className="text-right">การจัดการ</div>,
          cell: (info) => {
            const project = info.row.original;
            return (
              <div className="flex items-center justify-end gap-1.5">
                {/* ดูข้อมูลโครงการ */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleOpenView(project)}
                  className="size-7 rounded-md border border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border transition-colors"
                  title="ดูรายละเอียดโครงการ"
                  aria-label={`ดูรายละเอียด ${project.name}`}
                >
                  <Eye className="size-3.5" />
                </Button>
                {/* แก้ไขข้อมูลโครงการ */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleOpenEdit(project)}
                  disabled={!canManage}
                  className="size-7 rounded-md border border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="แก้ไขข้อมูลโครงการ"
                  aria-label={`แก้ไข ${project.name}`}
                >
                  <Edit2 className="size-3.5" />
                </Button>
                {/* ลบข้อมูลโครงการ */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleOpenDelete(project)}
                  disabled={!canManage}
                  className="size-7 rounded-md border border-border/70 bg-muted/50 text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive dark:hover:border-destructive/40 dark:hover:bg-destructive/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="ลบข้อมูลโครงการ"
                  aria-label={`ลบ ${project.name}`}
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

  const table = useTable({
    features,
    columns,
    data: projects,
  });

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-5">
      {/* 1. Page Header: ข้อมูลโครงการ */}
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
              ข้อมูลโครงการ (Projects)
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              บริหารจัดการโครงการก่อสร้าง ขอบเขตงาน งบประมาณ และความคืบหน้าของโครงการ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenCreate}
            disabled={!canManage}
            className="h-9 gap-1.5 shadow-xs"
          >
            <Plus className="size-4" />
            <span>เพิ่มข้อมูลโครงการ</span>
          </Button>
        </div>
      </div>

      {/* 2. Main Card: Table & Filter Controls */}
      <Card className="border border-border shadow-xs overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="border-b border-border p-4 bg-card">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="ค้นหารหัส, ชื่อโครงการ, ทำเล, หรือลูกค้า..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm bg-background"
                />
              </div>

              {/* Type Filter */}
              <div className="relative w-44">
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  aria-label="กรองประเภทโครงการ"
                >
                  <option value="ALL">ทุกประเภทโครงการ</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label.split(" (")[0]}
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
              <div className="relative w-40">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  aria-label="กรองสถานะโครงการ"
                >
                  <option value="ALL">ทุกสถานะโครงการ</option>
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label.split(" (")[0]}
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

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="h-9 gap-1.5 px-3 text-xs"
              >
                <Search className="size-3.5" />
                <span>ค้นหา</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedType("ALL");
                  setSelectedStatus("ALL");
                  setPage(1);
                  setRefreshIndex((i) => i + 1);
                }}
                className="h-9 gap-1.5 px-3 text-xs"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className="size-3.5" />
                <span>ล้างตัวกรอง</span>
              </Button>
            </div>
          </form>
        </div>

        {/* TanStack Table Content */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b border-border hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header, index) => (
                      <TableHead
                        key={header.id}
                        className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider h-10 ${
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
                          กำลังโหลดข้อมูลโครงการ...
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
                        <Building2 className="size-8 text-muted-foreground/40" />
                        <p className="text-sm font-semibold text-foreground">
                          ไม่พบข้อมูลโครงการ
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {search
                            ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองประเภท/สถานะ"
                            : 'คลิก "เพิ่มข้อมูลโครงการ" เพื่อสร้างโครงการแรกในระบบ'}
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
                แสดง {(page - 1) * limit + 1} - {Math.min(page * limit, total)} จาก {total} รายการ
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

      {/* 3. Dialog ดูข้อมูลโครงการ (กว้าง 3 คอลัมน์แบบ Balanced Grid) */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="gap-1 border-b border-border pb-3 text-left">
            <div className="flex items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="size-5 text-primary" />
                  <span>รายละเอียดข้อมูลโครงการ</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  รายละเอียดขอบเขตโครงการ สัญญาก่อสร้าง และงบประมาณ
                </DialogDescription>
              </div>
              {selectedProject && (
                <div className="shrink-0 flex items-center gap-2">
                  {getStatusBadge(selectedProject.status)}
                </div>
              )}
            </div>
          </DialogHeader>

          {selectedProject && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-3">
              {/* คอลัมน์ที่ 1: ข้อมูลโครงการและสัญญา */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2.5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    <span>ข้อมูลโครงการและสัญญา</span>
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      รหัสโครงการ (Project Code)
                    </span>
                    <span className="font-mono text-xs font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 inline-block">
                      {selectedProject.projectCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      ชื่อโครงการ
                    </span>
                    <div className="font-medium text-foreground text-sm leading-relaxed p-2.5 rounded-lg bg-muted/30 border border-border/50 whitespace-pre-line">
                      {selectedProject.name}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      ลูกค้าผู้ว่าจ้าง
                    </span>
                    <span className="font-medium text-foreground text-sm flex items-center gap-1.5">
                      <Users className="size-3.5 text-muted-foreground" />
                      {selectedProject.customer?.name || selectedProject.customerName || "-"}
                    </span>
                    {selectedProject.customer?.customerCode && (
                      <span className="text-xs text-muted-foreground font-mono mt-0.5 block">
                        รหัสลูกค้า: {selectedProject.customer.customerCode}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      ประเภทโครงการ
                    </span>
                    <span className="text-sm text-foreground">
                      {getProjectTypeLabel(selectedProject.projectType)}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      สถานะโครงการ
                    </span>
                    <div className="pt-0.5">
                      {getStatusBadge(selectedProject.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* คอลัมน์ที่ 2: สถานที่และงบประมาณ */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2.5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    <span>สถานที่และงบประมาณ</span>
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      งบประมาณโครงการ
                    </span>
                    <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400 block">
                      {formatCurrency(selectedProject.budget)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                        วันที่เริ่มต้น
                      </span>
                      <span className="font-mono text-xs text-foreground">
                        {formatDate(selectedProject.startDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                        วันที่สิ้นสุด
                      </span>
                      <span className="font-mono text-xs text-foreground">
                        {formatDate(selectedProject.endDate)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                      สถานที่ก่อสร้าง / ทำเลที่ตั้ง
                    </span>
                    <div className="text-xs text-foreground leading-relaxed p-2.5 rounded-lg bg-muted/30 border border-border/50 whitespace-pre-line min-h-[96px]">
                      {selectedProject.location || "ไม่มีข้อมูลสถานที่ก่อสร้าง"}
                    </div>
                  </div>
                </div>
              </div>

              {/* คอลัมน์ที่ 3: ขอบเขตงานและหมายเหตุ */}
              <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 shadow-xs md:col-span-2 lg:col-span-1">
                <div className="border-b border-border/80 pb-2.5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <span>ขอบเขตงานและหมายเหตุ</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3.5 text-sm">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-1 flex items-center gap-1.5">
                      <FileText className="size-3.5 text-primary" />
                      <span>รายละเอียดขอบเขตงาน</span>
                    </span>
                    <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/60 leading-relaxed whitespace-pre-line min-h-[96px]">
                      {selectedProject.description || "ไม่มีรายละเอียดขอบเขตงาน"}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-1 flex items-center gap-1.5">
                      <MessageSquare className="size-3.5 text-primary" />
                      <span>หมายเหตุเพิ่มเติม</span>
                    </span>
                    <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/60 leading-relaxed whitespace-pre-line min-h-[96px]">
                      {selectedProject.note || "ไม่มีหมายเหตุ"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 border-t border-border pt-4 sm:justify-between">
            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
              <span>สร้างเมื่อ: {formatDate(selectedProject?.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewDialogOpen(false)}
                className="h-9 px-4"
              >
                ปิด
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!canManage}
                onClick={handleSwitchToEdit}
                className="h-9 gap-1.5 px-4"
              >
                <Edit2 className="size-3.5" />
                <span>แก้ไขข้อมูลโครงการ</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Dialog เพิ่มข้อมูลโครงการ (กว้าง 3 คอลัมน์แบบ Balanced Grid) */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border pb-3 text-left">
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <span>เพิ่มข้อมูลโครงการใหม่</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              กรอกข้อมูลโครงการก่อสร้าง ขอบเขตงาน และงบประมาณในระบบ
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreateSubmit}
            className="space-y-4 pt-2"
            noValidate
          >
            {/* โครงสร้าง 3 คอลัมน์แบบ Balanced Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* คอลัมน์ที่ 1: ข้อมูลโครงการและสัญญา */}
              <div className="space-y-3.5 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    <span>ข้อมูลโครงการและสัญญา</span>
                  </h3>
                </div>

                {/* Project Code */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="create-projectCode"
                      className="text-xs font-medium text-foreground"
                    >
                      รหัสโครงการ (Project Code)
                    </label>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4 font-normal border-primary/30 bg-primary/10 text-primary"
                    >
                      สร้างให้อัตโนมัติ
                    </Badge>
                  </div>
                  <Input
                    id="create-projectCode"
                    value="(ระบบจะสร้างรหัสให้อัตโนมัติเมื่อกดบันทึก)"
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground h-9 text-xs font-mono cursor-not-allowed border-dashed"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    รหัสจะถูกสร้างตามลำดับ เช่น PRJ-2026-0006
                  </span>
                </div>

                {/* Project Name (Textarea) */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="create-name"
                    className="text-xs font-medium text-foreground"
                  >
                    ชื่อโครงการ <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="create-name"
                    rows={3}
                    placeholder="เช่น งานก่อสร้างอาคารสำนักงานและโชว์รูม 3 ชั้น พราวด์ ทาวเวอร์"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    maxLength={200}
                    className={`w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${inputErrorClass(createErrors.name)}`}
                    aria-invalid={Boolean(createErrors.name)}
                  />
                  <ProjectFieldError
                    id="create-name-error"
                    message={createErrors.name}
                  />
                </div>

                {/* Customer Selection */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="create-customerId"
                    className="text-xs font-medium text-foreground"
                  >
                    ลูกค้าผู้ว่าจ้าง
                  </label>
                  <div className="relative">
                    <select
                      id="create-customerId"
                      value={createForm.customerId || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, customerId: e.target.value || null })
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      <option value="">-- ไม่ระบุ / โครงการภายใน --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customerCode} - {c.name}
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

                {/* Project Type */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="create-projectType"
                    className="text-xs font-medium text-foreground"
                  >
                    ประเภทโครงการ
                  </label>
                  <div className="relative">
                    <select
                      id="create-projectType"
                      value={createForm.projectType}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, projectType: e.target.value })
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      {PROJECT_TYPES.map((t) => (
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

                {/* Status */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="create-status"
                    className="text-xs font-medium text-foreground"
                  >
                    สถานะโครงการ
                  </label>
                  <div className="relative">
                    <select
                      id="create-status"
                      value={createForm.status}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, status: e.target.value })
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      {PROJECT_STATUSES.map((s) => (
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

              {/* คอลัมน์ที่ 2: สถานที่และงบประมาณ */}
              <div className="space-y-3.5 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    <span>สถานที่และงบประมาณ</span>
                  </h3>
                </div>

                {/* Budget */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="create-budget"
                    className="text-xs font-medium text-foreground"
                  >
                    งบประมาณโครงการ (บาท)
                  </label>
                  <Input
                    id="create-budget"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="เช่น 18500000"
                    value={createForm.budget}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, budget: e.target.value })
                    }
                    className={`bg-background h-9 text-xs font-mono ${inputErrorClass(createErrors.budget)}`}
                    aria-invalid={Boolean(createErrors.budget)}
                  />
                  <ProjectFieldError
                    id="create-budget-error"
                    message={createErrors.budget}
                  />
                </div>

                {/* Start & End Dates */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="create-startDate"
                      className="text-xs font-medium text-foreground"
                    >
                      วันที่เริ่มต้น
                    </label>
                    <Input
                      id="create-startDate"
                      type="date"
                      value={createForm.startDate || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, startDate: e.target.value })
                      }
                      className="bg-background h-9 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="create-endDate"
                      className="text-xs font-medium text-foreground"
                    >
                      วันที่สิ้นสุด
                    </label>
                    <Input
                      id="create-endDate"
                      type="date"
                      value={createForm.endDate || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, endDate: e.target.value })
                      }
                      className="bg-background h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Location (Textarea) */}
                <div className="flex flex-col gap-1 flex-1">
                  <label
                    htmlFor="create-location"
                    className="text-xs font-medium text-foreground"
                  >
                    สถานที่ก่อสร้าง / ทำเลที่ตั้ง
                  </label>
                  <textarea
                    id="create-location"
                    rows={6}
                    placeholder="เช่น ถนนบางนา-ตราด กม.14 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ"
                    value={createForm.location || ""}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, location: e.target.value })
                    }
                    maxLength={300}
                    className={`w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${inputErrorClass(createErrors.location)}`}
                    aria-invalid={Boolean(createErrors.location)}
                  />
                  <ProjectFieldError
                    id="create-location-error"
                    message={createErrors.location}
                  />
                </div>
              </div>

              {/* คอลัมน์ที่ 3: ขอบเขตงานและหมายเหตุ */}
              <div className="space-y-3.5 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs md:col-span-2 lg:col-span-1">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <span>ขอบเขตงานและหมายเหตุ</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3.5">
                  {/* Description (Textarea) */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="create-description"
                      className="text-xs font-medium text-foreground flex items-center gap-1.5"
                    >
                      <FileText className="size-3.5 text-primary" />
                      <span>รายละเอียดขอบเขตงาน</span>
                    </label>
                    <textarea
                      id="create-description"
                      rows={5}
                      placeholder="รายละเอียดขอบเขตงานก่อสร้าง โครงสร้าง สถาปัตย์ หรือวิศวกรรม"
                      value={createForm.description || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, description: e.target.value })
                      }
                      maxLength={1000}
                      className={`w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${inputErrorClass(createErrors.description)}`}
                      aria-invalid={Boolean(createErrors.description)}
                    />
                    <ProjectFieldError
                      id="create-description-error"
                      message={createErrors.description}
                    />
                  </div>

                  {/* Note (Textarea) */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="create-note"
                      className="text-xs font-medium text-foreground flex items-center gap-1.5"
                    >
                      <MessageSquare className="size-3.5 text-primary" />
                      <span>หมายเหตุเพิ่มเติม</span>
                    </label>
                    <textarea
                      id="create-note"
                      rows={5}
                      placeholder="หมายเหตุเพิ่มเติมสำหรับผู้เกี่ยวข้องหรือเงื่อนไขพิเศษ"
                      value={createForm.note || ""}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, note: e.target.value })
                      }
                      maxLength={1000}
                      className={`w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${inputErrorClass(createErrors.note)}`}
                      aria-invalid={Boolean(createErrors.note)}
                    />
                    <ProjectFieldError
                      id="create-note-error"
                      message={createErrors.note}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isSubmitting}
                className="h-9 px-4"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 gap-1.5 px-4"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                <span>บันทึกข้อมูลโครงการ</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Dialog แก้ไขข้อมูลโครงการ (กว้าง 3 คอลัมน์แบบ Balanced Grid) */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border pb-3 text-left">
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Edit2 className="size-5 text-primary" />
              <span>แก้ไขข้อมูลโครงการ</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ปรับปรุงข้อมูลรายละเอียดโครงการ สัญญา และขอบเขตงาน
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleEditSubmit}
            className="space-y-4 pt-2"
            noValidate
          >
            {/* โครงสร้าง 3 คอลัมน์แบบ Balanced Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* คอลัมน์ที่ 1: ข้อมูลโครงการและสัญญา */}
              <div className="space-y-3.5 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    <span>ข้อมูลโครงการและสัญญา</span>
                  </h3>
                </div>

                {/* Project Code */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="edit-projectCode"
                    className="text-xs font-medium text-foreground"
                  >
                    รหัสโครงการ (Project Code)
                  </label>
                  <Input
                    id="edit-projectCode"
                    value={editForm.projectCode || ""}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground h-9 text-xs font-mono cursor-not-allowed"
                  />
                </div>

                {/* Project Name (Textarea) */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="edit-name"
                    className="text-xs font-medium text-foreground"
                  >
                    ชื่อโครงการ <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="edit-name"
                    rows={3}
                    placeholder="เช่น งานก่อสร้างอาคารสำนักงานและโชว์รูม 3 ชั้น พราวด์ ทาวเวอร์"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    maxLength={200}
                    className={`w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${inputErrorClass(editErrors.name)}`}
                    aria-invalid={Boolean(editErrors.name)}
                  />
                  <ProjectFieldError
                    id="edit-name-error"
                    message={editErrors.name}
                  />
                </div>

                {/* Customer Selection */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="edit-customerId"
                    className="text-xs font-medium text-foreground"
                  >
                    ลูกค้าผู้ว่าจ้าง
                  </label>
                  <div className="relative">
                    <select
                      id="edit-customerId"
                      value={editForm.customerId || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, customerId: e.target.value || null })
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      <option value="">-- ไม่ระบุ / โครงการภายใน --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customerCode} - {c.name}
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

                {/* Project Type */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="edit-projectType"
                    className="text-xs font-medium text-foreground"
                  >
                    ประเภทโครงการ
                  </label>
                  <div className="relative">
                    <select
                      id="edit-projectType"
                      value={editForm.projectType}
                      onChange={(e) =>
                        setEditForm({ ...editForm, projectType: e.target.value })
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      {PROJECT_TYPES.map((t) => (
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

                {/* Status */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="edit-status"
                    className="text-xs font-medium text-foreground"
                  >
                    สถานะโครงการ
                  </label>
                  <div className="relative">
                    <select
                      id="edit-status"
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({ ...editForm, status: e.target.value })
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      {PROJECT_STATUSES.map((s) => (
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

              {/* คอลัมน์ที่ 2: สถานที่และงบประมาณ */}
              <div className="space-y-3.5 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    <span>สถานที่และงบประมาณ</span>
                  </h3>
                </div>

                {/* Budget */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="edit-budget"
                    className="text-xs font-medium text-foreground"
                  >
                    งบประมาณโครงการ (บาท)
                  </label>
                  <Input
                    id="edit-budget"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="เช่น 18500000"
                    value={editForm.budget}
                    onChange={(e) =>
                      setEditForm({ ...editForm, budget: e.target.value })
                    }
                    className={`bg-background h-9 text-xs font-mono ${inputErrorClass(editErrors.budget)}`}
                    aria-invalid={Boolean(editErrors.budget)}
                  />
                  <ProjectFieldError
                    id="edit-budget-error"
                    message={editErrors.budget}
                  />
                </div>

                {/* Start & End Dates */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="edit-startDate"
                      className="text-xs font-medium text-foreground"
                    >
                      วันที่เริ่มต้น
                    </label>
                    <Input
                      id="edit-startDate"
                      type="date"
                      value={editForm.startDate || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, startDate: e.target.value })
                      }
                      className="bg-background h-9 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="edit-endDate"
                      className="text-xs font-medium text-foreground"
                    >
                      วันที่สิ้นสุด
                    </label>
                    <Input
                      id="edit-endDate"
                      type="date"
                      value={editForm.endDate || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, endDate: e.target.value })
                      }
                      className="bg-background h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Location (Textarea) */}
                <div className="flex flex-col gap-1 flex-1">
                  <label
                    htmlFor="edit-location"
                    className="text-xs font-medium text-foreground"
                  >
                    สถานที่ก่อสร้าง / ทำเลที่ตั้ง
                  </label>
                  <textarea
                    id="edit-location"
                    rows={6}
                    placeholder="เช่น ถนนบางนา-ตราด กม.14 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ"
                    value={editForm.location || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    maxLength={300}
                    className={`w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${inputErrorClass(editErrors.location)}`}
                    aria-invalid={Boolean(editErrors.location)}
                  />
                  <ProjectFieldError
                    id="edit-location-error"
                    message={editErrors.location}
                  />
                </div>
              </div>

              {/* คอลัมน์ที่ 3: ขอบเขตงานและหมายเหตุ */}
              <div className="space-y-3.5 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs md:col-span-2 lg:col-span-1">
                <div className="border-b border-border/80 pb-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <span>ขอบเขตงานและหมายเหตุ</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3.5">
                  {/* Description (Textarea) */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="edit-description"
                      className="text-xs font-medium text-foreground flex items-center gap-1.5"
                    >
                      <FileText className="size-3.5 text-primary" />
                      <span>รายละเอียดขอบเขตงาน</span>
                    </label>
                    <textarea
                      id="edit-description"
                      rows={5}
                      placeholder="รายละเอียดขอบเขตงานก่อสร้าง โครงสร้าง สถาปัตย์ หรือวิศวกรรม"
                      value={editForm.description || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                      maxLength={1000}
                      className={`w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${inputErrorClass(editErrors.description)}`}
                      aria-invalid={Boolean(editErrors.description)}
                    />
                    <ProjectFieldError
                      id="edit-description-error"
                      message={editErrors.description}
                    />
                  </div>

                  {/* Note (Textarea) */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="edit-note"
                      className="text-xs font-medium text-foreground flex items-center gap-1.5"
                    >
                      <MessageSquare className="size-3.5 text-primary" />
                      <span>หมายเหตุเพิ่มเติม</span>
                    </label>
                    <textarea
                      id="edit-note"
                      rows={5}
                      placeholder="หมายเหตุเพิ่มเติมสำหรับผู้เกี่ยวข้องหรือเงื่อนไขพิเศษ"
                      value={editForm.note || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, note: e.target.value })
                      }
                      maxLength={1000}
                      className={`w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${inputErrorClass(editErrors.note)}`}
                      aria-invalid={Boolean(editErrors.note)}
                    />
                    <ProjectFieldError
                      id="edit-note-error"
                      message={editErrors.note}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(false)}
                disabled={isSubmitting}
                className="h-9 px-4"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 gap-1.5 px-4"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Edit2 className="size-4" />
                )}
                <span>บันทึกการแก้ไข</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Dialog ยืนยันการลบโครงการ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="gap-2 text-left">
            <div className="size-10 rounded-full bg-destructive/10 text-destructive grid place-items-center mb-1">
              <Trash2 className="size-5" />
            </div>
            <DialogTitle className="text-base font-semibold text-foreground">
              ยืนยันการลบข้อมูลโครงการ
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              คุณต้องการลบข้อมูลโครงการ{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{selectedProject?.name}&rdquo;
              </span>{" "}
              (รหัส:{" "}
              <span className="font-mono font-semibold text-primary">
                {selectedProject?.projectCode}
              </span>
              ) หรือไม่?
              <br />
              การดำเนินการนี้จะไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isSubmitting}
              className="h-9 px-4 text-xs"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="h-9 gap-1.5 px-4 text-xs"
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              <span>ยืนยันการลบ</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
