import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/api/client';
import * as walletService from '@/services/wallet.service';
import type { Wallet, WalletTransaction, Withdrawal } from '@/types/api';

/** Pharmacist wallet balance + recent ledger, with pull-to-refresh. */
export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const [w, txns] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions({ limit: 50 }),
      ]);
      setWallet(w);
      setTransactions(txns.items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load your wallet.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load('initial');
  }, [load]);

  const refresh = useCallback(() => load('refresh'), [load]);

  return { wallet, transactions, isLoading, isRefreshing, error, refresh };
}

/** Payout history. */
export function useWithdrawals() {
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { items: fetched } = await walletService.getWithdrawals({ limit: 50 });
      setItems(fetched);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load your withdrawals.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, isLoading, error, reload: load };
}
