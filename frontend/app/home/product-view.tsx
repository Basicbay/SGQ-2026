"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useTable,
  tableFeatures,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Columns,
  Edit2,
  Eye,
  FileText,
  HardHat,
  ImageIcon,
  LayoutGrid,
  Loader2,
  Lock,
  Package,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Square,
  Tag,
  Trash2,
  Upload,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSnackbar } from "notistack";
import { z } from "zod";

// Category options
export const PRODUCT_CATEGORIES = [
  { value: "aluminium-profiles", label: "อลูมิเนียมเส้น", en: "Aluminium Profiles" },
  { value: "architectural-glass", label: "กระจกแปรรูป", en: "Architectural Glass" },
  { value: "hardware-accessories", label: "อุปกรณ์และอะไหล่", en: "Hardware & Accessories" },
  { value: "digital-door-locks", label: "กลอนประตูดิจิทัล", en: "Digital Door Locks" },
  { value: "custom-aluminium", label: "งานอลูมิเนียมสั่งพิเศษ", en: "Custom Aluminium" },
  { value: "additional-products", label: "สินค้าเสริม", en: "Additional Products" },
  { value: "installation-service", label: "บริการติดตั้ง", en: "Installation Service" },
] as const;

export const CATEGORY_CARDS = [
  { value: "ALL", label: "ทั้งหมด", en: "All Items", icon: LayoutGrid },
  { value: "aluminium-profiles", label: "อลูมิเนียมเส้น", en: "Aluminium", icon: Columns },
  { value: "architectural-glass", label: "กระจกแปรรูป", en: "Glass", icon: Square },
  { value: "hardware-accessories", label: "อุปกรณ์และอะไหล่", en: "Hardware", icon: Wrench },
  { value: "digital-door-locks", label: "กลอนประตูดิจิทัล", en: "Digital Locks", icon: Lock },
  { value: "custom-aluminium", label: "งานสั่งพิเศษ", en: "Custom", icon: Sparkles },
  { value: "additional-products", label: "สินค้าเสริม", en: "Accessories", icon: PackagePlus },
  { value: "installation-service", label: "บริการติดตั้ง", en: "Service", icon: HardHat },
] as const;

export const STOCK_STATUSES = [
  { value: "IN_STOCK", label: "มีสินค้าพร้อมส่ง" },
  { value: "LOW_STOCK", label: "สินค้าใกล้หมด" },
  { value: "OUT_OF_STOCK", label: "สินค้าหมด" },
  { value: "MADE_TO_ORDER", label: "สินค้าสั่งผลิต" },
] as const;

export const PRODUCT_STATUSES = [
  { value: "ACTIVE", label: "พร้อมจำหน่าย / ใช้งาน" },
  { value: "INACTIVE", label: "ไม่ใช้งาน / ระงับจำหน่าย" },
] as const;

export const COMMON_BRANDS = [
  "ORM", "Fuji Eurotech", "SMS Schimmer", "Thai Metal Aluminium",
  "CMECH", "KINLONG", "PBM", "HYDA", "CIFIAL", "ELH",
  "SGQ Glass", "Guardian", "Saint-Gobain", "AGC", "อื่นๆ (Other)",
] as const;

export const COMMON_COLORS = [
  "อลูมิเนียมธรรมชาติ", "ขาวพาวเดอร์โค้ท", "ดำพาวเดอร์โค้ท", "ดำด้าน",
  "เทาซาฮาร่า", "น้ำตาลชา", "ลายไม้", "ใส", "เขียวตัดแสง",
  "เทาตัดแสง", "ชาตัดแสง", "ฝ้า", "สแตนเลสปัดเงา", "อื่นๆ (Other)",
] as const;

export const COMMON_UNITS = ["ชิ้น", "เส้น", "ตร.ม.", "ชุด", "แผ่น", "กล่อง", "ตัว", "ม้วน", "บาน", "เมตร", "งาน", "อื่นๆ (Other)"] as const;

export type Product = {
  id: string;
  productCode: string;
  name: string;
  category: string;
  brand: string | null;
  color: string | null;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  stockStatus: string;
  status: string;
  imageUrl: string | null;
  description: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

// Zod schema for Create & Update validation
const productFormSchema = z.object({
  productCode: z
    .string()
    .max(32, "รหัสสินค้าต้องไม่เกิน 32 ตัวอักษร")
    .regex(/^[a-zA-Z0-9_.-]*$/, "รหัสสินค้าต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข และ _ . - เท่านั้น")
    .optional(),
  name: z
    .string()
    .min(1, "กรุณากรอกชื่อสินค้าหรือวัสดุ")
    .max(200, "ชื่อสินค้าต้องไม่เกิน 200 ตัวอักษร")
    .refine((val) => val.trim().length > 0, "กรุณากรอกชื่อสินค้าหรือวัสดุ"),
  category: z.string().min(1, "กรุณาเลือกหมวดหมู่สินค้า").max(50),
  brand: z.string().max(100, "ชื่อแบรนด์ต้องไม่เกิน 100 ตัวอักษร").optional(),
  color: z.string().max(50, "สีต้องไม่เกิน 50 ตัวอักษร").optional(),
  unit: z.string().min(1, "กรุณาระบุหน่วยนับ").max(32, "หน่วยนับต้องไม่เกิน 32 ตัวอักษร"),
  costPrice: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "ราคาต้นทุนต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0"),
  sellingPrice: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "ราคาขายต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0"),
  stockQuantity: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "จำนวนสต็อกต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0"),
  stockStatus: z.string().max(32),
  status: z.string().max(32),
  imageUrl: z.string().max(500, "URL รูปภาพต้องไม่เกิน 500 ตัวอักษร").optional(),
  description: z.string().max(1000, "รายละเอียดต้องไม่เกิน 1,000 ตัวอักษร").optional(),
  note: z.string().max(1000, "หมายเหตุต้องไม่เกิน 1,000 ตัวอักษร").optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

