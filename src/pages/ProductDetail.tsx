import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { usePrices } from '../hooks/usePrices';
import ProductModal from '../components/ProductModal';
import PriceModal from '../components/PriceModal';
import PriceChart from '../components/PriceChart';
import { format } from 'date-fns';
import type { Product, PriceWithDetails } from '../types/supabase';

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, deleteProduct } = useProducts();
  const { fetchPricesByProduct, deletePrice, getPriceHistory } = usePrices();
  const [product, setProduct] = useState<Product | null>(null);
  const [prices, setPrices] = useState<PriceWithDetails[]>([]);
  const [priceHistory, setPriceHistory] = useState<{ dates: string[]; prices: Record<string, number[]> }>({ dates: [], prices: {} });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<PriceWithDetails | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPriceDeleteModalOpen, setIsPriceDeleteModalOpen] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState<PriceWithDetails | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const productData = await getProduct(id);
        if (productData) {
          setProduct(productData);
          const priceData = await fetchPricesByProduct(id);
          setPrices(priceData);
          
          const history = await getPriceHistory(id);
          setPriceHistory(history);
        } else {
          navigate('/products');
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, getProduct, fetchPricesByProduct, getPriceHistory, navigate]);

  const handleEditProduct = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Refresh product data
    if (id) {
      getProduct(id).then(data => {
        if (data) setProduct(data);
      });
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (id) {
      await deleteProduct(id);
      navigate('/products');
    }
  };

  const handleAddPrice = () => {
    setSelectedPrice(null);
    setIsPriceModalOpen(true);
  };

  const handleEditPrice = (price: PriceWithDetails) => {
    setSelectedPrice(price);
    setIsPriceModalOpen(true);
  };

  const handleClosePriceModal = async () => {
    setIsPriceModalOpen(false);
    setSelectedPrice(null);
    
    // Refresh price data
    if (id) {
      const priceData = await fetchPricesByProduct(id);
      setPrices(priceData);
      
      const history = await getPriceHistory(id);
      setPriceHistory(history);
    }
  };

  const handleDeletePriceClick = (price: PriceWithDetails) => {
    setPriceToDelete(price);
    setIsPriceDeleteModalOpen(true);
  };

  const handleConfirmPriceDelete = async () => {
    if (priceToDelete) {
      await deletePrice(priceToDelete.id);
      setIsPriceDeleteModalOpen(false);
      setPriceToDelete(null);
      
      // Refresh price data
      if (id) {
        const priceData = await fetchPricesByProduct(id);
        setPrices(priceData);
        
        const history = await getPriceHistory(id);
        setPriceHistory(history);
      }
    }
  };

  const getBestPrice = () => {
    if (prices.length === 0) return null;
    
    const lowestPrice = [...prices].sort((a, b) => a.price - b.price)[0];
    return lowestPrice;
  };

  const bestPrice = getBestPrice();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4 mt-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Product not found</h2>
        <Link to="/products" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link to="/products" className="inline-flex items-center text-primary-600 hover:text-primary-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Products
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">{product.name}</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleEditProduct}
            className="btn btn-outline inline-flex items-center"
          >
            <Edit className="h-5 w-5 mr-1" />
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            className="btn btn-danger inline-flex items-center"
          >
            <Trash2 className="h-5 w-5 mr-1" />
            Delete
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
            <div className="space-y-3">
              {product.category && (
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{product.category}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">SKU / Product Code</p>
                <p className="font-medium">{product.sku || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unit</p>
                <p className="font-medium">{product.unit || '-'}</p>
              </div>
              {bestPrice && (
                <div>
                  <p className="text-sm text-gray-500">Best Price</p>
                  <p className="font-medium text-success-600">
                    ${bestPrice.price.toFixed(2)} 
                    <span className="text-gray-500 text-sm ml-1">
                      from {(bestPrice.suppliers as any)?.name || 'Unknown Supplier'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{product.description || 'No description available.'}</p>
          </div>
        </div>
      </div>
      
      {/* Price Chart */}
      {priceHistory.dates.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Price History</h2>
          <div className="h-64">
            <PriceChart 
              dates={priceHistory.dates} 
              prices={priceHistory.prices} 
            />
          </div>
        </div>
      )}
      
      {/* Price List */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Price Entries</h2>
        <button
          onClick={handleAddPrice}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Price
        </button>
      </div>
      
      {prices.length > 0 ? (
        <div className="overflow-x-auto card">
          <table className="w-full text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Supplier</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Notes</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {prices.map((price) => (
                <tr key={price.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {(price.suppliers as any)?.name || 'Unknown Supplier'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    ${price.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {format(new Date(price.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {price.notes || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditPrice(price)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePriceClick(price)}
                        className="text-error-600 hover:text-error-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No price entries</h3>
          <p className="text-gray-500 mb-4">No prices have been recorded for this product yet.</p>
          <button
            onClick={handleAddPrice}
            className="btn btn-primary inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Price
          </button>
        </div>
      )}
      
      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          product={product}
          onClose={handleCloseModal}
        />
      )}
      
      {/* Price Modal */}
      {isPriceModalOpen && (
        <PriceModal
          price={selectedPrice}
          defaultProductId={product.id}
          onClose={handleClosePriceModal}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Product</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{product.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Price Delete Confirmation Modal */}
      {isPriceDeleteModalOpen && priceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Price Record</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this price record from{' '}
              <span className="font-semibold">{(priceToDelete.suppliers as any)?.name || 'this supplier'}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsPriceDeleteModalOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPriceDelete}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;