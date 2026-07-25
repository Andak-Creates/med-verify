import { api } from '@/api/client';
import type {
  Bank,
  BankAccount,
  Wallet,
  WalletTransaction,
  Withdrawal,
} from '@/types/api';

/** GET /wallet — pharmacist balance + lifetime totals (all kobo). */
export async function getWallet(): Promise<Wallet> {
  const { data } = await api.get('/wallet');
  return data.data;
}

/** GET /wallet/transactions — the earnings/payout ledger, newest first. */
export async function getTransactions(
  options: { limit?: number; offset?: number } = {},
): Promise<{ items: WalletTransaction[]; total: number }> {
  const { data } = await api.get('/wallet/transactions', { params: options });
  return data.data;
}

/** GET /wallet/banks — bank list for the payout picker. */
export async function getBanks(): Promise<Bank[]> {
  const { data } = await api.get('/wallet/banks');
  return data.data.items;
}

/** GET /wallet/bank — the saved payout account, or null if none set yet. */
export async function getBankAccount(): Promise<BankAccount | null> {
  const { data } = await api.get('/wallet/bank');
  return data.data;
}

/** POST /wallet/bank — verify + save the payout account (creates a recipient). */
export async function saveBankAccount(input: {
  bankCode: string;
  accountNumber: string;
}): Promise<BankAccount> {
  const { data } = await api.post('/wallet/bank', input);
  return data.data;
}

/** POST /wallet/withdrawals — request a payout of `amountKobo` to the saved bank. */
export async function createWithdrawal(amountKobo: number): Promise<Withdrawal> {
  const { data } = await api.post('/wallet/withdrawals', { amountKobo });
  return data.data;
}

/** GET /wallet/withdrawals — payout history, newest first. */
export async function getWithdrawals(
  options: { limit?: number; offset?: number } = {},
): Promise<{ items: Withdrawal[]; total: number }> {
  const { data } = await api.get('/wallet/withdrawals', { params: options });
  return data.data;
}
