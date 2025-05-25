import { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { usePrices } from '../hooks/usePrices';
import PriceChart from '../components/PriceChart';

function PriceHistory() {
  const { products } = useProducts();
  const { getPriceHistory } = usePrices();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [priceHistory, setPriceHistory] = useState<{ dates: string[]; prices: Record<string, number[]> }>({ dates: [], prices: {} });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      const loadPriceHistory = async () => {
        try {
          setLoading(true);
          const history = await getPriceHistory(selectedProduct);
          setPriceHistory(history);
        } catch (err) {
          console.error('Error loading price history:', err);
        } finally {
          setLoading(false);
        }
      };

      loadPriceHistory();
    } else {
      setPriceHistory({ dates: [], prices: {} });
    }
  }, [selectedProduct, getPriceHistory]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Price History</h1>
      
      <div className="card p-6 mb-8">
        <div className="mb-6">
          <label htmlFor="product" className="label">
            Select a Product
          </label>
          <select
            id="product"
            className="select"
            value={selectedProduct}
            onChange={handleProductChange}
          >
            <option value="">Choose a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedProduct ? (
          loading ? (
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : (
            priceHistory.dates.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Price Trends
                </h2>
                <div className="h-80">
                  <PriceChart 
                    dates={priceHistory.dates}
                    prices={priceHistory.prices}
                  />
                </div>
                <div className="mt-6 text-sm text-gray-500">
                  <p>This chart shows price trends across different suppliers over time.</p>
                  <p>Hover over data points to see exact prices.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No price history available for this product.</p>
              </div>
            )
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Select a product to view its price history.</p>
          </div>
        )}
      </div>
      
      {selectedProduct && priceHistory.dates.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Price Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Supplier Count</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {Object.keys(priceHistory.prices).length}
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Price Updates</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {priceHistory.dates.length}
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Time Period</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {priceHistory.dates.length > 1 ? 
                  `${priceHistory.dates[0]} to ${priceHistory.dates[priceHistory.dates.length - 1]}` : 
                  priceHistory.dates[0]}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">Insights</h3>
            <ul className="space-y-2">
              {Object.entries(priceHistory.prices).map(([supplier, prices]) => {
                const firstPrice = prices[0];
                const lastPrice = prices[prices.length - 1];
                const change = ((lastPrice - firstPrice) / firstPrice) * 100;
                const changeText = change === 0 ? 
                  'has remained stable' : 
                  change > 0 ? 
                    `has increased by ${change.toFixed(1)}%` : 
                    `has decreased by ${Math.abs(change).toFixed(1)}%`;
                
                return (
                  <li key={supplier} className="flex items-start">
                    <span className="flex-shrink-0 h-5 w-5 text-primary-500 mr-2">•</span>
                    <span>
                      <strong>{supplier}</strong> pricing {changeText} 
                      {prices.length > 1 ? ` over the last ${prices.length} updates` : ''}.
                    </span>
                  </li>
                );
              })}
              
              {Object.keys(priceHistory.prices).length > 1 && (
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-primary-500 mr-2">•</span>
                  <span>
                    <strong>Price comparison:</strong> There's a {(() => {
                      const lastPrices = Object.values(priceHistory.prices).map(prices => prices[prices.length - 1]);
                      const minPrice = Math.min(...lastPrices);
                      const maxPrice = Math.max(...lastPrices);
                      const diff = ((maxPrice - minPrice) / minPrice) * 100;
                      return diff.toFixed(1);
                    })()}% difference between the highest and lowest current supplier prices.
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceHistory;