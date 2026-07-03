import { api } from '@/api/client';
import type {
  BookConsultationInput,
  BookingConfirmation,
  ChatMessage,
  Consultation,
  ConsultationFilter,
  ConsultationStatus,
} from '@/types/api';

export async function bookConsultation(
  input: BookConsultationInput,
): Promise<BookingConfirmation> {
  const { data } = await api.post('/consultations', input);
  return data.data;
}

export async function listConsultations(
  options: { filter?: ConsultationFilter; limit?: number; offset?: number } = {},
): Promise<{ items: Consultation[]; total: number }> {
  const { data } = await api.get('/consultations', { params: options });
  return data.data;
}

export async function getConsultation(id: string): Promise<Consultation> {
  const { data } = await api.get(`/consultations/${id}`);
  return data.data;
}

export async function getMessages(id: string): Promise<ChatMessage[]> {
  const { data } = await api.get(`/consultations/${id}/messages`);
  return data.data;
}

export async function submitReview(
  id: string,
  rating: number,
  comment?: string,
): Promise<{ id: string; rating: number; comment: string | null; createdAt: string }> {
  const { data } = await api.post(`/consultations/${id}/review`, { rating, comment });
  return data.data;
}

export async function endSession(
  id: string,
): Promise<{ id: string; status: ConsultationStatus; endedAt: string }> {
  const { data } = await api.patch(`/consultations/${id}/end`);
  return data.data;
}
