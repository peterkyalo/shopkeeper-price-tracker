import { useContext } from 'react';
import SupplierContext from '../contexts/SupplierContext';

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  
  return context;
};