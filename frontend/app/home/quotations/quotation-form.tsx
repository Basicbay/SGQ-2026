'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  FileSpreadsheet,
  FileText,
  Percent,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  bahttext,
  formatCurrency,
  ITEM_TYPE_CONFIG,
  QuotationDetail,
  QuotationDiscountType,
  QuotationItem,
  QuotationItemType,
  QuotationStatus,
} from './quotation-types';

interface CustomerOption {
  id: string;
  customerCode: string;
  name: string;
  customerType: string;
  taxId?: string | null;
  contactName?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface ProjectOption {
  id: string;
  projectCode: string;
  name: string;
  customerId?: string | null;
}

interface ProductOption {
  id: string;
  productCode: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
}

interface QuotationFormProps {
  initialData?: QuotationDetail | null;
  onSave: (payload: any, isSubmit: boolean) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function QuotationForm({
  initialData,
  onSave,
  onCancel,
  loading,
}: QuotationFormProps) {
  const isEditing = Boolean(initialData?.id);

  // Form State
  const [quotationNumber, setQuotationNumber] = useState(
    initialData?.quotationNumber || '',
  );
  const [customerId, setCustomerId] = useState(initialData?.customerId || '');
  const [customerName, setCustomerName] = useState(
    initialData?.customerName || '',
  );
  const [customerAddress, setCustomerAddress] = useState(
    initialData?.customerAddress || '',
  );
  const [customerPhone, setCustomerPhone] = useState(
    initialData?.customerPhone || '',
  );
  const [customerTaxId, setCustomerTaxId] = useState(
    initialData?.customerTaxId || '',
  );
  const [customerContact, setCustomerContact] = useState(
    initialData?.customerContact || '',
  );

  const [projectId, setProjectId] = useState(initialData?.projectId || '');
  const [projectName, setProjectName] = useState(
    initialData?.projectName || '',
  );

  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate || new Date().toISOString().split('T')[0],
  );
  const [validDays, setValidDays] = useState<number>(
    initialData?.validDays || 30,
  );
  const [validUntil, setValidUntil] = useState(initialData?.validUntil || '');

  const [discountType, setDiscountType] = useState<QuotationDiscountType>(
    initialData?.discountType || 'AMOUNT',
  );
  const [discountRate, setDiscountRate] = useState<number>(
    initialData?.discountRate || 0,
  );

  const [includeVat, setIncludeVat] = useState<boolean>(
    initialData?.vatRate !== undefined ? Number(initialData.vatRate) > 0 : true,
  );
  const [vatRate, setVatRate] = useState<number>(initialData?.vatRate ?? 7.0);

  const [paymentTerms, setPaymentTerms] = useState(
    initialData?.paymentTerms ||
      'มัดจำ 50% เมื่องวดแรก, 50% เมื่องานติดตั้งแล้วเสร็จตรวจรับ',
  );
  const [deliveryTerms, setDeliveryTerms] = useState(
    initialData?.deliveryTerms ||
      'จัดส่งและติดตั้งภายใน 14-21 วันทำการหลังได้รับเงินมัดจำ',
  );
  const [warrantyTerms, setWarrantyTerms] = useState(
    initialData?.warrantyTerms ||
      'รับประกันผลงานติดตั้ง 1 ปี รับประกันคุณภาพอุปกรณ์และกระจกตามมาตรฐานผู้ผลิต',
  );
  const [notes, setNotes] = useState(
    initialData?.notes || 'ราคานี้รวมภาษีมูลค่าเพิ่ม 7% เรียบร้อยแล้ว',
  );

  const [items, setItems] = useState<QuotationItem[]>(
    initialData?.items && initialData.items.length > 0
      ? initialData.items.map((i) => ({ ...i }))
      : [
          {
            itemType: 'PRODUCT',
            itemName: '',
            description: '',
            quantity: 1,
            unit: 'ชุด',
            unitCost: 0,
            unitPrice: 0,
            discountAmount: 0,
            lineTotal: 0,
            sortOrder: 1,
          },
        ],
  );

  // External options loaded for comboboxes
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProductCatalogId, setSelectedProductCatalogId] =
    useState<string>('');

