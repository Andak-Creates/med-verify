import { useCallback, useState } from 'react';
import { getApiErrorMessage } from '@/api/client';
import * as drugsService from '@/services/drugs.service';
import type { DrugVerificationResult, ScanHistoryItem, ScanHistoryStats } from '@/types/api';
import { usePaginatedList } from './usePaginatedList';

/** NAFDAC lookup with loading/error state. */
export function useDrugVerification() {
  const [result, setResult] = useState<DrugVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async (nafdacNumber: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const verification = await drugsService.verifyDrug(nafdacNumber);
      setResult(verification);
      return verification;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Could not verify this NAFDAC number.');
      setError(message);
      throw new Error(message);
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { result, isVerifying, error, verify };
}

/** Paginated scan history with summary stats. */
export function useScanHistory(pageSize = 20) {
  const [stats, setStats] = useState<ScanHistoryStats | null>(null);

  const fetchPage = useCallback(
    async (offset: number, limit: number) => {
      const { items, stats: fetchedStats } = await drugsService.getScanHistory({ limit, offset });
      if (offset === 0) setStats(fetchedStats);
      return { items };
    },
    [],
  );

  const list = usePaginatedList<ScanHistoryItem>(fetchPage, pageSize);

  return { ...list, stats };
}
