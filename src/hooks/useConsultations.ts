import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/api/client';
import * as consultationsService from '@/services/consultations.service';
import { useSocket } from '@/context/SocketContext';
import type { Consultation, ConsultationFilter, ConsultationStatusEvent } from '@/types/api';

/** User-side bookings list, kept in sync with accept/decline socket events. */
export function useConsultations(filter?: ConsultationFilter) {
  const { socket } = useSocket();
  const [items, setItems] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);
      try {
        const { items: fetched } = await consultationsService.listConsultations({ filter });
        setItems(fetched);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not load your consultations.'));
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

  // Real-time status changes pushed by the pharmacist accepting/declining.
  useEffect(() => {
    if (!socket) return;
    const onStatusChange = (event: ConsultationStatusEvent) => {
      setItems((prev) =>
        prev.map((c) => (c.id === event.id ? { ...c, status: event.status } : c)),
      );
    };
    socket.on('consultation_accepted', onStatusChange);
    socket.on('consultation_declined', onStatusChange);
    return () => {
      socket.off('consultation_accepted', onStatusChange);
      socket.off('consultation_declined', onStatusChange);
    };
  }, [socket]);

  const refresh = useCallback(() => load('refresh'), [load]);

  return { items, isLoading, isRefreshing, error, refresh };
}

/** Single booking detail. */
export function useConsultation(id: string | undefined) {
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      setConsultation(await consultationsService.getConsultation(id));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load this consultation.'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { consultation, isLoading, error, reload: load };
}
