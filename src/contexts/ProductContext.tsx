import { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Product } from '../types/supabase';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  getProduct: (id: string) => Promise<Product | null>;
  createProduct: (data: Omit<Product, 'id' | 'created_at' | 'user_id'>) => Promise<Product | null>;
  updateProduct: (id: string, data: Partial<Omit<Product, 'id' | 'created_at' | 'user_id'>>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductCategories: () => string[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProducts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (id: string): Promise<Product | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to fetch product');
      return null;
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'user_id'>): Promise<Product | null> => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      setProducts(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'user_id'>>): Promise<Product | null> => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? data : product
        )
      );
      
      return data;
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setProducts(prev => 
        prev.filter(product => product.id !== id)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getProductCategories = (): string[] => {
    const categories = products
      .map(product => product.category)
      .filter((category): category is string => category !== null && category !== '');
    
    return [...new Set(categories)].sort();
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [user]);

  const value = {
    products,
    loading,
    error,
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductCategories,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export default ProductContext;