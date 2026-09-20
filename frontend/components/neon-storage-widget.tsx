"use client";

import { useEffect, useState, useCallback } from "react";
import { Database, ExternalLink, HardDrive, RefreshCw, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "cn";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export interface StorageBreakdown {
  tableDataBytes: number;
  tableDataPretty: string;
  tableDataPercent: number;
  indexBytes: number;
  indexPretty: string;
  indexPercent: number;
  systemBytes: number;
  systemPretty: string;
  systemPercent: number;
  freePercent: number;
}

export interface StorageStats {
  databaseName: string;
  projectName: string;
  branch: string;
  totalLimitBytes: number;
  totalLimitPretty: string;
  usedBytes: number;
  usedPretty: string;
  freeBytes: number;
  freePretty: string;
  usedPercent: number;
  breakdown: StorageBreakdown;
}

const DEFAULT_STATS: StorageStats = {
  databaseName: "neondb",
  projectName: "SGQ DB",
  branch: "production",
  totalLimitBytes: 536870912,
  totalLimitPretty: "512 MB",
  usedBytes: 32464896,
  usedPretty: "32.5 MB",
  freeBytes: 504406016,
  freePretty: "479.5 MB",
  usedPercent: 6.0,
  breakdown: {
    tableDataBytes: 40960,
    tableDataPretty: "40 KB",
    tableDataPercent: 0.01,
    indexBytes: 286720,
    indexPretty: "280 KB",
    indexPercent: 0.05,
    systemBytes: 32137216,
    systemPretty: "32.1 MB",
    systemPercent: 5.94,
    freePercent: 94.0,
  },
};

export function NeonStorageWidget({
  sidebarCollapsed = false,
}: {
  sidebarCollapsed?: boolean;
}) {
  const [stats, setStats] = useState<StorageStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStorage = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/storage", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch {
      // Use baseline fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStorage();
  }, [fetchStorage]);

  // Proportional widths for iPhone-style storage capsule bar
  // The used section occupies usedPercent of the total bar (min 6% for visual clarity)
  const usedWidth = Math.min(100, Math.max(7, stats.usedPercent));

  // Calculate relative proportions within the used storage section
  const totalUsed = stats.usedBytes || 1;
  const dataShare = Math.max(
    12,
    ((stats.breakdown.tableDataBytes || 40960) / totalUsed) * 100,
  );
  const indexShare = Math.max(
    18,
    ((stats.breakdown.indexBytes || 286720) / totalUsed) * 100,
  );
  const systemShare = Math.max(20, 100 - dataShare - indexShare);

  // If sidebar is collapsed (icon-only mode: 64px width)
  if (sidebarCollapsed) {
    const trigger = (
      <a
        href="https://console.neon.tech/app/projects/floral-sea-43062876/branches/br-restless-dawn-b4zkb9v2"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center p-2 rounded-lg text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group relative cursor-pointer"
        aria-label="เปิด Neon DB Console"
        title="เปิด Neon DB Console ในแท็บใหม่"
      >
        <div className="relative">
          <Database className="size-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
        </div>
      </a>
    );

    return (
      <Tooltip>
        <TooltipTrigger render={trigger} />
        <TooltipContent
          side="right"
          className="w-64 p-3 bg-popover text-popover-foreground border border-border shadow-md rounded-xl space-y-2.5"
        >
          {/* Tooltip iPhone storage preview */}
          <div className="flex items-center justify-between">
            <a
              href="https://console.neon.tech/app/projects/floral-sea-43062876/branches/br-restless-dawn-b4zkb9v2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:underline text-foreground cursor-pointer group"
              title="เปิด Neon Console ในแท็บใหม่"
            >
              <Database className="size-3.5 text-emerald-500" />
              <span className="text-xs font-semibold">Neon DB Storage</span>
              <ExternalLink className="size-2.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
            <span className="text-xs font-mono font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {stats.usedPercent}% ใช้ไป
            </span>
          </div>

          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-foreground">
              {stats.usedPretty}
            </span>
            <span className="text-muted-foreground text-xs">
              ทั้งหมด {stats.totalLimitPretty}
            </span>
          </div>

          {/* iPhone Storage Bar */}
          <div className="h-2.5 w-full rounded-full bg-muted/80 dark:bg-muted/40 overflow-hidden flex p-0 shadow-inner">
            <div
              className="h-full flex rounded-full overflow-hidden transition-all duration-500"
              style={{ width: `${usedWidth}%` }}
            >
              <div
                style={{ width: `${dataShare}%` }}
                className="h-full bg-sky-500"
                title={`ข้อมูลตาราง: ${stats.breakdown.tableDataPretty}`}
              />
              <div
                style={{ width: `${indexShare}%` }}
                className="h-full bg-purple-500"
                title={`ดัชนี (Indexes): ${stats.breakdown.indexPretty}`}
              />
              <div
                style={{ width: `${systemShare}%` }}
                className="h-full bg-amber-400"
                title={`ระบบ & WAL: ${stats.breakdown.systemPretty}`}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-sky-500 shrink-0" />
              <span className="truncate">
                ข้อมูล: {stats.breakdown.tableDataPretty}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-purple-500 shrink-0" />
              <span className="truncate">
                ดัชนี: {stats.breakdown.indexPretty}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-400 shrink-0" />
              <span className="truncate">
                ระบบ: {stats.breakdown.systemPretty}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground/30 shrink-0" />
              <span className="truncate">ว่าง: {stats.freePretty}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Expanded Sidebar View: Full iPhone-style Storage Card
  return (
    <div className="rounded-xl border border-sidebar-border/80 bg-sidebar-accent/35 p-3 space-y-2.5 transition-all hover:bg-sidebar-accent/50 shadow-xs">
      {/* 1. Header: Icon, Title & Live Status */}

      <div className="flex items-center justify-between">
        <a
          href="https://console.neon.tech/app/projects/floral-sea-43062876/branches/br-restless-dawn-b4zkb9v2"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-sidebar-foreground p-1 -ml-1 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer group flex items-center gap-2 min-w-0"
          title="เปิด Neon Console ในแท็บใหม่"
          aria-label="เปิด Neon Console ในแท็บใหม่"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 group-hover:bg-emerald-500/20 transition-colors">
              <Database className="size-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-sidebar-foreground truncate group-hover:underline">
                  Neon DB Storage
                </span>
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <ExternalLink className="size-3 text-muted-foreground/60 group-hover:text-sidebar-foreground transition-colors shrink-0" />
              </div>
            </div>
          </div>
        </a>

        {/* Refresh button */}
        <button
          type="button"
          onClick={() => void fetchStorage()}
          disabled={isLoading}
          className="text-muted-foreground hover:text-sidebar-foreground p-1 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer"
          title="อัปเดตข้อมูลพื้นที่จัดเก็บ"
          aria-label="รีเฟรชข้อมูลพื้นที่"
        >
          <RefreshCw
            className={cn("size-3", isLoading && "animate-spin text-primary")}
          />
        </button>
      </div>

      {/* 2. Primary Usage Display (iPhone Storage style: X MB of Y MB) */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold tracking-tight text-foreground font-mono">
            {stats.usedPretty}
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            จาก {stats.totalLimitPretty}
          </span>
        </div>
        <span className="text-xs font-mono font-medium text-muted-foreground">
          {stats.usedPercent}%
        </span>
      </div>

      {/* 3. The iPhone Storage Bar ("หลอด" แบบ iPhone Storage) */}
      <div className="relative">
        <div
          className="h-2.5 w-full rounded-full bg-muted/70 dark:bg-muted/40 overflow-hidden flex p-0 shadow-inner"
          title={`ใช้ไป ${stats.usedPretty} จากทั้งหมด ${stats.totalLimitPretty} (เหลือพื้นที่ว่าง ${stats.freePretty})`}
        >
          {/* Filled portion containing multi-colored segments */}
          <div
            className="h-full flex rounded-full overflow-hidden transition-all duration-500 ease-out"
            style={{ width: `${usedWidth}%` }}
          >
            {/* Segment 1: User Data (Tables) - iOS Blue */}
            <div
              style={{ width: `${dataShare}%` }}
              className="h-full bg-sky-500 hover:brightness-110 transition-all cursor-pointer"
              title={`ข้อมูลตาราง: ${stats.breakdown.tableDataPretty}`}
            />
            {/* Segment 2: Indexes - iOS Purple */}
            <div
              style={{ width: `${indexShare}%` }}
              className="h-full bg-purple-500 hover:brightness-110 transition-all cursor-pointer"
              title={`ดัชนี (Indexes): ${stats.breakdown.indexPretty}`}
            />
            {/* Segment 3: System & WAL - iOS Amber / Yellow */}
            <div
              style={{ width: `${systemShare}%` }}
              className="h-full bg-amber-400 hover:brightness-110 transition-all cursor-pointer"
              title={`ระบบ & ประวัติ WAL: ${stats.breakdown.systemPretty}`}
            />
          </div>
        </div>
      </div>

      {/* 4. iPhone Storage Dots Legend */}
      {/* <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-0.5 text-xs text-muted-foreground select-none">
        <div className="flex items-center gap-1.5 min-w-0" title={`ข้อมูลตาราง: ${stats.breakdown.tableDataPretty}`}>
          <span className="size-2 rounded-full bg-sky-500 shrink-0 shadow-xs" />
          <span className="truncate">ข้อมูล {stats.breakdown.tableDataPretty}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0" title={`ดัชนี: ${stats.breakdown.indexPretty}`}>
          <span className="size-2 rounded-full bg-purple-500 shrink-0 shadow-xs" />
          <span className="truncate">ดัชนี {stats.breakdown.indexPretty}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0" title={`ระบบ & ประวัติการจัดเก็บ: ${stats.breakdown.systemPretty}`}>
          <span className="size-2 rounded-full bg-amber-400 shrink-0 shadow-xs" />
          <span className="truncate">ระบบ {stats.breakdown.systemPretty}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0" title={`พื้นที่ว่างคงเหลือ: ${stats.freePretty}`}>
          <span className="size-2 rounded-full bg-muted-foreground/30 shrink-0" />
          <span className="truncate">ว่าง {stats.freePretty}</span>
        </div>
      </div> */}

      {/* 5. Subtle Footer info: Free space status */}
      <div className="flex items-center justify-between pt-0.5 border-t border-sidebar-border/50 text-xs text-muted-foreground">
        <span>เหลือพื้นที่ว่าง</span>
        <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
          {stats.freePretty} ({stats.breakdown.freePercent}%)
        </span>
      </div>
    </div>
  );
}
