import { api } from '@/api/client';
import type { AvailableSlots, PharmacistListQuery, PublicPharmacist } from '@/types/api';

export async function listPharmacists(
  query: PharmacistListQuery = {},
): Promise<{ items: PublicPharmacist[]; total: number }> {
  const params: Record<string, string | number> = {};
  if (query.search?.trim()) params.search = query.search.trim();
  if (query.available) params.available = 'true';
  if (query.lat != null && query.lng != null) {
    params.lat = query.lat;
    params.lng = query.lng;
  }
  if (query.limit != null) params.limit = query.limit;
  if (query.offset != null) params.offset = query.offset;

  const { data } = await api.get('/pharmacists', { params });
  return data.data;
}

export async function getPharmacist(
  id: string,
  coords?: { lat: number; lng: number },
): Promise<PublicPharmacist> {
  const { data } = await api.get(`/pharmacists/${id}`, { params: coords });
  return data.data;
}

export async function getAvailableSlots(id: string, date: string): Promise<AvailableSlots> {
  const { data } = await api.get(`/pharmacists/${id}/available-slots`, { params: { date } });
  return data.data;
}
