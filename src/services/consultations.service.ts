import { Platform } from 'react-native';
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

export async function uploadMessageFile(
  consultationId: string,
  file: { uri: string; name: string; type: string },
): Promise<string> {
  const formData = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();
    formData.append('file', blob, file.name);
  } else {
    formData.append('file', file as unknown as Blob);
  }
  const { data } = await api.post(`/consultations/${consultationId}/messages/file`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.fileUrl;
}
