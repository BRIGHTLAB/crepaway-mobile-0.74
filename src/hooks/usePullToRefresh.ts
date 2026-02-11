import { useCallback, useState } from 'react';

type RefetchableQuery = {
  refetch: () => Promise<unknown> | unknown;
  isFetching?: boolean;
  isLoading?: boolean;
};

export const usePullToRefresh = ({
  refetch,
  isFetching,
  isLoading,
}: RefetchableQuery) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return {
    refreshing: refreshing ,
    onRefresh,
  };
};

