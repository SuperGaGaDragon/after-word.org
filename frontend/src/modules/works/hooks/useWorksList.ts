import { useCallback, useEffect, useState } from 'react';
import { createWork, deleteWork, listWorks } from '../api/workApi';
import { WorkSummary } from '../types/workContract';

type UseWorksListState = {
  items: WorkSummary[];
  loading: boolean;
  error: string | null;
};

export function useWorksList() {
  const [state, setState] = useState<UseWorksListState>({
    items: [],
    loading: true,
    error: null
  });

  const reload = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const items = await listWorks();
      setState({ items, loading: false, error: null });
    } catch (error) {
      setState({
        items: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load works'
      });
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const runCreate = useCallback(async () => {
    const workId = await createWork();
    await reload();
    return workId;
  }, [reload]);

  const runDelete = useCallback(
    async (workId: string) => {
      await deleteWork(workId);
      await reload();
    },
    [reload]
  );

  return {
    state,
    reload,
    runCreate,
    runDelete
  };
}
