import { Platform } from 'react-native';
import { api } from '@/api/client';
import type { MedVerifyUser, UploadableFile, UserProfileUpdates } from '@/types/api';

export async function getProfile(): Promise<MedVerifyUser> {
  const { data } = await api.get('/users/me');
  return data.data.user;
}

export async function updateProfile(updates: UserProfileUpdates): Promise<MedVerifyUser> {
  const { data } = await api.patch('/users/me', updates);
  return data.data.user;
}

export async function updatePushToken(token: string): Promise<void> {
  await api.patch('/users/me/push-token', { token });
}

export async function uploadAvatar(file: UploadableFile): Promise<MedVerifyUser> {
  const formData = new FormData();
  if (Platform.OS === 'web') {
    // Browsers' FormData requires a real Blob/File — the {uri, name, type}
    // shape only works with React Native's native FormData polyfill.
    const blob = await (await fetch(file.uri)).blob();
    formData.append('avatar', blob, file.name);
  } else {
    formData.append('avatar', file as unknown as Blob);
  }
  const { data } = await api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.user;
}

export async function deleteAccount(password: string): Promise<void> {
  await api.delete('/users/me', { data: { password } });
}

