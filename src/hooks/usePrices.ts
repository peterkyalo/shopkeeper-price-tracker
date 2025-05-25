import { useContext } from 'react';
import PriceContext from '../contexts/PriceContext';

export const usePrices = () => {
  const context = useContext(PriceContext);
  
  if (context === undefined) {
    throw new Error('usePrices must be used within a PriceProvider');
  }
  
  return context;
};