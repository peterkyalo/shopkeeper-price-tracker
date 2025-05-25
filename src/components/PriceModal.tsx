import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSuppliers } from '../hooks/useSuppliers';
import { useProducts } from '../hooks/useProducts';
import { usePrices } from '../hooks/usePrices';
import { format } from 'date-fns';
import type { PriceWithDetails } from '../types/supabase';

interface PriceModalProps {
  price: PriceWithDetails | null;
  defaultSupplierId?: string;
  defaultProductId?: string;
  onClose: () => void;
}

function PriceModal({ price, defaultSupplierId, defaultProductId, onClose }: PriceModalProps) {
  const { suppliers } = useSuppliers();
  const { products } = useProducts();
  const { createPrice, updatePrice } = usePrices();
  
  const [productId, setProductId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [priceValue, setPriceValue] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (price) {
      setProductId(price.product_id);
      setSupplierId(price.supplier_id);
      setPriceValue(price.price.toString());
      setDate(price.date);
      setNotes(price.notes || '');
    } else {
      if (defaultSupplierId) setSupplierId(defaultSupplierId);
      if (defaultProductId) setProductId(defaultProductId);
    }
  }, [price, defaultSupplierId, defaultProductId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId || !supplierId || !priceValue || !date) {
      setError('Please fill out all required fields');
      return;
    }
    
    const numericPrice = parseFloat(priceValue);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const priceData = {
        product_id: productId,
        supplier_id: supplierId,
        price: numericPrice,
        date,
        notes: notes.trim() || null,
      };
      
      if (price) {
        await updatePrice(price.id, priceData);
      } else {
        await createPrice(priceData);
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving price:', err);
      setError('Failed to save price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {price ? 'Edit Price' : 'Add Price'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <div className="p-3 text-sm text-error-800 bg-error-100 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="product" className="label">
                Product <span className="text-error-500">*</span>
              </label>
              <select
                id="product"
                className="select"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="supplier" className="label">
                Supplier <span className="text-error-500">*</span>
              </label>
              <select
                id="supplier"
                className="select"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
                disabled={!!defaultSupplierId}
              >
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="price" className="label">
                Price <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  className="input pl-7"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="date" className="label">
                Date <span className="text-error-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="label">
                Notes
              </label>
              <textarea
                id="notes"
                className="input h-24 resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this price"
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Price'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PriceModal;