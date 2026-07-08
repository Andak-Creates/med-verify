import { Platform } from 'react-native';
import { api } from '@/api/client';
import type { DrugVerificationResult, ScanHistoryItem, ScanHistoryStats } from '@/types/api';

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
