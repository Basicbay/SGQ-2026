/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { UserRoleBadge } from "@/components/user-role-badge";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MoreHorizontal,
  PanelLeft,
  PanelLeftClose,
  Pencil,
  Plus,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { UserSettingsView } from "./user-settings-view";
import { CustomerView } from "./customer-view";
import { ProjectView } from "./project-view";
import { ProductView } from "./product-view";
import { QuotationView } from "./quotation-view";
import { OverviewView } from "./overview-view";
import { ThemeToggle } from "@/components/theme-toggle";
import { NeonStorageWidget } from "@/components/neon-storage-widget";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSnackbar } from "notistack";
import {
  systemSettingsSchema,
  type SystemSettingsData,
} from "@/lib/settings-types";
import { useTopLoader } from "nextjs-toploader";

function updateBrowserMetadata(settings: SystemSettingsData) {
  if (typeof document === "undefined") return;

  // 1. Update Title
  const title = settings.siteName
    ? `${settings.siteName} | ${settings.siteDescription || "Site Name"}`
    : "Site Name";
  document.title = title;

  // 2. Update Favicon
  if (settings.iconUrl) {
    let link = document.querySelector(
      "link[rel*='icon']",
    ) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = settings.iconUrl;
  }
}

let transitionTimer: ReturnType<typeof setTimeout> | null = null;

type SettingsTextField = Exclude<
  keyof SystemSettingsData,
  "iconUrl" | "updatedAt"
>;

function SettingsFieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  ) : null;
}

