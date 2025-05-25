import { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Price, Product, Supplier } from '../types/supabase';
import { format } from 'date-fns';

interface PriceWithDetails extends Price {
  products?: Product;
  suppliers?: Supplier;
}

interface PriceComparison {
  productId: string;
  productName: string;
  suppliers: {
    supplierId: string;
    supplierName: string;
    latestPrice: number;
    priceDate: string;
  }[];
}

interface PriceContextType {
  prices: PriceWithDetails[];
  loading: boolean;
  error: string | null;
  fetchPrices: () => Promise<void>;
  fetchPricesByProduct: (productId: string) => Promise<PriceWithDetails[]>;
  fetchPricesBySupplier: (supplierId: string) => Promise<PriceWithDetails[]>;
  getPrice: (id: string) => Promise<PriceWithDetails | null>;
  createPrice: (data: Omit<Price, 'id' | 'created_at' | 'user_id'>) => Promise<Price | null>;
  updatePrice: (id: string, data: Partial<Omit<Price, 'id' | 'created_at' | 'user_id'>>) => Promise<Price | null>;
  deletePrice: (id: string) => Promise<boolean>;
  getPriceComparisons: () => Promise<PriceComparison[]>;
  getPriceHistory: (productId: string, supplierId?: string) => Promise<{
    dates: string[];
    prices: Record<string, number[]>;
  }>;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<PriceWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPrices = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('prices')
        .select(`
          *,
          products:product_id(*),
          suppliers:supplier_id(*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setPrices(data || []);
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  const fetchPricesByProduct = async (productId: string): Promise<PriceWithDetails[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('prices')
        .select(`
          *,
          products:product_id(*),
          suppliers:supplier_id(*)
        `)
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error fetching prices by product:', err);
      setError('Failed to fetch prices');
      return [];
    }
  };

  const fetchPricesBySupplier = async (supplierId: string): Promise<PriceWithDetails[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('prices')
        .select(`
          *,
          products:product_id(*),
          suppliers:supplier_id(*)
        `)
        .eq('supplier_id', supplierId)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error fetching prices by supplier:', err);
      setError('Failed to fetch prices');
      return [];
    }
  };

  const getPrice = async (id: string): Promise<PriceWithDetails | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('prices')
        .select(`
          *,
          products:product_id(*),
          suppliers:supplier_id(*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error fetching price:', err);
      setError('Failed to fetch price');
      return null;
    }
  };

  const createPrice = async (priceData: Omit<Price, 'id' | 'created_at' | 'user_id'>): Promise<Price | null> => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('prices')
        .insert([{ ...priceData, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchPrices(); // Refresh prices to get related data
      return data;
    } catch (err) {
      console.error('Error creating price:', err);
      setError('Failed to create price');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = async (id: string, priceData: Partial<Omit<Price, 'id' | 'created_at' | 'user_id'>>): Promise<Price | null> => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('prices')
        .update(priceData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchPrices(); // Refresh prices to get related data
      return data;
    } catch (err) {
      console.error('Error updating price:', err);
      setError('Failed to update price');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePrice = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('prices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setPrices(prev => 
        prev.filter(price => price.id !== id)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting price:', err);
      setError('Failed to delete price');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPriceComparisons = async (): Promise<PriceComparison[]> => {
    if (!user) return [];
    
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);
      
      if (productsError) throw productsError;
      
      const comparisons: PriceComparison[] = [];
      
      for (const product of productsData) {
        const { data: pricesData, error: pricesError } = await supabase
          .from('prices')
          .select(`
            *,
            suppliers:supplier_id(*)
          `)
          .eq('product_id', product.id)
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        
        if (pricesError) throw pricesError;
        
        // Group by supplier and get latest price
        const supplierMap = new Map<string, { 
          supplierId: string; 
          supplierName: string; 
          latestPrice: number; 
          priceDate: string;
        }>();
        
        pricesData.forEach(price => {
          const supplierId = price.supplier_id;
          const supplier = price.suppliers as Supplier;
          
          if (!supplierMap.has(supplierId)) {
            supplierMap.set(supplierId, {
              supplierId,
              supplierName: supplier.name,
              latestPrice: price.price,
              priceDate: price.date,
            });
          }
        });
        
        if (supplierMap.size > 0) {
          comparisons.push({
            productId: product.id,
            productName: product.name,
            suppliers: Array.from(supplierMap.values()),
          });
        }
      }
      
      return comparisons;
    } catch (err) {
      console.error('Error generating price comparisons:', err);
      setError('Failed to generate price comparisons');
      return [];
    }
  };

  const getPriceHistory = async (productId: string, supplierId?: string): Promise<{
    dates: string[];
    prices: Record<string, number[]>;
  }> => {
    if (!user) return { dates: [], prices: {} };
    
    try {
      let query = supabase
        .from('prices')
        .select(`
          *,
          suppliers:supplier_id(*)
        `)
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .order('date');
      
      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Process data for chart
      const dateMap = new Map<string, { [key: string]: number }>();
      
      data.forEach(price => {
        const formattedDate = format(new Date(price.date), 'yyyy-MM-dd');
        const supplier = price.suppliers as Supplier;
        const supplierName = supplier.name;
        
        if (!dateMap.has(formattedDate)) {
          dateMap.set(formattedDate, {});
        }
        
        const dateEntry = dateMap.get(formattedDate)!;
        dateEntry[supplierName] = price.price;
      });
      
      // Sort dates
      const sortedDates = Array.from(dateMap.keys()).sort();
      
      // Get unique supplier names
      const supplierNames = Array.from(new Set(
        data.map(price => (price.suppliers as Supplier).name)
      ));
      
      // Create price arrays for each supplier
      const prices: Record<string, number[]> = {};
      
      supplierNames.forEach(supplierName => {
        prices[supplierName] = sortedDates.map(date => {
          const dateEntry = dateMap.get(date);
          return dateEntry?.[supplierName] || null;
        }).filter((price): price is number => price !== null);
      });
      
      return {
        dates: sortedDates,
        prices,
      };
    } catch (err) {
      console.error('Error getting price history:', err);
      setError('Failed to get price history');
      return { dates: [], prices: {} };
    }
  };

  useEffect(() => {
    if (user) {
      fetchPrices();
    } else {
      setPrices([]);
    }
  }, [user]);

  const value = {
    prices,
    loading,
    error,
    fetchPrices,
    fetchPricesByProduct,
    fetchPricesBySupplier,
    getPrice,
    createPrice,
    updatePrice,
    deletePrice,
    getPriceComparisons,
    getPriceHistory,
  };

  return <PriceContext.Provider value={value}>{children}</PriceContext.Provider>;
}

export default PriceContext;