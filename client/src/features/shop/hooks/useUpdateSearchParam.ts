import { useSearchParams } from 'react-router-dom';

export const useUpdateSearchParam = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      next.set(key, value);
    });

    setSearchParams(next, { replace: true });
  };
};
