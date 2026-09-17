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
    const data = await SecureStore.getItemAsync(REPORTS_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as SavedReport[];
  } catch {
    return [];
  }
}

export async function saveReportLocally(report: SavedReport): Promise<void> {
  try {
    const existing = await getLocalReports();
    // Prepend new report to top of list
    const updated = [report, ...existing.filter((r) => r.referenceCode !== report.referenceCode)];
    await SecureStore.setItemAsync(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[ReportStorage] Could not save report locally:', err);
  }
}

export async function deleteLocalReport(referenceCode: string): Promise<void> {
  try {
    const existing = await getLocalReports();
    const updated = existing.filter((r) => r.referenceCode !== referenceCode);
    await SecureStore.setItemAsync(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[ReportStorage] Could not delete report:', err);
  }
}