export function DashboardContent({
  initialSettings,
  initialUser,
}: {
  initialSettings: SystemSettingsData;
  initialUser: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
}) {
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const rawView = searchParams.get("view");
  const getInitialView = (): "overview" | "settings" | "user-settings" | "customers" | "projects" | "products" | "quotes" => {
    if (rawView === "settings") return "settings";
    if (rawView === "user-settings") return "user-settings";
    if (rawView === "customers") return "customers";
    if (rawView === "projects") return "projects";
    if (rawView === "products") return "products";
    if (rawView === "quotes") return "quotes";
    return "overview";
  };
  const [activeView, setActiveView] = useState<
    "overview" | "settings" | "user-settings" | "customers" | "projects" | "products" | "quotes"
  >(getInitialView);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notice, setNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [settingsErrors, setSettingsErrors] = useState<
    Partial<Record<SettingsTextField, string>>
  >({});

  // Confirmed settings from DB (sidebar, header, metadata)
  const [savedSettings, setSavedSettings] =
    useState<SystemSettingsData>(initialSettings);
  // Form draft settings (being edited in settings view)
  const [formSettings, setFormSettings] =
    useState<SystemSettingsData>(initialSettings);
  // Selected file waiting to be uploaded ONLY when saving
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  // Local preview URL for selected file (no API call sent before saving)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [currentUser] = useState<{
    id?: string | null;
    name?: string | null;
    email?: string | null;
  } | null>(initialUser);
  const { data: session } = useSession();
  const displayName = session?.user?.fullName || "ผู้ใช้งาน";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loader = useTopLoader();

  const handleSignOut = () => {
    loader.start();
    signOut({ redirectTo: "/login" });
  };

  useEffect(() => {
    updateBrowserMetadata(savedSettings);
  }, [savedSettings]);

  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const v = sp.get("view");
      const target =
        v === "settings"
          ? "settings"
          : v === "user-settings"
            ? "user-settings"
            : v === "customers"
              ? "customers"
              : v === "projects"
                ? "projects"
                : v === "products"
                  ? "products"
                  : v === "quotes"
                    ? "quotes"
                    : "overview";
      setIsEditingSettings(false);
      setSettingsErrors({});
      setActiveView(target);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (transitionTimer) {
        clearTimeout(transitionTimer);
      }
    };
  }, []);

  const handleViewChange = (
    view: "overview" | "settings" | "user-settings" | "customers" | "projects" | "products" | "quotes",
  ) => {
    setSidebarOpen(false);
    if (view === activeView) return;

    if (transitionTimer) {
      clearTimeout(transitionTimer);
    }

    loader.start();
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setPendingImageFile(null);
    setIsEditingSettings(false);
    setSettingsErrors({});

    const targetUrl =
      view === "settings"
        ? "/home?view=settings"
        : view === "user-settings"
          ? "/home?view=user-settings"
          : view === "customers"
            ? "/home?view=customers"
            : view === "projects"
              ? "/home?view=projects"
              : view === "products"
                ? "/home?view=products"
                : "/home";

    transitionTimer = setTimeout(() => {
      if (view === "settings") {
        setFormSettings(savedSettings);
      }
      setActiveView(view);
      window.history.replaceState(null, "", targetUrl);
      loader.done();
    }, 200);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
      "image/webp",
      "image/x-icon",
    ];
    if (!validMimes.includes(file.type)) {
      enqueueSnackbar(
        "รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะ PNG, JPG, SVG, WebP และ ICO",
        { variant: "error" },
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar("ขนาดไฟล์เกินกำหนด (สูงสุด 5 MB)", { variant: "error" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    // Purely local preview - ZERO API sent!
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
    setPendingImageFile(file);
  };

  const handleRemoveIcon = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setPendingImageFile(null);
    setFormSettings((prev) => ({ ...prev, iconUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditSettings = () => {
    setFormSettings(savedSettings);
    setSettingsErrors({});
    setIsEditingSettings(true);
  };

  const handleCancelEditSettings = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setPendingImageFile(null);
    setFormSettings(savedSettings);
    setSettingsErrors({});
    setIsEditingSettings(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateSettingsField = (field: SettingsTextField, value: string) => {
    setFormSettings((current) => ({ ...current, [field]: value }));
    setSettingsErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingSettings) return;
    const validation = systemSettingsSchema.safeParse(formSettings);
    if (!validation.success) {
      const fieldErrors: Partial<Record<SettingsTextField, string>> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as SettingsTextField | undefined;
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setSettingsErrors(fieldErrors);
      return;
    }
    setSettingsErrors({});
    setIsSaving(true);
    loader.start();

    try {
      let finalIconUrl = formSettings.iconUrl;

      // If a new image was chosen, upload it now
      if (pendingImageFile) {
        const formData = new FormData();
        formData.append("file", pendingImageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success || !uploadData.url) {
          throw new Error(
            uploadData?.error || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ",
          );
        }
        finalIconUrl = uploadData.url;
      }

      const payload = {
        ...formSettings,
        iconUrl: finalIconUrl,
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSavedSettings(data.data);
        setFormSettings(data.data);
        if (imagePreviewUrl) {
          URL.revokeObjectURL(imagePreviewUrl);
        }
        setImagePreviewUrl(null);
        setPendingImageFile(null);
        setSettingsErrors({});
        setIsEditingSettings(false);
        updateBrowserMetadata(data.data);
        enqueueSnackbar("บันทึกการตั้งค่าระบบเรียบร้อยแล้ว", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(data?.error || "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า", {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error
          ? err.message
          : "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อบันทึกการตั้งค่าได้",
        { variant: "error" },
      );
    } finally {
      setIsSaving(false);
      loader.done();
    }
  };

  const handleMenuClick = (action: () => void) => {
    setSidebarOpen(false);
    if (transitionTimer) {
      clearTimeout(transitionTimer);
    }
    loader.start();
    transitionTimer = setTimeout(() => {
      action();
      loader.done();
    }, 200);
  };

  const navItems: {
    id: string;
    label: string;
    icon: any;
    active: boolean;
    count?: string;
    onClick: () => void;
  }[] = [
    {
      id: "overview",
      label: "ภาพรวม",
      icon: LayoutDashboard,
      active: activeView === "overview",
      onClick: () => handleViewChange("overview"),
    },
    {
      id: "quotes",
      label: "ใบเสนอราคา",
      icon: FileText,
      active: activeView === "quotes",
      onClick: () => handleViewChange("quotes"),
    },
    {
      id: "customers",
      label: "ลูกค้า",
      icon: Users,
      active: activeView === "customers",
      onClick: () => handleViewChange("customers"),
    },
    {
      id: "projects",
      label: "โครงการ",
      icon: Building2,
      active: activeView === "projects",
      onClick: () => handleViewChange("projects"),
    },
    {
      id: "products",
      label: "สินค้าและวัสดุ",
      icon: ClipboardList,
      active: activeView === "products",
      onClick: () => handleViewChange("products"),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-[72px]" : "w-[260px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Sidebar Brand Header */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4 transition-all",
            sidebarCollapsed ? "justify-center" : "justify-between",
          )}
        >
          <div
            className="flex items-center gap-3 overflow-hidden cursor-pointer"
            onClick={() => handleViewChange("overview")}
            title="ไปหน้าภาพรวม"
          >
            {/* Logo: Dynamic Icon or Default ShieldCheck */}
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-border/50 bg-card p-1 overflow-hidden">
              {savedSettings.iconUrl ? (
                <img
                  src={savedSettings.iconUrl}
                  alt={savedSettings.siteName || "Logo"}
                  className="size-full object-contain"
                />
              ) : (
                <div className="grid size-full place-items-center rounded-md bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                  {savedSettings.siteName || "Site Name"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {savedSettings.siteDescription || "Site Description"}
                </p>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setSidebarOpen(false)}
            className="text-muted-foreground hover:text-sidebar-foreground lg:hidden"
            aria-label="ปิดเมนู"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Menu */}
          <div>
            {!sidebarCollapsed ? (
              <p className="mb-2 px-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                เมนูหลัก
              </p>
            ) : (
              <div className="mb-2 h-4" />
            )}
            <nav className="space-y-1">
              {navItems.map(
                ({ id, label, icon: Icon, active, count, onClick }) => {
                  const btn = (
                    <button
                      key={id}
                      onClick={onClick}
                      className={cn(
                        "group flex w-full items-center rounded-lg text-sm font-medium transition-colors",
                        sidebarCollapsed
                          ? "justify-center p-2.5"
                          : "gap-3 px-3 py-2.5",
                        active
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active
                            ? "text-primary-foreground"
                            : "text-sidebar-foreground/75 group-hover:text-sidebar-accent-foreground",
                        )}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="truncate flex-1 text-left">
                            {label}
                          </span>
                          {count && (
                            <span
                              className={cn(
                                "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold",
                                active
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-sidebar-accent text-sidebar-accent-foreground",
                              )}
                            >
                              {count}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );

                  if (sidebarCollapsed) {
                    return (
                      <Tooltip key={id}>
                        <TooltipTrigger render={btn} />
                        <TooltipContent side="right">
                          <span>{label}</span>
                          {count && (
                            <span className="ml-1 text-muted-foreground">
                              ({count})
                            </span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return btn;
                },
              )}
            </nav>
          </div>

          {/* System Settings */}
          <div>
            {!sidebarCollapsed ? (
              <p className="mb-2 px-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                ระบบ
              </p>
            ) : (
              <Separator className="my-2" />
            )}
            <div className="space-y-1">
              {/* System Settings */}
              {sidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={() => handleViewChange("settings")}
                        className={cn(
                          "flex w-full items-center justify-center rounded-lg p-2.5 transition-colors",
                          activeView === "settings"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <Settings2 className="size-4 shrink-0" />
                      </button>
                    }
                  />
                  <TooltipContent side="right">การตั้งค่าระบบ</TooltipContent>
                </Tooltip>
              ) : (
                <button
                  onClick={() => handleViewChange("settings")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    activeView === "settings"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Settings2 className="size-4 shrink-0" />
                  <span className="truncate">การตั้งค่าระบบ</span>
                </button>
              )}

              {/* User Settings */}
              {sidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={() => handleViewChange("user-settings")}
                        className={cn(
                          "flex w-full items-center justify-center rounded-lg p-2.5 transition-colors",
                          activeView === "user-settings"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <UserCog className="size-4 shrink-0" />
                      </button>
                    }
                  />
                  <TooltipContent side="right">
                    การตั้งค่าผู้ใช้งาน
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button
                  onClick={() => handleViewChange("user-settings")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    activeView === "user-settings"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <UserCog className="size-4 shrink-0" />
                  <span className="truncate">การตั้งค่าผู้ใช้งาน</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Neon DB Storage Space (iPhone Storage style) */}
        <div className="mt-auto border-t border-sidebar-border/70 p-3">
          <NeonStorageWidget sidebarCollapsed={sidebarCollapsed} />
        </div>

        {/* Sidebar Footer User Info */}
        <div className="border-t border-sidebar-border p-3">
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="flex justify-center py-1">
                    <Avatar
                      size="sm"
                      className="ring-1 ring-border cursor-pointer"
                    >
                      <AvatarImage
                        src="/image/user.png"
                        alt="รูปโปรไฟล์ผู้ใช้งาน"
                      />
                      <AvatarFallback className="bg-primary/15 text-primary font-semibold text-xs">
                        กน
                      </AvatarFallback>
                    </Avatar>
                  </div>
                }
              />
              <TooltipContent side="right">
                <p className="font-semibold">{currentUser?.name}</p>
                <p className="text-muted-foreground text-xs">ผู้ดูแลระบบ</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="lg"
              className="cursor-pointer flex items-center justify-between rounded-lg bg-sidebar-accent/60 group h-full p-3 w-full"
              onClick={handleSignOut}
            >
              <div className="flex items-center  gap-3 pl-2">
                <Avatar size="sm" className="ring-1 ring-border">
                  <AvatarImage
                    src="/image/user.png"
                    alt="รูปโปรไฟล์ผู้ใช้งาน"
                  />
                </Avatar>
                <div className="min-w-0 flex flex-col items-start space-y-1">
                  <p className="truncate text-xs font-semibold text-sidebar-foreground">
                    {displayName}
                  </p>
                  <div className="scale-90 -ml-1.5">
                    <UserRoleBadge
                      role={String(session?.user?.role || "user")}
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground group-hover:text-destructive"
                aria-label="ออกจากระบบ"
                title="ออกจากระบบ"
              >
                <LogOut className="size-4 group-hover:text-destructive" />
              </Button>
            </Button>
          )}
        </div>
      </aside>

      {/* Main Layout Area */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out",
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]",
        )}
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-md">
          {/* Left: Mobile trigger, Desktop collapse toggle & Page Title */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
              aria-label="เปิดเมนู"
            >
              <Menu className="size-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={
                sidebarCollapsed ? "ขยายเมนูด้านข้าง" : "ย่อเมนูด้านข้าง"
              }
              title={sidebarCollapsed ? "ขยายเมนูด้านข้าง" : "ย่อเมนูด้านข้าง"}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="size-5" />
              ) : (
                <PanelLeftClose className="size-5" />
              )}
            </Button>

            <Separator
              orientation="vertical"
              className="hidden sm:block h-10"
            />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  {activeView === "overview"
                    ? "ภาพรวมระบบ"
                    : activeView === "settings"
                      ? "การตั้งค่าระบบ"
                      : activeView === "customers"
                        ? "ข้อมูลลูกค้า"
                        : activeView === "projects"
                          ? "ข้อมูลโครงการ"
                          : activeView === "products"
                            ? "ข้อมูลสินค้าและวัสดุ"
                            : "การตั้งค่าผู้ใช้งาน"}
                </h1>
              </div>
            </div>
          </div>

          {/* Right: Search, Notifications, Theme Toggle, Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Action */}
            <button
              onClick={() => setNotice(true)}
              className="hidden md:flex items-center gap-2 rounded-lg border border-input bg-card/60 hover:bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-xs transition-colors"
            >
              <Search className="size-3.5" />
              <span>ค้นหาใบเสนอราคา...</span>
              <kbd className="ml-3 rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                ⌘ K
              </kbd>
            </button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setNotice(true)}
              aria-label="ค้นหา"
            >
              <Search className="size-4" />
            </Button>

            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
              onClick={() => setNotice(true)}
              aria-label="การแจ้งเตือน"
            >
              <Bell className="size-4" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            <Separator orientation="vertical" className="h-10 hidden sm:block" />
            <Avatar size="sm" className="ring-1 ring-border">
              <AvatarImage src="/image/user.png" alt="รูปโปรไฟล์ผู้ใช้งาน" />
            </Avatar>
            <span className="hidden max-w-48 truncate text-sm font-medium text-foreground sm:block">
              {displayName}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="h-9 gap-1.5 hover:text-destructive"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="mx-auto w-full max-w-360 flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {activeView === "overview" ? (
            <OverviewView
              onNavigateView={handleViewChange}
              currentUser={currentUser}
            />
          ) : activeView === "settings" ? (
            /* System Settings View Inside Dashboard Layout */
            <div className="space-y-5">
              {/* Back to Overview and Title Row */}
              <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleViewChange("overview")}
                    className="size-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    aria-label="กลับหน้าภาพรวม"
                    title="กลับหน้าภาพรวม"
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <div
                    className="w-px self-stretch bg-border"
                    aria-hidden="true"
                  />
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl leading-tight">
                      การตั้งค่าระบบ
                    </h1>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      กำหนดค่าพื้นฐาน ข้อมูลบริษัท ไอคอนเว็บไซต์ และการแสดงผล
                    </p>
                  </div>
                </div>
                {isEditingSettings ? (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEditSettings}
                      disabled={isSaving}
                      className="h-9 gap-1.5"
                    >
                      <X className="size-4" />
                      <span>ยกเลิก</span>
                    </Button>
                    <Button
                      type="submit"
                      form="system-settings-form"
                      size="sm"
                      disabled={isSaving}
                      className="h-9 gap-1.5"
                    >
                      {isSaving ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      <span>
                        {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                      </span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleEditSettings}
                    className="h-9 gap-1.5 self-end sm:self-auto"
                  >
                    <Pencil className="size-4" />
                    <span>แก้ไข</span>
                  </Button>
                )}
              </div>

              {/* Settings Form Card */}
              <Card className="overflow-hidden border border-border/80 shadow-xs">
                <CardContent className="p-6 sm:p-8">
                  <form
                    id="system-settings-form"
                    onSubmit={handleSaveSettings}
                    className="space-y-6"
                    noValidate
                  >
                    {/* Website Icon Upload Section */}
                    <div className="flex items-center gap-4 border-b border-border pb-6">
                      <div className="relative grid size-20 shrink-0 place-items-center rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground overflow-hidden">
                        {imagePreviewUrl || formSettings.iconUrl ? (
                          <img
                            src={imagePreviewUrl || formSettings.iconUrl!}
                            alt="Website Icon Preview"
                            className="size-full object-contain p-2"
                          />
                        ) : (
                          <ImagePlus className="size-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          ไอคอนและโลโก้เว็บไซต์
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          รูปนี้จะถูกนำไปใช้เป็นโลโก้ของระบบ และ Favicon
                          บนแท็บบราวเซอร์{" "}
                          {isEditingSettings ? (
                            <>( PNG, JPG, SVG, WebP ขนาดไม่เกิน 5 MB)</>
                          ) : null}
                        </p>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon"
                          className="hidden"
                        />
                        {isEditingSettings ? (
                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs gap-1.5"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <ImagePlus className="size-3.5" />
                              เลือกรูปภาพใหม่
                            </Button>
                            {(imagePreviewUrl || formSettings.iconUrl) && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-xs text-destructive hover:text-destructive"
                                onClick={handleRemoveIcon}
                              >
                                นำออก
                              </Button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Settings Form Fields Grid */}
                    <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2.5">
                        <label
                          htmlFor="siteName"
                          className="text-sm font-medium text-foreground"
                        >
                          ชื่อเว็บ (Site Name){" "}
                          {isEditingSettings ? (
                            <span className="text-destructive">*</span>
                          ) : null}
                        </label>
                        <Input
                          id="siteName"
                          name="siteName"
                          value={
                            isEditingSettings
                              ? formSettings.siteName
                              : formSettings.siteName || "-"
                          }
                          onChange={(e) =>
                            updateSettingsField("siteName", e.target.value)
                          }
                          aria-invalid={Boolean(settingsErrors.siteName)}
                          aria-describedby={
                            settingsErrors.siteName
                              ? "siteName-error"
                              : undefined
                          }
                          placeholder={
                            isEditingSettings
                              ? "ชื่อเว็บไซต์หรือธุรกิจของคุณ"
                              : undefined
                          }
                          maxLength={160}
                          disabled={!isEditingSettings}
                          className={
                            !isEditingSettings ? "bg-muted/40" : undefined
                          }
                        />
                        <SettingsFieldError
                          id="siteName-error"
                          message={settingsErrors.siteName}
                        />
                        <p className="text-xs text-muted-foreground">
                          จะแสดงบนแท็บเบราว์เซอร์ (Title) และโลโก้ด้านข้าง
                        </p>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <label
                          htmlFor="siteDescription"
                          className="text-sm font-medium text-foreground"
                        >
                          รายละเอียดเว็บ (Site Description)
                        </label>
                        <Input
                          id="siteDescription"
                          name="siteDescription"
                          value={
                            isEditingSettings
                              ? formSettings.siteDescription
                              : formSettings.siteDescription || "-"
                          }
                          onChange={(e) =>
                            updateSettingsField(
                              "siteDescription",
                              e.target.value,
                            )
                          }
                          aria-invalid={Boolean(settingsErrors.siteDescription)}
                          aria-describedby={
                            settingsErrors.siteDescription
                              ? "siteDescription-error"
                              : undefined
                          }
                          placeholder={
                            isEditingSettings
                              ? "รายละเอียดสั้น ๆ ของเว็บไซต์หรือธุรกิจของคุณ"
                              : undefined
                          }
                          maxLength={500}
                          disabled={!isEditingSettings}
                          className={
                            !isEditingSettings ? "bg-muted/40" : undefined
                          }
                        />
                        <SettingsFieldError
                          id="siteDescription-error"
                          message={settingsErrors.siteDescription}
                        />
                        <p className="text-xs text-muted-foreground">
                          จะนำไปใส่ใน meta description และหัวข้อย่อย
                        </p>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <label
                          htmlFor="companyName"
                          className="text-sm font-medium text-foreground"
                        >
                          ชื่อบริษัท
                        </label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={
                            isEditingSettings
                              ? formSettings.companyName
                              : formSettings.companyName || "-"
                          }
                          onChange={(e) =>
                            updateSettingsField("companyName", e.target.value)
                          }
                          aria-invalid={Boolean(settingsErrors.companyName)}
                          aria-describedby={
                            settingsErrors.companyName
                              ? "companyName-error"
                              : undefined
                          }
                          placeholder={
                            isEditingSettings
                              ? "บริษัท ของคุณ จำกัด"
                              : undefined
                          }
                          maxLength={200}
                          disabled={!isEditingSettings}
                          className={
                            !isEditingSettings ? "bg-muted/40" : undefined
                          }
                        />
                        <SettingsFieldError
                          id="companyName-error"
                          message={settingsErrors.companyName}
                        />
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <label
                          htmlFor="taxId"
                          className="text-sm font-medium text-foreground"
                        >
                          เลขที่ผู้เสียภาษี
                        </label>
                        <Input
                          id="taxId"
                          name="taxId"
                          value={
                            isEditingSettings
                              ? formSettings.taxId
                              : formSettings.taxId || "-"
                          }
                          onChange={(e) =>
                            updateSettingsField("taxId", e.target.value)
                          }
                          aria-invalid={Boolean(settingsErrors.taxId)}
                          aria-describedby={
                            settingsErrors.taxId ? "taxId-error" : undefined
                          }
                          placeholder={
                            isEditingSettings ? "010555xxxxxxx" : undefined
                          }
                          maxLength={32}
                          disabled={!isEditingSettings}
                          className={
                            !isEditingSettings ? "bg-muted/40" : undefined
                          }
                        />
                        <SettingsFieldError
                          id="taxId-error"
                          message={settingsErrors.taxId}
                        />
                      </div>

                      <div className="flex flex-col gap-2.5 sm:col-span-2">
                        <label
                          htmlFor="address"
                          className="text-sm font-medium text-foreground"
                        >
                          ที่อยู่บริษัท
                        </label>
                        <Input
                          id="address"
                          name="address"
                          value={
                            isEditingSettings
                              ? formSettings.address
                              : formSettings.address || "-"
                          }
                          onChange={(e) =>
                            updateSettingsField("address", e.target.value)
                          }
                          aria-invalid={Boolean(settingsErrors.address)}
                          aria-describedby={
                            settingsErrors.address ? "address-error" : undefined
                          }
                          placeholder={
                            isEditingSettings
                              ? "เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                              : undefined
                          }
                          maxLength={500}
                          disabled={!isEditingSettings}
                          className={
                            !isEditingSettings ? "bg-muted/40" : undefined
                          }
                        />
                        <SettingsFieldError
                          id="address-error"
                          message={settingsErrors.address}
                        />
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <label
                          htmlFor="website"
                          className="text-sm font-medium text-foreground"
                        >
                          เว็บไซต์
                        </label>
                        <Input
                          id="website"
                          name="website"
                          value={
                            isEditingSettings
                              ? formSettings.website
                              : formSettings.website || "-"
                          }
                          onChange={(e) =>
                            updateSettingsField("website", e.target.value)
                          }
                          aria-invalid={Boolean(settingsErrors.website)}
                          aria-describedby={
                            settingsErrors.website ? "website-error" : undefined
                          }
                          placeholder={
                            isEditingSettings
                              ? "https://example.com"
                              : undefined
                          }
                          maxLength={300}
                          disabled={!isEditingSettings}
                          className={
                            !isEditingSettings ? "bg-muted/40" : undefined
                          }
                        />
                        <SettingsFieldError
                          id="website-error"
                          message={settingsErrors.website}
                        />
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-foreground"
                        >
                          อีเมล
                        </label>
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={
                            isEditingSettings
                              ? formSettings.email
                              : formSettings.email || "-"
                          }
                          onChange={(e) =>
                            updateSettingsField("email", e.target.value)
                          }
                          aria-invalid={Boolean(settingsErrors.email)}
                          aria-describedby={
                            settingsErrors.email ? "email-error" : undefined
                          }
                          placeholder={
                            isEditingSettings
                              ? "contact@example.com"
                              : undefined
                          }
                          maxLength={160}
                          disabled={!isEditingSettings}
                          className={
                            !isEditingSettings ? "bg-muted/40" : undefined
                          }
                        />
                        <SettingsFieldError
                          id="email-error"
                          message={settingsErrors.email}
                        />
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <label
                          htmlFor="phone"
                          className="text-sm font-medium text-foreground"
                        >
                          เบอร์โทรศัพท์
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={
                            isEditingSettings
                              ? formSettings.phone
                              : formSettings.phone || "-"
                          }
                          onChange={(e) =>
                            updateSettingsField("phone", e.target.value)
                          }
                          aria-invalid={Boolean(settingsErrors.phone)}
                          aria-describedby={
                            settingsErrors.phone ? "phone-error" : undefined
                          }
                          placeholder={
                            isEditingSettings ? "02-xxx-xxxx" : undefined
                          }
                          maxLength={40}
                          disabled={!isEditingSettings}
                          className={
                            !isEditingSettings ? "bg-muted/40" : undefined
                          }
                        />
                        <SettingsFieldError
                          id="phone-error"
                          message={settingsErrors.phone}
                        />
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground">
                การตั้งค่าชื่อเว็บและไอคอนจะมีผลต่อเอกสารใบเสนอราคา,
                หน้าต่างแท็บเบราว์เซอร์ (Title & Favicon)
                และโลโก้ในระบบโดยอัตโนมัติ
              </p>
            </div>
          ) : activeView === "customers" ? (
            <CustomerView
              onBack={() => handleViewChange("overview")}
              userRole={session?.user?.role}
            />
          ) : activeView === "projects" ? (
            <ProjectView
              onBack={() => handleViewChange("overview")}
              userRole={session?.user?.role}
            />
          ) : activeView === "products" ? (
            <ProductView
              onBack={() => handleViewChange("overview")}
              userRole={session?.user?.role}
            />
          ) : activeView === "quotes" ? (
            <QuotationView />
          ) : (
            <UserSettingsView
              onBack={() => handleViewChange("overview")}
              currentUserId={currentUser?.id}
            />
          )}

          {/* Footer note */}
          {/* <footer className="py-6 text-center text-xs text-muted-foreground">
            <p>
              {savedSettings.siteName || "Site Name"} •{" "}
              {savedSettings.siteDescription || "Site Description"} • &copy;{" "}
              {new Date().getFullYear()} • All rights reserved.
            </p>
          </footer> */}
        </main>
      </div>

      {/* Floating Notice / Toast */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xl ring-1 ring-foreground/5 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              พร้อมใช้งานในขั้นตอนถัดไป
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              ฟังก์ชันเชื่อมต่อระบบกำลังเตรียมพร้อมสำหรับการทำงาน
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setNotice(false)}
            className="text-muted-foreground hover:text-foreground -mr-1 -mt-1"
            aria-label="ปิดข้อความ"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
