import { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Supplier } from '../types/supabase';

interface SupplierContextType {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  fetchSuppliers: () => Promise<void>;
  getSupplier: (id: string) => Promise<Supplier | null>;
  createSupplier: (data: Omit<Supplier, 'id' | 'created_at' | 'user_id'>) => Promise<Supplier | null>;
  updateSupplier: (id: string, data: Partial<Omit<Supplier, 'id' | 'created_at' | 'user_id'>>) => Promise<Supplier | null>;
  deleteSupplier: (id: string) => Promise<boolean>;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSuppliers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const getSupplier = async (id: string): Promise<Supplier | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error fetching supplier:', err);
      setError('Failed to fetch supplier');
      return null;
    }
  };

  const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'user_id'>): Promise<Supplier | null> => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{ ...supplierData, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      setSuppliers(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating supplier:', err);
      setError('Failed to create supplier');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async (id: string, supplierData: Partial<Omit<Supplier, 'id' | 'created_at' | 'user_id'>>): Promise<Supplier | null> => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('suppliers')
        .update(supplierData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setSuppliers(prev => 
        prev.map(supplier => 
          supplier.id === id ? data : supplier
        )
      );
      
      return data;
    } catch (err) {
      console.error('Error updating supplier:', err);
      setError('Failed to update supplier');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSuppliers(prev => 
        prev.filter(supplier => supplier.id !== id)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting supplier:', err);
      setError('Failed to delete supplier');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSuppliers();
    } else {
      setSuppliers([]);
    }
  }, [user]);

  const value = {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };

  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>;
}

export default SupplierContext;