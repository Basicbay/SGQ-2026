import 'server-only';
import { DEFAULT_SETTINGS, type SystemSettingsData } from './settings-types';

export { DEFAULT_SETTINGS, type SystemSettingsData };

export async function getSystemSettings(): Promise<SystemSettingsData> {
  const apiUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/settings/system`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const json = await res.json();
      const data = json?.data || json;
      if (data && typeof data === 'object' && 'siteName' in data) {
        return {
          siteName: data.siteName ?? '',
          siteDescription: data.siteDescription ?? '',
          iconUrl: data.iconUrl ?? null,
          companyName: data.companyName ?? '',
          taxId: data.taxId ?? '',
          address: data.address ?? '',
          website: data.website ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          updatedAt: data.updatedAt,
        };
      }
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err && (err as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
  }

  return DEFAULT_SETTINGS;
}

export async function saveSystemSettings(
  updated: Partial<SystemSettingsData>,
  token?: string
): Promise<SystemSettingsData> {
  const current = await getSystemSettings();
  const merged: SystemSettingsData = {
    ...current,
    ...updated,
    updatedAt: new Date().toISOString(),
  };

  const apiUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';
  const internalSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET;

  const headers: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
  };
  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }
  if (internalSecret) {
    headers['x-internal-secret'] = internalSecret;
  }

  const payload = {
    siteName: merged.siteName,
    siteDescription: merged.siteDescription,
    iconUrl: merged.iconUrl,
    companyName: merged.companyName,
    taxId: merged.taxId,
    address: merged.address,
    website: merged.website,
    email: merged.email,
    phone: merged.phone,
  };

  const res = await fetch(`${apiUrl}/settings/system`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`บันทึกลงฐานข้อมูลไม่สำเร็จ (HTTP ${res.status}): ${errorText}`);
  }

  const json = await res.json();
  const saved = json?.data || json;
  if (saved && saved.updatedAt) {
    merged.updatedAt = saved.updatedAt;
  }

  return merged;
}
