import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types/supabase';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

function ProductModal({ product, onClose }: ProductModalProps) {
  const { createProduct, updateProduct, getProductCategories } = useProducts();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const categories = getProductCategories();
  
  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category || '');
      setDescription(product.description || '');
      setSku(product.sku || '');
      setUnit(product.unit || '');
    }
  }, [product]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === 'custom') {
      setShowCustomCategory(true);
      setCategory('');
    } else {
      setShowCustomCategory(false);
      setCategory(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const finalCategory = showCustomCategory ? customCategory.trim() : category;
      
      const productData = {
        name: name.trim(),
        category: finalCategory || null,
        description: description.trim() || null,
        sku: sku.trim() || null,
        unit: unit.trim() || null,
      };
      
      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add Product'}
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
              <label htmlFor="name" className="label">
                Name <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="label">
                Category
              </label>
              <select
                id="category"
                className="select"
                value={showCustomCategory ? 'custom' : category}
                onChange={handleCategoryChange}
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="custom">+ Add New Category</option>
              </select>
            </div>
            
            {showCustomCategory && (
              <div className="animate-fade-in">
                <label htmlFor="customCategory" className="label">
                  New Category
                </label>
                <input
                  type="text"
                  id="customCategory"
                  className="input"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter new category name"
                  autoFocus
                />
              </div>
            )}
            
            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                className="input h-24 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sku" className="label">
                  SKU / Product Code
                </label>
                <input
                  type="text"
                  id="sku"
                  className="input"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Product SKU"
                />
              </div>
              
              <div>
                <label htmlFor="unit" className="label">
                  Unit
                </label>
                <input
                  type="text"
                  id="unit"
                  className="input"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., kg, pcs, box"
                />
              </div>
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
                'Save Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;