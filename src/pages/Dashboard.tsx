import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Package, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import { useSuppliers } from '../hooks/useSuppliers';
import { useProducts } from '../hooks/useProducts';
import { usePrices } from '../hooks/usePrices';
import { format } from 'date-fns';

function Dashboard() {
  const { suppliers, fetchSuppliers } = useSuppliers();
  const { products, fetchProducts } = useProducts();
  const { prices, fetchPrices, getPriceComparisons } = usePrices();
  const [priceAlerts, setPriceAlerts] = useState<{ product: string; diff: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchSuppliers(),
        fetchProducts(),
        fetchPrices()
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchSuppliers, fetchProducts, fetchPrices]);

  useEffect(() => {
    // Generate price alerts for significant price changes (>10%)
    const getAlerts = async () => {
      if (prices.length > 0) {
        const comparisons = await getPriceComparisons();
        const alerts = [];

        for (const comparison of comparisons) {
          if (comparison.suppliers.length > 1) {
            const prices = comparison.suppliers.map(s => s.latestPrice);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const priceDiff = ((maxPrice - minPrice) / minPrice) * 100;

            if (priceDiff > 10) {
              alerts.push({
                product: comparison.productName,
                diff: priceDiff
              });
            }
          }
        }

        setPriceAlerts(alerts);
      }
    };

    getAlerts();
  }, [prices, getPriceComparisons]);

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded mt-4"></div>
      </div>
    );
  }

  // Get today's date in YYYY-MM-DD format
  const today = format(new Date(), 'yyyy-MM-dd');

  // Filter prices added today
  const todayPrices = prices.filter(price => price.date === today);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 flex items-center">
          <div className="rounded-full bg-primary-100 p-3 mr-4">
            <ShoppingCart className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Suppliers</h3>
            <p className="text-2xl font-semibold text-gray-900">{suppliers.length}</p>
          </div>
        </div>
        
        <div className="card p-5 flex items-center">
          <div className="rounded-full bg-secondary-100 p-3 mr-4">
            <Package className="h-6 w-6 text-secondary-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Products</h3>
            <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
          </div>
        </div>
        
        <div className="card p-5 flex items-center">
          <div className="rounded-full bg-accent-100 p-3 mr-4">
            <BarChart2 className="h-6 w-6 text-accent-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Price Entries</h3>
            <p className="text-2xl font-semibold text-gray-900">{prices.length}</p>
          </div>
        </div>
        
        <div className="card p-5 flex items-center">
          <div className="rounded-full bg-success-100 p-3 mr-4">
            <TrendingUp className="h-6 w-6 text-success-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Today's Updates</h3>
            <p className="text-2xl font-semibold text-gray-900">{todayPrices.length}</p>
          </div>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent Prices */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Price Updates</h2>
          </div>
          <div className="p-5">
            {prices.length > 0 ? (
              <div className="space-y-4">
                {prices.slice(0, 5).map((price) => (
                  <div key={price.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {(price.products as any)?.name || 'Unknown Product'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(price.suppliers as any)?.name || 'Unknown Supplier'} • {format(new Date(price.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${price.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No price updates yet</p>
                <Link to="/price-comparison" className="mt-2 inline-block text-primary-600 hover:text-primary-500">
                  Add your first price update
                </Link>
              </div>
            )}
            
            {prices.length > 5 && (
              <div className="mt-4 text-center">
                <Link to="/price-comparison" className="text-primary-600 hover:text-primary-500 text-sm">
                  View all price updates
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Price Alerts */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Price Alerts</h2>
          </div>
          <div className="p-5">
            {priceAlerts.length > 0 ? (
              <div className="space-y-4">
                {priceAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-warning-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">
                        <span className="font-medium">{alert.product}</span> has a price difference of{' '}
                        <span className="font-semibold text-warning-600">{Math.round(alert.diff)}%</span> between suppliers
                      </p>
                      <Link to="/price-comparison" className="text-sm text-primary-600 hover:text-primary-500">
                        View comparison
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No price alerts at the moment</p>
                <p className="text-sm text-gray-500 mt-1">
                  Alerts appear when there&apos;s a significant price difference (greater than 10%) between suppliers
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Getting Started */}
      {(suppliers.length === 0 || products.length === 0 || prices.length === 0) && (
        <div className="card p-5 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-4">
            {suppliers.length === 0 && (
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 mr-3">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-800">Add your suppliers</p>
                  <p className="text-sm text-gray-500 mb-2">Start by adding the suppliers you purchase from</p>
                  <Link to="/suppliers" className="btn btn-primary text-sm py-1.5">
                    Add Suppliers
                  </Link>
                </div>
              </div>
            )}
            
            {products.length === 0 && (
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 mr-3">
                  {suppliers.length === 0 ? '2' : '1'}
                </div>
                <div>
                  <p className="font-medium text-gray-800">Add your products</p>
                  <p className="text-sm text-gray-500 mb-2">Create a catalog of products you want to track</p>
                  <Link to="/products" className="btn btn-primary text-sm py-1.5">
                    Add Products
                  </Link>
                </div>
              </div>
            )}
            
            {suppliers.length > 0 && products.length > 0 && prices.length === 0 && (
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 mr-3">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-800">Start tracking prices</p>
                  <p className="text-sm text-gray-500 mb-2">Record supplier prices for your products</p>
                  <Link to="/price-comparison" className="btn btn-primary text-sm py-1.5">
                    Add Prices
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;