  // Auto-calculate validUntil when issueDate or validDays change
  useEffect(() => {
    if (issueDate && validDays > 0) {
      try {
        const d = new Date(issueDate);
        d.setDate(d.getDate() + Number(validDays));
        setValidUntil(d.toISOString().split('T')[0]);
      } catch {
        // keep current validUntil
      }
    }
  }, [issueDate, validDays]);

  // Load Customers, Projects, Products
  useEffect(() => {
    async function fetchMasterData() {
      try {
        const [custRes, prjRes, prdRes] = await Promise.all([
          fetch('/api/customers?limit=100').then((r) => r.json()),
          fetch('/api/projects?limit=100').then((r) => r.json()),
          fetch('/api/products?limit=100').then((r) => r.json()),
        ]);

        if (custRes?.success && custRes?.data?.items) {
          setCustomers(custRes.data.items);
        }
        if (prjRes?.success && prjRes?.data?.items) {
          setProjects(prjRes.data.items);
        }
        if (prdRes?.success && prdRes?.data?.items) {
          setProducts(prdRes.data.items);
        }
      } catch {
        // Fallback gracefully
      }
    }
    fetchMasterData();
  }, []);

  // When customer is selected from dropdown
  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomerName(found.name);
      setCustomerAddress(found.address || '');
      setCustomerPhone(found.phone || '');
      setCustomerTaxId(found.taxId || '');
      setCustomerContact(found.contactName || '');
    }
  };

  // When project is selected from dropdown
  const handleProjectChange = (id: string) => {
    setProjectId(id);
    const found = projects.find((p) => p.id === id);
    if (found) {
      setProjectName(found.name);
      if (found.customerId && !customerId) {
        handleCustomerChange(found.customerId);
      }
    } else {
      setProjectName('');
    }
  };

  // Add Product from Catalog
  const handleAddProductFromCatalog = (productId: string) => {
    if (!productId) return;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newItem: QuotationItem = {
      productId: prod.id,
      itemType: 'PRODUCT',
      itemCode: prod.productCode,
      itemName: prod.name,
      description: '',
      quantity: 1,
      unit: prod.unit || 'ชิ้น',
      unitCost: Number(prod.costPrice) || 0,
      unitPrice: Number(prod.sellingPrice) || 0,
      discountAmount: 0,
      lineTotal: Number(prod.sellingPrice) || 0,
      sortOrder: items.length + 1,
    };

    // If first item was empty, replace it
    if (items.length === 1 && !items[0].itemName && !items[0].unitPrice) {
      setItems([newItem]);
    } else {
      setItems([...items, newItem]);
    }
    setSelectedProductCatalogId('');
  };

  // Add Custom Item Row
  const handleAddCustomRow = (type: QuotationItemType = 'PRODUCT') => {
    const newItem: QuotationItem = {
      itemType: type,
      itemName: '',
      description: '',
      quantity: 1,
      unit: type === 'SERVICE' || type === 'LABOR' ? 'งาน' : 'ชุด',
      unitCost: 0,
      unitPrice: 0,
      discountAmount: 0,
      lineTotal: 0,
      sortOrder: items.length + 1,
    };
    setItems([...items, newItem]);
  };

  // Update Item field
  const handleItemChange = (
    index: number,
    field: keyof QuotationItem,
    value: any,
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (
        field === 'quantity' ||
        field === 'unitPrice' ||
        field === 'discountAmount'
      ) {
        const qty = Math.max(
          0.01,
          Number(field === 'quantity' ? value : item.quantity) || 0,
        );
        const price = Math.max(
          0,
          Number(field === 'unitPrice' ? value : item.unitPrice) || 0,
        );
        const disc = Math.max(
          0,
          Number(field === 'discountAmount' ? value : item.discountAmount) || 0,
        );
        item.lineTotal = Math.max(0, Math.round((qty * price - disc) * 100) / 100);
      }

      updated[index] = item;
      return updated;
    });
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      return updated.length > 0
        ? updated
        : [
            {
              itemType: 'PRODUCT',
              itemName: '',
              description: '',
              quantity: 1,
              unit: 'ชุด',
              unitCost: 0,
              unitPrice: 0,
              discountAmount: 0,
              lineTotal: 0,
              sortOrder: 1,
            },
          ];
    });
  };

  // Calculations
  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalCost = 0;

    items.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const cost = Number(item.unitCost) || 0;
      const disc = Number(item.discountAmount) || 0;
      const total = Math.max(0, qty * price - disc);

      subtotal += total;
      totalCost += qty * cost;
    });

    subtotal = Math.round(subtotal * 100) / 100;
    totalCost = Math.round(totalCost * 100) / 100;

    let calcDiscount = 0;
    if (discountType === 'PERCENT') {
      calcDiscount = Math.round(((subtotal * (Number(discountRate) || 0)) / 100) * 100) / 100;
    } else {
      calcDiscount = Math.round(Math.min(subtotal, Math.max(0, Number(discountRate) || 0)) * 100) / 100;
    }

    const totalAfterDiscount = Math.max(0, Math.round((subtotal - calcDiscount) * 100) / 100);
    const effectiveVatRate = includeVat ? Math.max(0, Number(vatRate) || 0) : 0;
    const vatAmount = Math.round(((totalAfterDiscount * effectiveVatRate) / 100) * 100) / 100;
    const grandTotal = Math.round((totalAfterDiscount + vatAmount) * 100) / 100;

    const estimatedProfit = Math.round((totalAfterDiscount - totalCost) * 100) / 100;
    const marginPercent =
      totalAfterDiscount > 0
        ? Math.round(((estimatedProfit / totalAfterDiscount) * 100) * 100) / 100
        : 0;

    return {
      subtotal,
      discountAmount: calcDiscount,
      totalAfterDiscount,
      vatRate: effectiveVatRate,
      vatAmount,
      grandTotal,
      totalCost,
      estimatedProfit,
      marginPercent,
    };
  }, [items, discountType, discountRate, includeVat, vatRate]);

  // Handle Submit Form
  const handleSubmit = (isSubmit: boolean) => {
    if (!customerId) {
      alert('กรุณาเลือกลูกค้าหรือผู้สั่งซื้อ');
      return;
    }

    const validItems = items.filter((i) => i.itemName.trim() !== '');
    if (validItems.length === 0) {
      alert('กรุณาเพิ่มรายการสินค้าหรือบริการอย่างน้อย 1 รายการ');
      return;
    }

    const payload = {
      quotationNumber: isEditing ? quotationNumber.trim() : undefined,
      customerId,
      customerName: customerName.trim(),
      customerAddress: customerAddress.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      customerTaxId: customerTaxId.trim() || undefined,
      customerContact: customerContact.trim() || undefined,
      projectId: projectId || undefined,
      projectName: projectName.trim() || undefined,
      issueDate,
      validDays: Number(validDays) || 30,
      validUntil,
      status: isSubmit ? 'PENDING_APPROVAL' : initialData?.status || 'DRAFT',
      discountType,
      discountRate: Number(discountRate) || 0,
      vatRate: calculations.vatRate,
      paymentTerms: paymentTerms.trim() || undefined,
      deliveryTerms: deliveryTerms.trim() || undefined,
      warrantyTerms: warrantyTerms.trim() || undefined,
      notes: notes.trim() || undefined,
      items: validItems.map((item, idx) => ({
        productId: item.productId || undefined,
        itemType: item.itemType,
        itemCode: item.itemCode || undefined,
        itemName: item.itemName.trim(),
        description: item.description?.trim() || undefined,
        quantity: Number(item.quantity) || 1,
        unit: item.unit.trim() || 'ชิ้น',
        unitCost: Number(item.unitCost) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        discountAmount: Number(item.discountAmount) || 0,
        sortOrder: idx + 1,
      })),
    };

    onSave(payload, isSubmit);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Sticky Header */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm sticky top-0 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="h-9 px-3 text-xs text-foreground border-border hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            กลับหน้ารายการ
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-foreground">
                {isEditing
                  ? `แก้ไขใบเสนอราคา: ${initialData?.quotationNumber}`
                  : 'สร้างใบเสนอราคาใหม่'}
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-muted text-muted-foreground border-border px-2 py-0.5"
              >
                {isEditing ? initialData?.status : 'แบบร่าง (Draft)'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              กำหนดข้อมูลลูกค้า รายการวัสดุ ถอดแบบราคา และเงื่อนไขสัญญา
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="h-9 text-xs border-border text-foreground hover:bg-muted font-medium px-3.5"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            บันทึกแบบร่าง
          </Button>

          <Button
            size="sm"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 shadow-sm"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            บันทึกและส่งขออนุมัติ
          </Button>
        </div>
      </div>

      {/* 1. ข้อมูลเอกสารและลูกค้า (Full Width) */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              1. ข้อมูลเอกสารและลูกค้า
            </h2>
            <p className="text-xs text-muted-foreground">
              ข้อมูลเอกสาร วันที่ และข้อมูลสำหรับติดต่อออกใบเสนอราคา
            </p>
          </div>
        </div>

        {/* Row 1: Document Meta Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
              <span>เลขที่เอกสาร</span>
              <span className="text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded">
                {isEditing ? 'เอกสารเดิม' : 'ระบบสร้างอัตโนมัติ (Auto)'}
              </span>
            </label>
            <Input
              value={
                isEditing
                  ? quotationNumber
                  : (quotationNumber || 'ระบบสร้างให้อัตโนมัติเมื่อบันทึก (Auto)')
              }
              readOnly
              disabled
              className="h-9 text-xs bg-muted/60 text-muted-foreground cursor-not-allowed font-medium select-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              วันที่ออกเอกสาร *
            </label>
            <Input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              กำหนดยืนราคา (วัน)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={365}
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value) || 30)}
                className="h-9 text-xs w-24"
              />
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                ถึง: {validUntil || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Customer & Project Select */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              เลือกลูกค้าในระบบ *
            </label>
            <select
              value={customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">-- เลือกลูกค้า / บริษัท --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.customerCode}] {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              โครงการ (ถ้ามี)
            </label>
            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">-- โครงการทั่วไป / ไม่ระบุ --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.projectCode}] {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Customer Details Snapshot Box (Spacious structured layout) */}
        <div className="bg-muted/30 rounded-xl p-4 sm:p-5 border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              ข้อมูลสำหรับออกใบเสนอราคา (ตรวจสอบและปรับแต่งได้)
            </span>
            <span className="text-xs text-muted-foreground">
              ดึงข้อมูลจากระบบลูกค้าอัตโนมัติ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                ชื่อลูกค้า / นิติบุคคลผู้สั่งซื้อ *
              </label>
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ชื่อลูกค้าหรือบริษัท"
                className="h-9 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                เลขประจำตัวผู้เสียภาษี
              </label>
              <Input
                type="text"
                value={customerTaxId}
                onChange={(e) => setCustomerTaxId(e.target.value)}
                placeholder="เลขประจำตัวผู้เสียภาษี 13 หลัก"
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                ชื่อผู้ติดต่อประสานงาน
              </label>
              <Input
                type="text"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                placeholder="ชื่อผู้ติดต่อ"
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <Input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="เบอร์โทรติดต่อ"
                className="h-9 text-xs"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                ชื่อโครงการที่เกี่ยวข้อง
              </label>
              <Input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="ชื่อโครงการ (ถ้ามี)"
                className="h-9 text-xs"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                ที่อยู่ออกใบเสนอราคา / ส่งของ
              </label>
              <Input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="ที่อยู่สำหรับออกใบเสนอราคา"
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. รายการสินค้า วัสดุ และบริการ (Full Width - Spacious Table) */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                2. รายการสินค้า วัสดุ และบริการ ({items.length} รายการ)
              </h2>
              <p className="text-xs text-muted-foreground">
                เลือกสินค้าจากคลัง หรือกำหนดรายการ ค่าบริการติดตั้ง และค่าแรงช่าง
              </p>
            </div>
          </div>

          {/* Quick Add from Catalog and Custom Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedProductCatalogId}
              onChange={(e) => handleAddProductFromCatalog(e.target.value)}
              className="h-9 px-3 text-xs rounded-md bg-muted border border-border text-foreground max-w-[260px] focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">+ เลือกจากคลังสินค้า/วัสดุ...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.productCode}] {p.name} ({formatCurrency(p.sellingPrice)})
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddCustomRow('PRODUCT')}
              className="h-9 text-xs border-border text-foreground hover:bg-muted font-medium px-3"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              เพิ่มแถวใหม่
            </Button>
          </div>
        </div>

        {/* Line Items Table (No description input column - streamlined single-row design) */}
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3 w-32">ประเภท</th>
                <th className="p-3 min-w-[240px]">รายการสินค้าและบริการ *</th>
                <th className="p-3 w-24 text-center">จำนวน</th>
                <th className="p-3 w-24 text-center">หน่วย</th>
                <th className="p-3 w-32 text-right">ราคา/หน่วย (บาท)</th>
                <th className="p-3 w-28 text-right">ส่วนลด (บาท)</th>
                <th className="p-3 w-36 text-right">รวมเงิน (บาท)</th>
                <th className="p-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="p-2.5 text-center text-muted-foreground font-medium">
                    {index + 1}
                  </td>

                  {/* Item Type */}
                  <td className="p-2.5">
                    <select
                      value={item.itemType}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'itemType',
                          e.target.value as QuotationItemType,
                        )
                      }
                      className="w-full h-9 px-2 text-xs rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="PRODUCT">สินค้า/วัสดุ</option>
                      <option value="SERVICE">บริการติดตั้ง</option>
                      <option value="CUSTOM">สั่งทำพิเศษ</option>
                      <option value="LABOR">ค่าแรงช่าง</option>
                    </select>
                  </td>

                  {/* Item Name (Single clean input, description removed) */}
                  <td className="p-2.5">
                    <Input
                      value={item.itemName}
                      onChange={(e) =>
                        handleItemChange(index, 'itemName', e.target.value)
                      }
                      placeholder="ชื่อสินค้า วัสดุ หรือบริการ *"
                      className="h-9 text-xs font-medium"
                    />
                  </td>

                  {/* Quantity */}
                  <td className="p-2.5 text-center">
                    <Input
                      type="number"
                      min={0.01}
                      step={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'quantity',
                          Number(e.target.value),
                        )
                      }
                      className="h-9 text-xs text-center"
                    />
                  </td>

                  {/* Unit */}
                  <td className="p-2.5 text-center">
                    <Input
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(index, 'unit', e.target.value)
                      }
                      placeholder="หน่วย"
                      className="h-9 text-xs text-center"
                    />
                  </td>

                  {/* Unit Price */}
                  <td className="p-2.5 text-right">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'unitPrice',
                          Number(e.target.value),
                        )
                      }
                      className="h-9 text-xs text-right"
                    />
                  </td>

                  {/* Discount Amount */}
                  <td className="p-2.5 text-right">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={item.discountAmount}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'discountAmount',
                          Number(e.target.value),
                        )
                      }
                      className="h-9 text-xs text-right text-rose-600"
                    />
                  </td>

                  {/* Line Total */}
                  <td className="p-2.5 text-right font-bold text-foreground">
                    {formatCurrency(item.lineTotal)}
                  </td>

                  {/* Delete Action */}
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      title="ลบรายการนี้"
                      aria-label="ลบรายการนี้"
                      className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10 inline-flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Line Item Addition buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-muted-foreground font-medium">เพิ่มรายการเร็ว:</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleAddCustomRow('SERVICE')}
            className="h-8 px-2.5 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 font-medium"
          >
            + ค่าบริการติดตั้ง
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleAddCustomRow('LABOR')}
            className="h-8 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-medium"
          >
            + ค่าแรงช่าง
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleAddCustomRow('CUSTOM')}
            className="h-8 px-2.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-medium"
          >
            + สั่งทำพิเศษ
          </Button>
        </div>
      </div>

      {/* Bottom Section: 3. เงื่อนไขทางการค้า & Card สรุปยอดรวมและภาษี */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3. เงื่อนไขทางการค้าและการรับประกัน (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                3. เงื่อนไขทางการค้าและการรับประกัน
              </h2>
              <p className="text-xs text-muted-foreground">
                กำหนดเงื่อนไขการชำระเงิน ระยะเวลาส่งมอบ และการรับประกันผลงาน
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-foreground">
                  เงื่อนไขการชำระเงิน
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentTerms(
                        'มัดจำ 50% เมื่องวดแรก, 50% เมื่องานติดตั้งแล้วเสร็จ',
                      )
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    50/50
                  </button>
                  <span className="text-muted-foreground/40">|</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentTerms(
                        'งวด 1 มัดจำ 40%, งวด 2 ส่งมอบโครงสร้าง 40%, งวด 3 ติดตั้งแล้วเสร็จ 20%',
                      )
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    40/40/20
                  </button>
                  <span className="text-muted-foreground/40">|</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentTerms('เครดิต 30 วันหลังวางบิลและตรวจรับงาน')
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    เครดิต 30 วัน
                  </button>
                </div>
              </div>
              <Input
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-foreground">
                  กำหนดการส่งมอบและติดตั้ง
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDeliveryTerms(
                        'จัดส่งและติดตั้งภายใน 14-21 วันทำการหลังได้รับเงินมัดจำ',
                      )
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    14-21 วัน
                  </button>
                  <span className="text-muted-foreground/40">|</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDeliveryTerms(
                        'จัดส่งภายใน 7-10 วันทำการหลังยืนยันแบบและขนาด',
                      )
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    7-10 วัน
                  </button>
                </div>
              </div>
              <Input
                value={deliveryTerms}
                onChange={(e) => setDeliveryTerms(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-foreground">
                  เงื่อนไขการรับประกัน
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setWarrantyTerms(
                        'รับประกันผลงานติดตั้ง 1 ปี รับประกันคุณภาพอุปกรณ์และกระจกตามมาตรฐานผู้ผลิต',
                      )
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    มาตรฐาน 1 ปี
                  </button>
                </div>
              </div>
              <Input
                value={warrantyTerms}
                onChange={(e) => setWarrantyTerms(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1.5">
                หมายเหตุเพิ่มเติม
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ระบุข้อตกลงหรือหมายเหตุเพิ่มเติม..."
                className="w-full p-3 text-xs rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right: Card สรุปยอดรวมและภาษี (lg:col-span-5 - Relocated to Bottom) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  สรุปยอดรวมและภาษี
                </h3>
                <p className="text-xs text-muted-foreground">คำนวณราคาและส่วนลด</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-medium">บาท (THB)</span>
          </div>

          {/* Financial breakdown */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">ยอดรวมสินค้า/บริการ</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(calculations.subtotal)}
              </span>
            </div>

            {/* Discount controls */}
            <div className="p-3 bg-muted/40 rounded-xl space-y-2 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-semibold">
                  ส่วนลดรวม
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDiscountType('AMOUNT')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      discountType === 'AMOUNT'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    บาท (฿)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('PERCENT')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      discountType === 'PERCENT'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={discountRate}
                  onChange={(e) =>
                    setDiscountRate(Number(e.target.value) || 0)
                  }
                  className="h-9 text-xs text-right text-rose-600 font-medium"
                  placeholder="0"
                />
                <span className="text-xs text-rose-500 font-semibold whitespace-nowrap">
                  - {formatCurrency(calculations.discountAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-2.5">
              <span className="text-muted-foreground">ยอดหลังหักส่วนลด</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(calculations.totalAfterDiscount)}
              </span>
            </div>

            {/* VAT Settings */}
            <div className="flex items-center justify-between border-t border-border pt-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeVat}
                  onChange={(e) => setIncludeVat(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <span className="text-foreground font-medium">
                  ภาษีมูลค่าเพิ่ม (VAT 7%)
                </span>
              </label>
              <span className="font-semibold text-foreground">
                {formatCurrency(calculations.vatAmount)}
              </span>
            </div>

            {/* Grand Total Big Display */}
            <div className="p-4 sm:p-5 bg-muted/50 rounded-xl border border-border space-y-1.5 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  ยอดสุทธิรวมภาษีทั้งสิ้น
                </span>
                <span className="text-xs font-medium text-primary">
                  Grand Total
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                {formatCurrency(calculations.grandTotal)}
              </div>
              <div className="text-xs text-muted-foreground italic pt-1">
                ({bahttext(calculations.grandTotal)})
              </div>
            </div>

            {/* Internal Estimator / Profit Margin indicator */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>ประมาณการต้นทุนรวม:</span>
                <span className="font-medium">{formatCurrency(calculations.totalCost)}</span>
              </div>
              <div className="flex items-center justify-between text-foreground font-semibold">
                <span>กำไรขั้นต้นโดยประมาณ:</span>
                <span
                  className={
                    calculations.estimatedProfit >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }
                >
                  {formatCurrency(calculations.estimatedProfit)} (
                  {calculations.marginPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-2 border-t border-border">
            <Button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold shadow-sm"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              บันทึกและส่งขออนุมัติ
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="w-full text-xs h-9 border-border text-foreground hover:bg-muted font-medium"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              บันทึกแบบร่าง (Draft)
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="w-full text-xs h-9 text-muted-foreground hover:text-foreground"
            >
              ยกเลิก / ย้อนกลับ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
