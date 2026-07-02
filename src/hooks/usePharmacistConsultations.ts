import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/api/client';
import { useSocket } from '@/context/SocketContext';
import * as pharmacistService from '@/services/pharmacist.service';
import type {
  ConsultationFilter,
  NewConsultationEvent,
  PharmacistConsultation,
  PharmacistDashboardStats,
} from '@/types/api';

/** Pharmacist dashboard stats, refreshed live when new bookings arrive. */
export function usePharmacistDashboard() {
  const { socket } = useSocket();
  const [stats, setStats] = useState<PharmacistDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      setStats(await pharmacistService.getDashboard());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load your dashboard.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load('initial');
  }, [load]);

  useEffect(() => {
    if (!socket) return;
    const onNewConsultation = (_event: NewConsultationEvent) => {
      // Re-fetch instead of merging locally so counts and ordering stay correct.
      load('refresh');
    };
    socket.on('new_consultation', onNewConsultation);
    return () => {
      socket.off('new_consultation', onNewConsultation);
    };
  }, [socket, load]);

  const refresh = useCallback(() => load('refresh'), [load]);

  return { stats, isLoading, isRefreshing, error, refresh };
}

/** Pharmacist bookings list with optimistic accept/decline. */
export function usePharmacistConsultations(filter?: ConsultationFilter) {
  const { socket } = useSocket();
  const [items, setItems] = useState<PharmacistConsultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);
      try {
        const { items: fetched } = await pharmacistService.listConsultations({ filter });
        setItems(fetched);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not load consultations.'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    load('initial');
  }, [load]);

  useEffect(() => {
    if (!socket) return;
    const onNewConsultation = () => load('refresh');
    socket.on('new_consultation', onNewConsultation);
    return () => {
      socket.off('new_consultation', onNewConsultation);
    };
  }, [socket, load]);

  const act = useCallback(
    async (id: string, action: 'accept' | 'decline'): Promise<PharmacistConsultation> => {
      const previous = items;
      const optimisticStatus = action === 'accept' ? 'CONFIRMED' : 'DECLINED';
      setActingId(id);
      // Optimistic update — revert if the request fails.
      setItems((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: optimisticStatus } : c)),
      );
      try {
        const updated =
          action === 'accept'
            ? await pharmacistService.acceptConsultation(id)
            : await pharmacistService.declineConsultation(id);
        setItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
        return updated;
      } catch (err) {
        setItems(previous);
        throw err;
      } finally {
        setActingId(null);
      }
    },
    [items],
  );

  const accept = useCallback((id: string) => act(id, 'accept'), [act]);
  const decline = useCallback((id: string) => act(id, 'decline'), [act]);
  const refresh = useCallback(() => load('refresh'), [load]);

  return { items, isLoading, isRefreshing, error, refresh, accept, decline, actingId };
}
