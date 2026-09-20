'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  QuotationDetail,
  QuotationListItem,
  QuotationStats,
  QuotationStatus,
} from './quotations/quotation-types';
import { QuotationList } from './quotations/quotation-list';
import { QuotationForm } from './quotations/quotation-form';
import { QuotationDetailView } from './quotations/quotation-detail';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

interface QuotationViewProps {
  initialQuotationId?: string | null;
}

export function QuotationView({ initialQuotationId }: QuotationViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialQuotationId ? 'detail' : 'list',
  );
  const [activeQuotationId, setActiveQuotationId] = useState<string | null>(
    initialQuotationId || null,
  );

  // Data states
  const [items, setItems] = useState<QuotationListItem[]>([]);
  const [stats, setStats] = useState<QuotationStats>({
    totalQuotations: 0,
    pendingCount: 0,
    approvedCount: 0,
    totalValue: 0,
  });
  const [currentQuotation, setCurrentQuotation] =
    useState<QuotationDetail | null>(null);

  // Pagination & Filtering
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Deletion confirm modal state (only modal used, for destructive safety)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Fetch list of quotations
  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter && statusFilter !== 'ALL')
        params.set('status', statusFilter);

      const res = await fetch(`/api/quotations?${params.toString()}`);
      const json = await res.json();

      if (json?.success && json?.data) {
        setItems(json.data.items || []);
        if (json.data.pagination) {
          setTotalPages(json.data.pagination.totalPages || 1);
        }
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  // Load Single Quotation Detail
  const fetchQuotationDetail = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quotations/${id}`);
      const json = await res.json();
      if (json?.success && json?.data) {
        setCurrentQuotation(json.data);
        return json.data;
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  // Handle Initial Quotation ID if provided
  useEffect(() => {
    if (initialQuotationId) {
      fetchQuotationDetail(initialQuotationId);
      setActiveQuotationId(initialQuotationId);
      setViewMode('detail');
    }
  }, [initialQuotationId, fetchQuotationDetail]);

  // Navigation handlers
  const handleCreateNew = () => {
    setCurrentQuotation(null);
    setActiveQuotationId(null);
    setViewMode('create');
  };

  const handleViewDetail = async (id: string) => {
    setActiveQuotationId(id);
    const data = await fetchQuotationDetail(id);
    if (data) {
      setViewMode('detail');
    }
  };

  const handleEdit = async (id: string) => {
    setActiveQuotationId(id);
    const data = await fetchQuotationDetail(id);
    if (data) {
      setViewMode('edit');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setActiveQuotationId(null);
    setCurrentQuotation(null);
    fetchQuotations();
  };

  // Save Quotation (Create or Update)
  const handleSaveQuotation = async (payload: any, isSubmit: boolean) => {
    setLoading(true);
    try {
      const isUpdating = viewMode === 'edit' && activeQuotationId;
      const url = isUpdating
        ? `/api/quotations/${activeQuotationId}`
        : '/api/quotations';
      const method = isUpdating ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        alert(json?.error || 'เกิดข้อผิดพลาดในการบันทึกใบเสนอราคา');
        return;
      }

      // Success: view the updated/created quotation in detail mode
      const saved = json.data;
      setCurrentQuotation(saved);
      setActiveQuotationId(saved.id);
      setViewMode('detail');
      fetchQuotations();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      );
    } finally {
      setLoading(false);
    }
  };

  // Status Change Handler
  const handleChangeStatus = async (
    id: string,
    newStatus: QuotationStatus,
    reason?: string,
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quotations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejectionReason: reason }),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        alert(json?.error || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
        return;
      }

      // Update current detail if active
      if (currentQuotation && currentQuotation.id === id) {
        setCurrentQuotation(json.data);
      }
      fetchQuotations();
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  // Delete Handlers
  const handleDeleteRequest = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/quotations/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        alert(json?.error || 'เกิดข้อผิดพลาดในการลบใบเสนอราคา');
        return;
      }
      setDeleteTargetId(null);
      if (viewMode !== 'list') {
        setViewMode('list');
      }
      fetchQuotations();
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full">
      {/* View Switcher: List, Create, Edit, or Detail */}
      {viewMode === 'list' && (
        <QuotationList
          items={items}
          stats={stats}
          loading={loading}
          page={page}
          totalPages={totalPages}
          search={search}
          statusFilter={statusFilter}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          onStatusFilterChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          onPageChange={setPage}
          onRefresh={fetchQuotations}
          onCreateNew={handleCreateNew}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onChangeStatus={handleChangeStatus}
        />
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <QuotationForm
          initialData={viewMode === 'edit' ? currentQuotation : null}
          onSave={handleSaveQuotation}
          onCancel={handleBackToList}
          loading={loading}
        />
      )}

      {viewMode === 'detail' && currentQuotation && (
        <QuotationDetailView
          quotation={currentQuotation}
          onBack={handleBackToList}
          onEdit={handleEdit}
          onChangeStatus={handleChangeStatus}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal (Only modal used in the entire feature, for destructive safety) */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-foreground">
              ยืนยันการลบใบเสนอราคา
            </h3>
            <p className="text-xs text-muted-foreground">
              คุณแน่ใจหรือไม่ว่าต้องการลบใบเสนอราคานี้?
              การกระทำนี้ไม่สามารถเรียกคืนได้
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTargetId(null)}
                className="px-3 py-1.5 text-xs rounded-md border border-border text-foreground hover:bg-muted"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 text-xs rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm"
              >
                {deleting ? 'กำลังลบ...' : 'ยืนยันลบเอกสาร'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
