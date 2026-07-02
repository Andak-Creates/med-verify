import { api } from '@/api/client';
import type { DrugVerificationResult, ScanHistoryItem, ScanHistoryStats } from '@/types/api';

export async function verifyDrug(nafdacNumber: string): Promise<DrugVerificationResult> {
  const { data } = await api.post('/drugs/verify', { nafdacNumber });
  return data.data;
}

export async function getScanHistory(
  params: { limit?: number; offset?: number } = {},
): Promise<{ items: ScanHistoryItem[]; stats: ScanHistoryStats }> {
  const { data } = await api.get('/drugs/history', { params });
  return data.data;
}
