import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { usePrices } from '../hooks/usePrices';
import PriceModal from '../components/PriceModal';

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

function PriceComparison() {
  const { getPriceComparisons } = usePrices();
  const [comparisons, setComparisons] = useState<PriceComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  useEffect(() => {
    const loadComparisons = async () => {
      try {
        setLoading(true);
        const data = await getPriceComparisons();
        setComparisons(data);
      } catch (err) {
        console.error('Error loading price comparisons:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComparisons();
  }, [getPriceComparisons]);

  const handleAddPrice = () => {
    setIsPriceModalOpen(true);
  };

  const handleClosePriceModal = async () => {
    setIsPriceModalOpen(false);
    
    // Refresh comparisons
    const data = await getPriceComparisons();
    setComparisons(data);
  };

  const getBestSupplier = (comparison: PriceComparison) => {
    if (comparison.suppliers.length === 0) return null;
    
    return comparison.suppliers.reduce((best, current) => 
      current.latestPrice < best.latestPrice ? current : best
    );
  };

  const getPriceDifferencePercentage = (comparison: PriceComparison) => {
    if (comparison.suppliers.length < 2) return 0;
    
    const prices = comparison.suppliers.map(s => s.latestPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    return ((maxPrice - minPrice) / minPrice) * 100;
  };

  const getSavingsIndicator = (difference: number) => {
    if (difference <= 5) return { class: 'bg-success-100 text-success-800', text: 'Low' };
    if (difference <= 15) return { class: 'bg-warning-100 text-warning-800', text: 'Medium' };
    return { class: 'bg-error-100 text-error-800', text: 'High' };
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded mb-4"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Price Comparison</h1>
        <button
          onClick={handleAddPrice}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Price
        </button>
      </div>
      
      {comparisons.length > 0 ? (
        <div className="space-y-6">
          {comparisons.map((comparison) => {
            const bestSupplier = getBestSupplier(comparison);
            const priceDifference = getPriceDifferencePercentage(comparison);
            const savingsIndicator = getSavingsIndicator(priceDifference);
            
            return (
              <div key={comparison.productId} className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{comparison.productName}</h2>
                    <p className="text-sm text-gray-500">
                      {comparison.suppliers.length} supplier{comparison.suppliers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {comparison.suppliers.length > 1 && (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${savingsIndicator.class}`}>
                      {savingsIndicator.text} savings potential ({Math.round(priceDifference)}%)
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-xs text-gray-700 uppercase">
                        <tr>
                          <th className="px-2 py-2">Supplier</th>
                          <th className="px-2 py-2">Price</th>
                          <th className="px-2 py-2">Comparison</th>
                          <th className="px-2 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {comparison.suppliers
                          .sort((a, b) => a.latestPrice - b.latestPrice)
                          .map((supplier, index) => {
                            const isBest = bestSupplier && supplier.supplierId === bestSupplier.supplierId;
                            const priceDiff = bestSupplier ? 
                              ((supplier.latestPrice - bestSupplier.latestPrice) / bestSupplier.latestPrice) * 100 : 0;
                            
                            return (
                              <tr key={supplier.supplierId} className={isBest ? 'bg-success-50' : ''}>
                                <td className="px-2 py-3 font-medium">
                                  {supplier.supplierName}
                                  {isBest && (
                                    <span className="ml-2 text-xs px-2 py-0.5 bg-success-100 text-success-800 rounded-full">
                                      Best Price
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-3 font-semibold">
                                  ${supplier.latestPrice.toFixed(2)}
                                </td>
                                <td className="px-2 py-3">
                                  {index === 0 ? (
                                    <span className="text-success-600 font-medium">Base price</span>
                                  ) : (
                                    <span className="text-error-600">
                                      +{priceDiff.toFixed(1)}% more expensive
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-3 text-right">
                                  <Link
                                    to={`/suppliers/${supplier.supplierId}`}
                                    className="text-primary-600 hover:text-primary-500 text-sm font-medium inline-flex items-center"
                                  >
                                    View Supplier 
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <Link
                    to={`/products/${comparison.productId}`}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium inline-flex items-center"
                  >
                    View Product Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No price data to compare</h3>
          <p className="text-gray-500 mb-4">Add prices for your products to start comparing suppliers.</p>
          <button
            onClick={handleAddPrice}
            className="btn btn-primary inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Price
          </button>
        </div>
      )}
      
      {/* Price Modal */}
      {isPriceModalOpen && (
        <PriceModal
          price={null}
          onClose={handleClosePriceModal}
        />
      )}
    </div>
  );
}

export default PriceComparison;