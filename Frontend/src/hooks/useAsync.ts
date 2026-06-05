/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState, type DependencyList } from 'react';

export function useAsync<T>(factory: () => Promise<T>, deps: DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await factory();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    void run();
  }, [run]);

  return { data, error, loading, refetch: run, setData };
}