const initialFormData: ProductFormData = {
  productCode: "", name: "", category: "aluminium-profiles", brand: "", color: "", unit: "ชิ้น",
  costPrice: "0", sellingPrice: "0", stockQuantity: "0", stockStatus: "IN_STOCK", status: "ACTIVE",
  imageUrl: "", description: "", note: "",
};

function formatCurrency(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return "฿0.00";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return "0";
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
  }).format(num);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
}

function getCategoryLabel(val: string): string {
  const found = PRODUCT_CATEGORIES.find((c) => c.value === val);
  return found ? found.label : val;
}

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, Product>();

interface ProductViewProps {
  onBack: () => void;
  userRole?: string;
}

export function ProductView({ onBack, userRole }: ProductViewProps) {
  const { enqueueSnackbar } = useSnackbar();
  const canManage = userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "ESTIMATOR";

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [limit] = useState<number>(10);

  // Filter states
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<ProductFormData>(initialFormData);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<ProductFormData>(initialFormData);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      if (search.trim()) params.set("search", search.trim());
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedStockStatus !== "ALL") params.set("stockStatus", selectedStockStatus);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setProducts(json.data.items || []);
        setTotalPages(json.data.pagination?.totalPages || 1);
        setTotalCount(json.data.pagination?.total || 0);
      } else {
        enqueueSnackbar(json.error || "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดึงข้อมูลสินค้าได้", {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, selectedCategory, selectedStockStatus, selectedStatus, enqueueSnackbar]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts, refreshIndex]);

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setRefreshIndex((i) => i + 1);
  };

  // Open modals
  const handleOpenCreate = () => {
    setCreateForm(initialFormData);
    setCreateErrors({});
    setCreateDialogOpen(true);
  };

  const handleOpenView = (product: Product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      productCode: product.productCode,
      name: product.name,
      category: product.category,
      brand: product.brand || "",
      color: product.color || "",
      unit: product.unit,
      costPrice: product.costPrice ? product.costPrice.toString() : "0",
      sellingPrice: product.sellingPrice ? product.sellingPrice.toString() : "0",
      stockQuantity: product.stockQuantity ? product.stockQuantity.toString() : "0",
      stockStatus: product.stockStatus || "IN_STOCK",
      status: product.status || "ACTIVE",
      imageUrl: product.imageUrl || "",
      description: product.description || "",
      note: product.note || "",
    });
    setEditErrors({});
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  // Image Upload helper
  const handleImageUpload = async (file: File, isEdit: boolean) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar("ขนาดไฟล์ต้องไม่เกิน 5MB", { variant: "error" });
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success && data.data?.url) {
        if (isEdit) {
          setEditForm((prev) => ({ ...prev, imageUrl: data.data.url }));
        } else {
          setCreateForm((prev) => ({ ...prev, imageUrl: data.data.url }));
        }
        enqueueSnackbar("อัปโหลดรูปภาพสำเร็จ", { variant: "success" });
      } else {
        enqueueSnackbar(data?.error || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ", { variant: "error" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Create Product
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = productFormSchema.safeParse(createForm);
    if (!result.success) {
      const formatted: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") formatted[field] = issue.message;
      }
      setCreateErrors(formatted);
      return;
    }
    setCreateErrors({});
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        name: result.data.name.trim(),
        category: result.data.category.trim(),
        brand: result.data.brand?.trim() || null,
        color: result.data.color?.trim() || null,
        unit: result.data.unit.trim(),
        costPrice: result.data.costPrice ? Number(result.data.costPrice) : 0,
        sellingPrice: result.data.sellingPrice ? Number(result.data.sellingPrice) : 0,
        stockQuantity: result.data.stockQuantity ? Number(result.data.stockQuantity) : 0,
        stockStatus: result.data.stockStatus,
        status: result.data.status,
        imageUrl: result.data.imageUrl?.trim() || null,
        description: result.data.description?.trim() || null,
        note: result.data.note?.trim() || null,
      };

      if (result.data.productCode?.trim()) {
        payload.productCode = result.data.productCode.trim();
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "ไม่สามารถสร้างข้อมูลสินค้าและวัสดุได้");
      }

      enqueueSnackbar("เพิ่มข้อมูลสินค้าและวัสดุเรียบร้อยแล้ว", { variant: "success" });
      setCreateDialogOpen(false);
      setRefreshIndex((i) => i + 1);
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างสินค้า",
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Product
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const result = productFormSchema.safeParse(editForm);
    if (!result.success) {
      const formatted: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") formatted[field] = issue.message;
      }
      setEditErrors(formatted);
      return;
    }
    setEditErrors({});
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        name: result.data.name.trim(),
        category: result.data.category.trim(),
        brand: result.data.brand?.trim() || null,
        color: result.data.color?.trim() || null,
        unit: result.data.unit.trim(),
        costPrice: result.data.costPrice ? Number(result.data.costPrice) : 0,
        sellingPrice: result.data.sellingPrice ? Number(result.data.sellingPrice) : 0,
        stockQuantity: result.data.stockQuantity ? Number(result.data.stockQuantity) : 0,
        stockStatus: result.data.stockStatus,
        status: result.data.status,
        imageUrl: result.data.imageUrl?.trim() || null,
        description: result.data.description?.trim() || null,
        note: result.data.note?.trim() || null,
      };

      if (result.data.productCode?.trim()) {
        payload.productCode = result.data.productCode.trim();
      }

      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "ไม่สามารถแก้ไขข้อมูลสินค้าได้");
      }

      enqueueSnackbar("แก้ไขข้อมูลสินค้าและวัสดุเรียบร้อยแล้ว", { variant: "success" });
      setEditDialogOpen(false);
      setRefreshIndex((i) => i + 1);
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการแก้ไขสินค้า",
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Product
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "ไม่สามารถลบข้อมูลสินค้าได้");
      }

      enqueueSnackbar("ลบข้อมูลสินค้าและวัสดุเรียบร้อยแล้ว", { variant: "success" });
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      setRefreshIndex((i) => i + 1);
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบข้อมูลสินค้า",
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stock status badge helper
  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case "IN_STOCK":
        return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 font-medium text-xs whitespace-nowrap"><CheckCircle2 className="size-3" />มีสินค้า</Badge>;
      case "LOW_STOCK":
        return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 font-medium text-xs whitespace-nowrap"><Clock3 className="size-3" />ใกล้หมด</Badge>;
      case "OUT_OF_STOCK":
        return <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive gap-1 font-medium text-xs whitespace-nowrap"><XCircle className="size-3" />สินค้าหมด</Badge>;
      case "MADE_TO_ORDER":
        return <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 gap-1 font-medium text-xs whitespace-nowrap"><Boxes className="size-3" />สั่งผลิต</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getProductStatusBadge = (status: string) => status === "ACTIVE" ? (
    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-xs whitespace-nowrap">พร้อมจำหน่าย</Badge>
  ) : (
    <Badge variant="outline" className="border-border bg-muted/60 text-muted-foreground font-medium text-xs whitespace-nowrap">ไม่ใช้งาน</Badge>
  );

  // TanStack table columns
  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("productCode", {
          header: "รหัสสินค้า",
          cell: (info) => (
            <button
              type="button"
              onClick={() => handleOpenView(info.row.original)}
              className="font-mono text-xs sm:text-sm font-medium text-primary hover:underline cursor-pointer text-left whitespace-nowrap"
              title="คลิกเพื่อดูรายละเอียดสินค้า"
            >
              {info.getValue()}
            </button>
          ),
        }),
        helper.accessor("name", {
          header: "รายการสินค้า",
          cell: (info) => {
            const product = info.row.original;
            return (
              <div className="flex items-start gap-3 min-w-[200px] max-w-[360px]">
                {/* Thumbnail Image */}
                <div className="size-11 rounded-lg border border-border/70 bg-muted/40 shrink-0 overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Package className="size-5 text-muted-foreground/60" />
                  )}
                </div>
                {/* Product Name & Specs */}
                <div className="flex flex-col gap-1 min-w-[180px] max-w-[320px] flex-1">
                  <button
                    type="button"
                    onClick={() => handleOpenView(product)}
                    className="font-medium text-sm text-foreground hover:text-primary transition-colors text-left break-words whitespace-normal leading-snug cursor-pointer line-clamp-2"
                    title={product.name}
                  >
                    {product.name}
                  </button>
                </div>
              </div>
            );
          },
        }),
        helper.accessor("category", {
          header: "หมวดหมู่ / แบรนด์",
          cell: (info) => {
            const product = info.row.original;
            return (
              <div className="flex flex-col gap-1 min-w-[140px]">
                <Badge
                  variant="outline"
                  className="w-fit text-xs font-normal border-border/80 text-muted-foreground"
                >
                  {getCategoryLabel(product.category)}
                </Badge>
                {product.brand && (
                  <div className="flex items-center gap-1 text-xs text-foreground font-medium">
                    <Tag className="size-3 text-muted-foreground/70" />
                    <span>{product.brand}</span>
                  </div>
                )}
              </div>
            );
          },
        }),
        helper.accessor("color", {
          header: "สี / หน่วยนับ",
          cell: (info) => {
            const product = info.row.original;
            return (
              <div className="flex flex-col gap-0.5 text-xs">
                <span className="text-foreground font-medium">
                  {product.color || "-"}
                </span>
                <span className="text-muted-foreground font-normal">
                  หน่วย: {product.unit}
                </span>
              </div>
            );
          },
        }),
        helper.accessor("sellingPrice", {
          header: "ราคาขาย (บาท)",
          cell: (info) => {
            const product = info.row.original;
            return (
              <div className="flex flex-col text-right font-mono whitespace-nowrap pr-2">
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(info.getValue())}
                </span>
                {canManage && product.costPrice > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ทุน {formatCurrency(product.costPrice)}
                  </span>
                )}
              </div>
            );
          },
        }),
        helper.accessor("stockQuantity", {
          header: "คงเหลือ / สต็อก",
          cell: (info) => {
            const product = info.row.original;
            return (
              <div className="flex flex-col gap-1 min-w-[110px]">
                <div className="flex items-baseline gap-1 text-xs">
                  <span className="font-mono font-semibold text-foreground">
                    {formatNumber(info.getValue())}
                  </span>
                  <span className="text-muted-foreground">{product.unit}</span>
                </div>
                <div>{getStockStatusBadge(product.stockStatus)}</div>
              </div>
            );
          },
        }),
        helper.accessor("status", {
          header: "สถานะ",
          cell: (info) => getProductStatusBadge(info.getValue()),
        }),
        helper.display({
          id: "actions",
          header: () => <div className="text-right pr-2">การจัดการ</div>,
          cell: (info) => {
            const product = info.row.original;
            return (
              <div className="flex items-center justify-end gap-1.5">
                {/* ดูข้อมูลสินค้า */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleOpenView(product)}
                  className="size-7 rounded-md border border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border transition-colors"
                  title="ดูรายละเอียดสินค้า"
                  aria-label={`ดูรายละเอียด ${product.name}`}
                >
                  <Eye className="size-3.5" />
                </Button>
                {/* แก้ไขข้อมูลสินค้า */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleOpenEdit(product)}
                  disabled={!canManage}
                  className="size-7 rounded-md border border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="แก้ไขข้อมูลสินค้า"
                  aria-label={`แก้ไข ${product.name}`}
                >
                  <Edit2 className="size-3.5" />
                </Button>
                {/* ลบข้อมูลสินค้า */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleOpenDelete(product)}
                  disabled={!canManage}
                  className="size-7 rounded-md border border-border/70 bg-muted/50 text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive dark:hover:border-destructive/40 dark:hover:bg-destructive/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="ลบข้อมูลสินค้า"
                  aria-label={`ลบ ${product.name}`}
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
    data: products,
  });

  const inputErrorClass = (err?: string) =>
    err ? "border-destructive focus-visible:ring-destructive/30" : "";

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="size-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            aria-label="กลับหน้าภาพรวม"
            title="กลับหน้าภาพรวม"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="w-px self-stretch bg-border" aria-hidden="true" />

          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl leading-tight">
              ข้อมูลสินค้าและวัสดุ
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              จัดการรายการสินค้า วัสดุ และอุปกรณ์ แสดงรหัสสินค้า หมวดหมู่ แบรนด์ สี หน่วยนับ ราคา และสถานะสต็อก
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProducts()}
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
            <Button
              onClick={handleOpenCreate}
              className="h-9 gap-1.5 shadow-xs"
            >
              <Plus className="size-4" />
              <span>เพิ่มสินค้าและวัสดุ</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Main Card: Table & Filter Controls */}
      <Card className="border border-border shadow-xs overflow-hidden">
        {/* Card Header & Filter/Search Toolbar */}
        <div className="border-b border-border p-4 sm:p-5 bg-card space-y-4">
          <div className="flex items-center gap-2.5 w-full justify-between">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              รายการสินค้าและวัสดุ
            </h2>
            <div className="text-xs text-muted-foreground">
              ทั้งหมด {new Intl.NumberFormat("th-TH").format(totalCount)} รายการ
            </div>
          </div>

          {/* หมวดหมู่สินค้า: การ์ดเลือกหมวดหมู่รูปแบบ Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5 pt-1">
            {CATEGORY_CARDS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedCategory === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(
                      isSelected && item.value !== "ALL" ? "ALL" : item.value,
                    );
                    setPage(1);
                  }}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all duration-150 cursor-pointer select-none",
                    isSelected
                      ? "border-foreground/40 bg-muted/80 text-foreground shadow-xs ring-1 ring-foreground/15"
                      : "border-border/60 bg-muted/25 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
                  )}
                  title={`หมวดหมู่: ${item.label}`}
                >
                  <div
                    className={cn(
                      "size-8 sm:size-9 rounded-lg flex items-center justify-center mb-1.5 transition-colors",
                      isSelected
                        ? "bg-foreground/10 text-foreground"
                        : "bg-muted/70 text-muted-foreground/80 group-hover:bg-muted group-hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 sm:size-4.5 shrink-0" />
                  </div>
                  <span className="text-xs font-medium leading-tight truncate w-full text-foreground">
                    {item.label}
                  </span>
                  <span className="text-xs text-muted-foreground/70 leading-tight truncate w-full hidden sm:block">
                    {item.en}
                  </span>
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="ค้นหารหัส, ชื่อสินค้า, แบรนด์, สี..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  maxLength={100}
                  className="pl-9 pr-8 h-9 text-sm bg-background"
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

              {/* Category Filter */}
              <div className="relative w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  aria-label="กรองหมวดหมู่สินค้า"
                >
                  <option value="ALL">ทุกหมวดหมู่สินค้า</option>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="size-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>

              {/* Stock Status Filter */}
              <div className="relative w-44">
                <select
                  value={selectedStockStatus}
                  onChange={(e) => {
                    setSelectedStockStatus(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  aria-label="กรองสถานะสต็อก"
                >
                  <option value="ALL">ทุกสถานะสต็อก</option>
                  {STOCK_STATUSES.map((s) => (
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

              {/* Status Filter */}
              <div className="relative w-40">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  aria-label="กรองสถานะการใช้งาน"
                >
                  <option value="ALL">ทุกสถานะการใช้งาน</option>
                  {PRODUCT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label.split(" / ")[0]}
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
                  setSelectedCategory("ALL");
                  setSelectedStockStatus("ALL");
                  setSelectedStatus("ALL");
                  setPage(1);
                  setRefreshIndex((i) => i + 1);
                }}
                className="h-9 gap-1.5 px-3 text-xs"
                title="ล้างตัวกรอง"
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
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent border-b border-border bg-muted/40"
                  >
                    {headerGroup.headers.map((header, index) => (
                      <TableHead
                        key={header.id}
                        className={`text-xs font-semibold text-muted-foreground py-3 ${
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
                      className="h-44 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-6 animate-spin text-primary" />
                        <span className="text-xs">กำลังโหลดข้อมูลสินค้าและวัสดุ...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-44 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="size-8 text-muted-foreground/50" />
                        <span className="text-sm font-medium text-foreground">
                          ไม่พบข้อมูลสินค้าและวัสดุ
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ลองเปลี่ยนคำค้นหา หรือกดล้างตัวกรองเพื่อดูสินค้าทั้งหมด
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-muted/30 border-b border-border/80 transition-colors"
                    >
                      {row.getAllCells().map((cell, index) => (
                        <TableCell
                          key={cell.id}
                          className={`py-3 ${index === 0 ? "pl-5" : ""} ${
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

          {/* Pagination Footer */}
          <div className="border-t border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              แสดง{" "}
              <span className="font-semibold text-foreground">
                {products.length > 0 ? (page - 1) * limit + 1 : 0}
              </span>{" "}
              ถึง{" "}
              <span className="font-semibold text-foreground">
                {Math.min(page * limit, totalCount)}
              </span>{" "}
              จากทั้งหมด{" "}
              <span className="font-semibold text-foreground">
                {new Intl.NumberFormat("th-TH").format(totalCount)}
              </span>{" "}
              รายการ
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 gap-1 px-2.5 text-xs"
              >
                <ChevronLeft className="size-3.5" />
                <span>ก่อนหน้า</span>
              </Button>
              <span className="font-medium text-foreground px-2">
                หน้า {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 gap-1 px-2.5 text-xs"
              >
                <span>ถัดไป</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Create Product Modal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              เพิ่มสินค้าและวัสดุใหม่
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Code (Auto) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="create-productCode" className="text-xs font-medium text-foreground">
                    รหัสสินค้า (Product Code)
                  </label>
                  <span className="text-xs text-muted-foreground">
                    (ระบบกำหนดอัตโนมัติ)
                  </span>
                </div>
                <Input
                  id="create-productCode"
                  value="(ระบบสร้างให้อัตโนมัติ เช่น PRD-2026-XXXX)"
                  readOnly
                  disabled
                  className="bg-muted/50 text-muted-foreground h-9 text-xs font-mono cursor-not-allowed border-dashed"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-category" className="text-xs font-medium text-foreground">
                  หมวดหมู่สินค้า <span className="text-destructive">*</span>
                </label>
                <select
                  id="create-category"
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label} ({c.en})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="create-name" className="text-xs font-medium text-foreground">
                ชื่อสินค้า / วัสดุ <span className="text-destructive">*</span>
              </label>
              <Input
                id="create-name"
                placeholder="เช่น อลูมิเนียมกล่อง 2x1 นิ้ว หนา 1.2 มม. ชุบอโนไดซ์"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                maxLength={200}
                className={`bg-background h-9 text-xs ${inputErrorClass(createErrors.name)}`}
              />
              {createErrors.name && (
                <p className="text-xs text-destructive">{createErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Brand Select */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-brand" className="text-xs font-medium text-foreground">
                  แบรนด์ / ยี่ห้อ
                </label>
                <select
                  id="create-brand"
                  value={createForm.brand || ""}
                  onChange={(e) => setCreateForm({ ...createForm, brand: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="">-- เลือกแบรนด์ / ยี่ห้อ --</option>
                  {createForm.brand && !COMMON_BRANDS.includes(createForm.brand as any) && (
                    <option value={createForm.brand}>{createForm.brand}</option>
                  )}
                  {COMMON_BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Color Select */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-color" className="text-xs font-medium text-foreground">
                  สี / พื้นผิว
                </label>
                <select
                  id="create-color"
                  value={createForm.color || ""}
                  onChange={(e) => setCreateForm({ ...createForm, color: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="">-- เลือกสี / พื้นผิว --</option>
                  {createForm.color && !COMMON_COLORS.includes(createForm.color as any) && (
                    <option value={createForm.color}>{createForm.color}</option>
                  )}
                  {COMMON_COLORS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Unit Select */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-unit" className="text-xs font-medium text-foreground">
                  หน่วยนับ <span className="text-destructive">*</span>
                </label>
                <select
                  id="create-unit"
                  value={createForm.unit}
                  onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                  className={cn(
                    "h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                    inputErrorClass(createErrors.unit),
                  )}
                >
                  {createForm.unit && !COMMON_UNITS.includes(createForm.unit as any) && (
                    <option value={createForm.unit}>{createForm.unit}</option>
                  )}
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                {createErrors.unit && (
                  <p className="text-xs text-destructive">{createErrors.unit}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Cost Price */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-costPrice" className="text-xs font-medium text-foreground">
                  ราคาต้นทุน (บาท)
                </label>
                <Input
                  id="create-costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={createForm.costPrice}
                  onChange={(e) => setCreateForm({ ...createForm, costPrice: e.target.value })}
                  className={`bg-background h-9 text-xs font-mono ${inputErrorClass(createErrors.costPrice)}`}
                />
                {createErrors.costPrice && (
                  <p className="text-xs text-destructive">{createErrors.costPrice}</p>
                )}
              </div>

              {/* Selling Price */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-sellingPrice" className="text-xs font-medium text-foreground">
                  ราคาขาย (บาท) <span className="text-destructive">*</span>
                </label>
                <Input
                  id="create-sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={createForm.sellingPrice}
                  onChange={(e) => setCreateForm({ ...createForm, sellingPrice: e.target.value })}
                  className={`bg-background h-9 text-xs font-mono font-semibold ${inputErrorClass(createErrors.sellingPrice)}`}
                />
                {createErrors.sellingPrice && (
                  <p className="text-xs text-destructive">{createErrors.sellingPrice}</p>
                )}
              </div>

              {/* Stock Quantity */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-stockQuantity" className="text-xs font-medium text-foreground">
                  จำนวนคงเหลือ
                </label>
                <Input
                  id="create-stockQuantity"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={createForm.stockQuantity}
                  onChange={(e) => setCreateForm({ ...createForm, stockQuantity: e.target.value })}
                  className={`bg-background h-9 text-xs font-mono ${inputErrorClass(createErrors.stockQuantity)}`}
                />
                {createErrors.stockQuantity && (
                  <p className="text-xs text-destructive">{createErrors.stockQuantity}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stock Status */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-stockStatus" className="text-xs font-medium text-foreground">
                  สถานะสต็อก
                </label>
                <select
                  id="create-stockStatus"
                  value={createForm.stockStatus}
                  onChange={(e) => setCreateForm({ ...createForm, stockStatus: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  {STOCK_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Status */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-status" className="text-xs font-medium text-foreground">
                  สถานะการจำหน่าย
                </label>
                <select
                  id="create-status"
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  {PRODUCT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image upload section */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                รูปภาพสินค้า
              </label>
              <div className="flex items-center gap-3">
                <div className="size-16 rounded-lg border border-dashed border-border bg-muted/30 shrink-0 overflow-hidden flex items-center justify-center relative">
                  {createForm.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={createForm.imageUrl}
                      alt="Product preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="size-6 text-muted-foreground/60" />
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <Loader2 className="size-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium hover:bg-muted transition-colors">
                      <Upload className="size-3.5" />
                      <span>อัปโหลดรูปภาพ</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleImageUpload(file, false);
                        }}
                      />
                    </label>
                    {createForm.imageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCreateForm({ ...createForm, imageUrl: "" })}
                        className="h-8 text-xs text-destructive hover:text-destructive"
                      >
                        ลบรูปภาพ
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="หรือวาง URL รูปภาพโดยตรง (https://...)"
                    value={createForm.imageUrl || ""}
                    onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })}
                    maxLength={500}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="create-description" className="text-xs font-medium text-foreground">
                รายละเอียดสินค้า / คุณสมบัติ
              </label>
              <textarea
                id="create-description"
                rows={2}
                placeholder="ระบุสเปก มาตรฐาน มอก. หรือคุณสมบัติทางเทคนิค..."
                value={createForm.description || ""}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                maxLength={1000}
                className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="create-note" className="text-xs font-medium text-foreground">
                หมายเหตุเพิ่มเติม
              </label>
              <textarea
                id="create-note"
                rows={2}
                placeholder="บันทึกหมายเหตุภายใน เช่น ระยะเวลาสั่งผลิต เงื่อนไขขนส่ง..."
                value={createForm.note || ""}
                onChange={(e) => setCreateForm({ ...createForm, note: e.target.value })}
                maxLength={1000}
                className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <DialogFooter className="gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting} className="text-xs gap-1.5">
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                <span>บันทึกข้อมูลสินค้า</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Edit Product Modal */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              แก้ไขข้อมูลสินค้าและวัสดุ
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Code (Auto/Disabled) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="edit-productCode" className="text-xs font-medium text-foreground">
                    รหัสสินค้า (Product Code)
                  </label>
                  <span className="text-xs text-muted-foreground">
                    (ระบบกำหนดอัตโนมัติ)
                  </span>
                </div>
                <Input
                  id="edit-productCode"
                  value={editForm.productCode || ""}
                  readOnly
                  disabled
                  className="bg-muted/50 text-muted-foreground h-9 text-xs font-mono cursor-not-allowed"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-category" className="text-xs font-medium text-foreground">
                  หมวดหมู่สินค้า <span className="text-destructive">*</span>
                </label>
                <select
                  id="edit-category"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label} ({c.en})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-name" className="text-xs font-medium text-foreground">
                ชื่อสินค้า / วัสดุ <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                maxLength={200}
                className={`bg-background h-9 text-xs ${inputErrorClass(editErrors.name)}`}
              />
              {editErrors.name && (
                <p className="text-xs text-destructive">{editErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Brand Select */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-brand" className="text-xs font-medium text-foreground">
                  แบรนด์ / ยี่ห้อ
                </label>
                <select
                  id="edit-brand"
                  value={editForm.brand || ""}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="">-- เลือกแบรนด์ / ยี่ห้อ --</option>
                  {editForm.brand && !COMMON_BRANDS.includes(editForm.brand as any) && (
                    <option value={editForm.brand}>{editForm.brand}</option>
                  )}
                  {COMMON_BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Color Select */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-color" className="text-xs font-medium text-foreground">
                  สี / พื้นผิว
                </label>
                <select
                  id="edit-color"
                  value={editForm.color || ""}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="">-- เลือกสี / พื้นผิว --</option>
                  {editForm.color && !COMMON_COLORS.includes(editForm.color as any) && (
                    <option value={editForm.color}>{editForm.color}</option>
                  )}
                  {COMMON_COLORS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Unit Select */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-unit" className="text-xs font-medium text-foreground">
                  หน่วยนับ <span className="text-destructive">*</span>
                </label>
                <select
                  id="edit-unit"
                  value={editForm.unit}
                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                  className={cn(
                    "h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                    inputErrorClass(editErrors.unit),
                  )}
                >
                  {editForm.unit && !COMMON_UNITS.includes(editForm.unit as any) && (
                    <option value={editForm.unit}>{editForm.unit}</option>
                  )}
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                {editErrors.unit && (
                  <p className="text-xs text-destructive">{editErrors.unit}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Cost Price */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-costPrice" className="text-xs font-medium text-foreground">
                  ราคาต้นทุน (บาท)
                </label>
                <Input
                  id="edit-costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.costPrice}
                  onChange={(e) => setEditForm({ ...editForm, costPrice: e.target.value })}
                  className={`bg-background h-9 text-xs font-mono ${inputErrorClass(editErrors.costPrice)}`}
                />
                {editErrors.costPrice && (
                  <p className="text-xs text-destructive">{editErrors.costPrice}</p>
                )}
              </div>

              {/* Selling Price */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-sellingPrice" className="text-xs font-medium text-foreground">
                  ราคาขาย (บาท) <span className="text-destructive">*</span>
                </label>
                <Input
                  id="edit-sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.sellingPrice}
                  onChange={(e) => setEditForm({ ...editForm, sellingPrice: e.target.value })}
                  className={`bg-background h-9 text-xs font-mono font-semibold ${inputErrorClass(editErrors.sellingPrice)}`}
                />
                {editErrors.sellingPrice && (
                  <p className="text-xs text-destructive">{editErrors.sellingPrice}</p>
                )}
              </div>

              {/* Stock Quantity */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-stockQuantity" className="text-xs font-medium text-foreground">
                  จำนวนคงเหลือ
                </label>
                <Input
                  id="edit-stockQuantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.stockQuantity}
                  onChange={(e) => setEditForm({ ...editForm, stockQuantity: e.target.value })}
                  className={`bg-background h-9 text-xs font-mono ${inputErrorClass(editErrors.stockQuantity)}`}
                />
                {editErrors.stockQuantity && (
                  <p className="text-xs text-destructive">{editErrors.stockQuantity}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stock Status */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-stockStatus" className="text-xs font-medium text-foreground">
                  สถานะสต็อก
                </label>
                <select
                  id="edit-stockStatus"
                  value={editForm.stockStatus}
                  onChange={(e) => setEditForm({ ...editForm, stockStatus: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  {STOCK_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Status */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-status" className="text-xs font-medium text-foreground">
                  สถานะการจำหน่าย
                </label>
                <select
                  id="edit-status"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  {PRODUCT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image upload section */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                รูปภาพสินค้า
              </label>
              <div className="flex items-center gap-3">
                <div className="size-16 rounded-lg border border-dashed border-border bg-muted/30 shrink-0 overflow-hidden flex items-center justify-center relative">
                  {editForm.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={editForm.imageUrl}
                      alt="Product preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="size-6 text-muted-foreground/60" />
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <Loader2 className="size-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium hover:bg-muted transition-colors">
                      <Upload className="size-3.5" />
                      <span>เปลี่ยนรูปภาพ</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleImageUpload(file, true);
                        }}
                      />
                    </label>
                    {editForm.imageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditForm({ ...editForm, imageUrl: "" })}
                        className="h-8 text-xs text-destructive hover:text-destructive"
                      >
                        ลบรูปภาพ
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="หรือวาง URL รูปภาพโดยตรง (https://...)"
                    value={editForm.imageUrl || ""}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    maxLength={500}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-description" className="text-xs font-medium text-foreground">
                รายละเอียดสินค้า / คุณสมบัติ
              </label>
              <textarea
                id="edit-description"
                rows={2}
                value={editForm.description || ""}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                maxLength={1000}
                className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-note" className="text-xs font-medium text-foreground">
                หมายเหตุเพิ่มเติม
              </label>
              <textarea
                id="edit-note"
                rows={2}
                value={editForm.note || ""}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                maxLength={1000}
                className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <DialogFooter className="gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting} className="text-xs gap-1.5">
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                <span>บันทึกการแก้ไข</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. View Product Details Modal */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs font-semibold text-primary px-2 py-0.5 border-primary/30 bg-primary/10">
                {selectedProduct?.productCode}
              </Badge>
              {selectedProduct && getProductStatusBadge(selectedProduct.status)}
            </div>
            <DialogTitle className="text-lg font-bold pt-1 break-words">
              {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Image & Key Info */}
              <div className="flex flex-col sm:flex-row gap-4 items-start bg-muted/30 p-3.5 rounded-xl border border-border/70">
                <div className="size-24 rounded-lg border border-border bg-background shrink-0 overflow-hidden flex items-center justify-center">
                  {selectedProduct.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Package className="size-10 text-muted-foreground/50" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
                  <div>
                    <span className="text-muted-foreground">หมวดหมู่:</span>
                    <p className="font-medium text-foreground">
                      {getCategoryLabel(selectedProduct.category)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">แบรนด์:</span>
                    <p className="font-medium text-foreground">
                      {selectedProduct.brand || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">สี / ผิว:</span>
                    <p className="font-medium text-foreground">
                      {selectedProduct.color || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">หน่วยนับ:</span>
                    <p className="font-medium text-foreground">
                      {selectedProduct.unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price & Stock Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-card p-3 rounded-lg border border-border">
                  <span className="text-muted-foreground">ราคาขาย:</span>
                  <p className="text-base font-bold text-foreground font-mono mt-0.5">
                    {formatCurrency(selectedProduct.sellingPrice)}
                  </p>
                </div>
                <div className="bg-card p-3 rounded-lg border border-border">
                  <span className="text-muted-foreground">ราคาต้นทุน:</span>
                  <p className="text-base font-bold text-foreground font-mono mt-0.5">
                    {canManage ? formatCurrency(selectedProduct.costPrice) : "—"}
                  </p>
                </div>
                <div className="bg-card p-3 rounded-lg border border-border col-span-2 sm:col-span-1">
                  <span className="text-muted-foreground">สต็อกคงเหลือ:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-bold text-foreground font-mono">
                      {formatNumber(selectedProduct.stockQuantity)} {selectedProduct.unit}
                    </span>
                  </div>
                  <div className="mt-1">
                    {getStockStatusBadge(selectedProduct.stockStatus)}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div className="space-y-1">
                  <span className="font-medium text-foreground">รายละเอียดสินค้า / สเปก:</span>
                  <p className="p-3 bg-muted/30 rounded-lg border border-border/60 leading-relaxed whitespace-pre-line text-muted-foreground">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* Note */}
              {selectedProduct.note && (
                <div className="space-y-1">
                  <span className="font-medium text-foreground">หมายเหตุ:</span>
                  <p className="p-3 bg-muted/30 rounded-lg border border-border/60 leading-relaxed whitespace-pre-line text-muted-foreground">
                    {selectedProduct.note}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="flex items-center justify-between text-muted-foreground pt-2 border-t border-border">
                <span>สร้างเมื่อ: {formatDate(selectedProduct.createdAt)}</span>
                <span>อัปเดตล่าสุด: {formatDate(selectedProduct.updatedAt)}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
              className="text-xs"
            >
              ปิด
            </Button>
            {canManage && selectedProduct && (
              <Button
                type="button"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenEdit(selectedProduct);
                }}
                className="text-xs gap-1.5"
              >
                <Edit2 className="size-3.5" />
                <span>แก้ไขข้อมูล</span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <Trash2 className="size-5" />
              <span>ยืนยันการลบข้อมูลสินค้า</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2 text-xs text-muted-foreground">
            <p>
              คุณต้องการลบข้อมูลสินค้า{" "}
              <strong className="text-foreground">{selectedProduct?.name}</strong>{" "}
              (รหัส: <span className="font-mono text-foreground font-semibold">{selectedProduct?.productCode}</span>) หรือไม่?
            </p>
            <p className="text-destructive/90">
              การดำเนินการนี้ไม่สามารถยกเลิกได้ และอาจมีผลต่อใบเสนอราคาที่มีการอ้างอิงสินค้ารายการนี้
            </p>
          </div>

          <DialogFooter className="gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setDeleteDialogOpen(false)}
              className="text-xs"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting}
              onClick={handleDeleteConfirm}
              className="text-xs gap-1.5"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              <span>ยืนยันการลบ</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
