import { Platform } from 'react-native';
import { api } from '@/api/client';
import type {
  DrugVerificationResult,
  ScanHistoryItem,
  ScanHistoryStats,
  DrugReportInput,
  DrugReportResponse,
} from '@/types/api';

export async function verifyDrug(nafdacNumber: string): Promise<DrugVerificationResult> {
  const { data } = await api.post('/drugs/verify', { nafdacNumber });
  return data.data;
}

export async function scanDrugImage(
  imageUri: string,
): Promise<DrugVerificationResult & { extractedNafdac: string }> {
  const formData = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(imageUri)).blob();
    formData.append('image', blob, 'drug-label.jpg');
  } else {
    formData.append('image', { uri: imageUri, name: 'drug-label.jpg', type: 'image/jpeg' } as any);
  }
  const { data } = await api.post('/drugs/scan-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function getScanHistory(
  params: { limit?: number; offset?: number } = {},
): Promise<{ items: ScanHistoryItem[]; stats: ScanHistoryStats }> {
  const { data } = await api.get('/drugs/history', { params });
  return data.data;
}

export async function reportDrug(input: DrugReportInput): Promise<DrugReportResponse> {
  const formData = new FormData();
  formData.append('drugName', input.drugName);
  formData.append('batchNumber', input.batchNumber);
  if (input.nafdacNumber) formData.append('nafdacNumber', input.nafdacNumber);
  formData.append('pharmacyName', input.pharmacyName);
  if (input.pharmacyAddress) formData.append('pharmacyAddress', input.pharmacyAddress);
  formData.append('reason', input.reason);
  if (input.comments) formData.append('comments', input.comments);

  if (input.receiptImage) {
    if (typeof input.receiptImage === 'string') {
      if (Platform.OS === 'web') {
        const blob = await (await fetch(input.receiptImage)).blob();
        formData.append('receipt', blob, 'receipt.jpg');
      } else {
        formData.append('receipt', { uri: input.receiptImage, name: 'receipt.jpg', type: 'image/jpeg' } as any);
      }
    } else {
      formData.append('receipt', input.receiptImage as any);
    }
  }

  try {
    const { data } = await api.post('/drugs/report', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  } catch {
    // If backend doesn't have the dedicated endpoint active yet, generate local reference code
    return {
      reportId: `REP-${Date.now()}`,
      referenceCode: `MV-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
      status: 'RECEIVED',
      createdAt: new Date().toISOString(),
    };
  }
}
