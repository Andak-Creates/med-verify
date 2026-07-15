// Shared API types — field names mirror the backend's public mappers exactly
// (user.service.toPublicUser, pharmacist.service.toPublicProfile,
// pharmacists.service.toPublicPharmacist, consultation.service.toPublic*).

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

// ── Auth / users ────────────────────────────────────────────────────────────

export type UserRole = 'USER' | 'PHARMACIST';

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

// ── Pharmacist (self) ───────────────────────────────────────────────────────

export type PharmacistApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export interface WorkingHoursEntry {
  day: string; // 'Monday' … 'Sunday'
  enabled: boolean;
  startH: number;
  startM: number;
  endH: number;
  endM: number;
}

export interface PharmacistProfile {
  profileId: string;
  nin: string | null;
  pcn: string | null;
  pharmacyName: string | null;
  pharmacyAddress: string | null;
  specialty: string | null;
  bio: string | null;
  vacationMode: boolean;
  timezone: string;
  workingHours: WorkingHoursEntry[] | null;
  feeDrugInquiry: number;
  feeFullConsultation: number;
  language: string;
  certificateImage: string | null;
  status: PharmacistApplicationStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  profileCreatedAt: string;
}

/** GET /pharmacist/me merges the public user and the pharmacist profile. */
export type PharmacistMe = MedVerifyUser & PharmacistProfile;

export interface PharmacistStatusInfo {
  status: PharmacistApplicationStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface PharmacistProfileUpdates {
  fullName?: string;
  pharmacyName?: string;
  pharmacyAddress?: string;
  specialty?: string;
  bio?: string;
  vacationMode?: boolean;
  timezone?: string;
  workingHours?: WorkingHoursEntry[];
  language?: string;
}

// ── Public pharmacist browsing ──────────────────────────────────────────────

export interface PublicPharmacist {
  id: string; // pharmacist_profiles.id
  userId: string;
  fullName: string | null;
  profileImage: string | null;
  specialty: string | null;
  bio: string | null;
  pharmacyName: string | null;
  pharmacyAddress: string | null;
  isOnline: boolean;
  vacationMode: boolean;
  avgRating: number;
  reviewCount: number;
  totalConsultations: number;
  feeDrugInquiry: number;
  feeFullConsultation: number;
  workingHours: WorkingHoursEntry[] | null;
  language: string;
  distanceKm: number | null;
}

export interface PharmacistListQuery {
  search?: string;
  available?: boolean;
  lat?: number;
  lng?: number;
  limit?: number;
  offset?: number;
}

export interface AvailableSlots {
  isWorkingDay: boolean;
  dayName: string | null;
  date: string;
  slots: string[];
}

// ── Consultations ───────────────────────────────────────────────────────────

export type ConsultationType = 'chat' | 'audio' | 'both';
export type ConsultationUrgency = 'normal' | 'high';
export type ConsultationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'DECLINED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ConsultationFilter = 'upcoming' | 'past';

export interface BookConsultationInput {
  pharmacistProfileId: string;
  consultationDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. '09:00 AM'
  consultationType: ConsultationType;
  urgency?: ConsultationUrgency;
  reason: string;
}

/** POST /consultations response. */
export interface BookingConfirmation {
  id: string;
  referenceCode: string;
  consultationDate: string;
  timeSlot: string;
  consultationType: ConsultationType;
  urgency: ConsultationUrgency;
  feeAmount: number;
  status: ConsultationStatus;
  pharmacistName: string | null;
  pharmacistImage: string | null;
  createdAt: string;
}

/** User-side consultation (GET /consultations, GET /consultations/:id). */
export interface Consultation {
  id: string;
  referenceCode: string;
  consultationDate: string;
  timeSlot: string;
  consultationType: ConsultationType;
  urgency: ConsultationUrgency;
  reason: string;
  feeAmount: number;
  status: ConsultationStatus;
  createdAt: string;
  pharmacist: {
    profileId: string | null;
    specialty: string | null;
    pharmacyName: string | null;
    fullName: string | null;
    profileImage: string | null;
  };
}

/** Pharmacist-side consultation (GET /pharmacist/consultations). */
export interface PharmacistConsultation {
  id: string;
  referenceCode: string;
  consultationDate: string;
  timeSlot: string;
  consultationType: ConsultationType;
  urgency: ConsultationUrgency;
  reason: string;
  feeAmount: number;
  status: ConsultationStatus;
  createdAt: string;
  patient: {
    id: string | null;
    fullName: string | null;
    profileImage: string | null;
  };
  rating: number | null;
  ratingComment: string | null;
}

export interface PendingRequest {
  id: string;
  referenceCode: string;
  consultationDate: string;
  timeSlot: string;
  consultationType: ConsultationType;
  urgency: ConsultationUrgency;
  reason: string;
  feeAmount: number;
  createdAt: string;
  patient: {
    id: string | null;
    fullName: string | null;
    profileImage: string | null;
  };
}

export interface PharmacistDashboardStats {
  totalPending: number;
  urgentPending: number;
  recentRequests: PendingRequest[];
}

// ── Live sessions (Socket.io) ───────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: UserRole;
  message: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface IceServer {
  urls: string;
  username?: string;
  credential?: string;
}

export interface JoinSessionAck {
  ok?: true;
  error?: string;
  status?: ConsultationStatus;
  role?: UserRole;
  consultationType?: ConsultationType;
  iceServers?: IceServer[];
  /** Whether the other participant was already in the room when we joined. */
  counterpartOnline?: boolean;
}

export interface SocketAck {
  ok?: true;
  error?: string;
}

export interface NewConsultationEvent extends BookingConfirmation {
  patientId: string;
}

export interface ConsultationStatusEvent {
  id: string;
  referenceCode: string;
  status: ConsultationStatus;
}

export interface SessionStartedEvent {
  consultationId: string;
  startedAt: string;
}

export interface SessionEndedEvent {
  consultationId: string;
  status: 'COMPLETED';
  endedAt: string;
}

export interface ParticipantEvent {
  consultationId: string;
  userId: string;
  role?: UserRole;
}

export interface CallSignalPayload {
  consultationId: string;
  fromUserId?: string;
  sdp?: unknown;
  candidate?: unknown;
}

// ── Drugs ───────────────────────────────────────────────────────────────────

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
