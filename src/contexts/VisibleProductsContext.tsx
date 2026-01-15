import { createContext, useContext, useState, ReactNode } from 'react';

interface VisibleProductsContextType {
  visibleProductIds: number[];
  setVisibleProductIds: (ids: number[]) => void;
}

const VisibleProductsContext = createContext<VisibleProductsContextType | undefined>(
  undefined
);

export function VisibleProductsProvider({ children }: { children: ReactNode }) {
  const [visibleProductIds, setVisibleProductIds] = useState<number[]>([]);

  return (
    <VisibleProductsContext.Provider value={{ visibleProductIds, setVisibleProductIds }}>
      {children}
    </VisibleProductsContext.Provider>
  );
}

export function useVisibleProducts() {
  const context = useContext(VisibleProductsContext);
  if (!context) {
    throw new Error('useVisibleProducts must be used within VisibleProductsProvider');
  }
  return context;
}
