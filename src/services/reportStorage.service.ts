import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface SavedReport {
  id: string;
  referenceCode: string;
  drugName: string;
  batchNumber: string;
  nafdacNumber?: string;
  pharmacyName: string;
  pharmacyAddress?: string;
  reason: string;
  comments?: string;
  receiptImage?: string;
  status: 'RECEIVED' | 'UNDER_REVIEW' | 'RESOLVED';
  createdAt: string;
}

const REPORTS_STORAGE_KEY = 'medverify_saved_reports_v1';

export async function getLocalReports(): Promise<SavedReport[]> {
  try {
    // 1. Try AsyncStorage first
    const data = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as SavedReport[];
    }
    // 2. Fallback check SecureStore for older entries
    const secureData = await SecureStore.getItemAsync(REPORTS_STORAGE_KEY);
    if (secureData) {
      const parsed = JSON.parse(secureData) as SavedReport[];
      // Migrate to AsyncStorage
      await AsyncStorage.setItem(REPORTS_STORAGE_KEY, secureData);
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('[ReportStorage] Could not load local reports:', err);
    return [];
  }
}

export async function saveReportLocally(report: SavedReport): Promise<void> {
  try {
    const existing = await getLocalReports();
    // Prepend new report to top of list
    const updated = [report, ...existing.filter((r) => r.referenceCode !== report.referenceCode)];
    await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[ReportStorage] Could not save report locally:', err);
  }
}

export async function deleteLocalReport(referenceCode: string): Promise<void> {
  try {
    const existing = await getLocalReports();
    const updated = existing.filter((r) => r.referenceCode !== referenceCode);
    await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[ReportStorage] Could not delete report:', err);
  }
}
