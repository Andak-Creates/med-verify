import { api } from './api';

export type VerificationResult = 'verified' | 'flagged' | 'not_found';

export interface DrugVerificationResult {
  nafdacNumber: string | null;
  found: boolean;
  verificationResult: VerificationResult;
  productName: string | null;
  manufacturer: string | null;
  strength: string | null;
  category: string | null;
  form: string | null;
  activeIngredients: string | null;
  registryStatus: string | null;
  approvalDate: string | null;
}

export interface ScanHistoryItem {
  id: string;
  nafdacNumber: string;
  drugName: string | null;
  manufacturer: string | null;
  category: string | null;
  strength: string | null;
  status: VerificationResult;
  scannedAt: string;
}

export interface ScanHistoryStats {
  totalScans: number;
  authenticityRate: number;
}

export async function verifyDrug(nafdacNumber: string): Promise<DrugVerificationResult> {
  const { data } = await api.post('/drugs/verify', { nafdacNumber });
  return data.data;
}

export async function getScanHistory(params: { limit?: number; offset?: number } = {}): Promise<{
  items: ScanHistoryItem[];
  stats: ScanHistoryStats;
}> {
  const { data } = await api.get('/drugs/history', { params });
  return data.data;
}
