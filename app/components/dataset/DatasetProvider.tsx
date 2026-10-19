'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useDatasetWorkspace } from '../../hooks/useDatasetWorkspace';

type DatasetContextValue = ReturnType<typeof useDatasetWorkspace>;

const DatasetContext = createContext<DatasetContextValue | null>(null);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const workspace = useDatasetWorkspace();
  return (
    <DatasetContext.Provider value={workspace}>{children}</DatasetContext.Provider>
  );
}

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error('useDataset must be used inside <DatasetProvider>');
  return ctx;
}