import { useCallback, useEffect, useRef, useState } from 'react';
import { openViews, type ViewRepository } from './views';
import type { SavedView } from '../domain/views';

export function useViews() {
  const repository = useRef<ViewRepository | null>(null),
    channel = useRef<BroadcastChannel | null>(null);
  const [views, setViews] = useState<SavedView[]>([]),
    [error, setError] = useState<string | null>(null),
    [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      if (!repository.current) repository.current = await openViews();
      setViews(await repository.current.list());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Saved views could not be read.');
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    void openViews()
      .then(async (db) => {
        if (cancelled) {
          db.close();
          return;
        }
        repository.current = db;
        await refresh();
        if (!cancelled) setLoading(false);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Browser storage is unavailable.');
          setLoading(false);
        }
      });
    if ('BroadcastChannel' in window) {
      channel.current = new BroadcastChannel('rafarena-views');
      channel.current.onmessage = () => {
        void refresh();
      };
    }
    return () => {
      cancelled = true;
      repository.current?.close();
      repository.current = null;
      channel.current?.close();
    };
  }, [refresh]);
  const save = async (view: SavedView) => {
    if (!repository.current)
      throw new Error(
        'Browser storage is unavailable. Share the current perspective with a link instead.',
      );
    await repository.current.save(view);
    await refresh();
    channel.current?.postMessage('changed');
  };
  const remove = async (id: string) => {
    if (!repository.current) throw new Error('Browser storage is unavailable.');
    await repository.current.remove(id);
    await refresh();
    channel.current?.postMessage('changed');
  };
  return { views, error, loading, save, remove, refresh };
}
