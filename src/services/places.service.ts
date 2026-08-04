import { api } from '@/api/client';
import type { NearbyPharmacy, PharmacyDetail } from '@/types/api';

export async function getNearbyPharmacies(
  lat: number,
  lng: number,
  radius = 5000,
  keyword = '',
): Promise<NearbyPharmacy[]> {
  const params: Record<string, string | number> = { lat, lng, radius };
  if (keyword.trim()) params.keyword = keyword.trim();
  const { data } = await api.get('/pharmacies/nearby', { params });
  return data.data.items;
}

export async function getPharmacyDetail(placeId: string): Promise<PharmacyDetail> {
  const { data } = await api.get(`/pharmacies/${encodeURIComponent(placeId)}`);
  return data.data;
}
