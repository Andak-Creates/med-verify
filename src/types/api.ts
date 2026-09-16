// Shared API types for MedVerify

// ── Envelope ────────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  error: string;
  message: string;
}

// ── Auth / User ─────────────────────────────────────────────────────────────

export type UserRole = 'USER';

export interface MedVerifyUser {
  id: string;
  email: string;
  fullName: string | null;
  username: string;
  role: UserRole;
  authProvider: 'email' | 'google';
  emailVerified: boolean;
  phoneNumber: string | null;
  profileImage: string | null;
  bloodGroup: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  isPro: boolean;
  proExpiresAt: string | null;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: MedVerifyUser;
}

export interface SavedCard {
  authorizationCode: string;
  last4: string;
  cardType: string | null;
  expMonth: string | null;
  expYear: string | null;
  bank: string | null;
  reusable: boolean;
  isSubscriptionCard: boolean;
}

export interface SessionPaymentInit {
  authorizationUrl: string;
  reference: string;
  amount: number;
}

export interface UserProfileUpdates {
  fullName?: string;
  username?: string;
  profileImage?: string | null;
  bloodGroup?: string | null;
  allergies?: string | null;
  chronicConditions?: string | null;
}

export interface UploadableFile {
  uri: string;
  name: string;
  type: string;
}

// ── Drug Verification & Identification ──────────────────────────────────────

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

// ── Drug Reporting ──────────────────────────────────────────────────────────

export interface DrugReportInput {
  drugName: string;
  batchNumber: string;
  nafdacNumber?: string;
  pharmacyName: string;
  pharmacyAddress?: string;
  reason: string;
  comments?: string;
  receiptImage?: UploadableFile | string;
}

export interface DrugReportResponse {
  reportId: string;
  referenceCode: string;
  status: 'RECEIVED' | 'UNDER_REVIEW' | 'RESOLVED';
  createdAt: string;
}
