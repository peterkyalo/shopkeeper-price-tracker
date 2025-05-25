import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, X, Home, Package, ShoppingCart, BarChart2, TrendingUp, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSubmenuOpen, setIsMobileSubmenuOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSubmenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-primary-100 text-primary-800' : 'text-gray-700 hover:bg-gray-100';
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 border-r border-gray-200 bg-white">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center">
            <BarChart2 className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">PriceTrack</span>
          </Link>
        </div>
        
        <div className="flex-grow py-4 px-4 overflow-y-auto">
          <nav className="flex-1 space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive('/dashboard')}`}
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            
            <Link
              to="/suppliers"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive('/suppliers')}`}
            >
              <ShoppingCart className="mr-3 h-5 w-5" />
              Suppliers
            </Link>
            
            <Link
              to="/products"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive('/products')}`}
            >
              <Package className="mr-3 h-5 w-5" />
              Products
            </Link>
            
            <Link
              to="/price-comparison"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive('/price-comparison')}`}
            >
              <BarChart2 className="mr-3 h-5 w-5" />
              Price Comparison
            </Link>
            
            <Link
              to="/price-history"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive('/price-history')}`}
            >
              <TrendingUp className="mr-3 h-5 w-5" />
              Price History
            </Link>
          </nav>
        </div>
        
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/dashboard" className="flex items-center">
            <BarChart2 className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">PriceTrack</span>
          </Link>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-700 focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="px-2 pt-2 pb-3 border-b border-gray-200 bg-white">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 text-base font-medium rounded-md ${isActive('/dashboard')}`}
            >
              <div className="flex items-center">
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </div>
            </Link>
            
            <Link
              to="/suppliers"
              className={`block px-3 py-2 text-base font-medium rounded-md ${isActive('/suppliers')}`}
            >
              <div className="flex items-center">
                <ShoppingCart className="mr-3 h-5 w-5" />
                Suppliers
              </div>
            </Link>
            
            <Link
              to="/products"
              className={`block px-3 py-2 text-base font-medium rounded-md ${isActive('/products')}`}
            >
              <div className="flex items-center">
                <Package className="mr-3 h-5 w-5" />
                Products
              </div>
            </Link>
            
            <div className="relative">
              <button
                onClick={() => setIsMobileSubmenuOpen(!isMobileSubmenuOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <BarChart2 className="mr-3 h-5 w-5" />
                  Price Tools
                </div>
                {isMobileSubmenuOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              
              {isMobileSubmenuOpen && (
                <div className="pl-10 pr-3 py-1 space-y-1">
                  <Link
                    to="/price-comparison"
                    className={`block px-3 py-2 text-sm font-medium rounded-md ${isActive('/price-comparison')}`}
                  >
                    Price Comparison
                  </Link>
                  
                  <Link
                    to="/price-history"
                    className={`block px-3 py-2 text-sm font-medium rounded-md ${isActive('/price-history')}`}
                  >
                    Price History
                  </Link>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="px-4 py-6 sm:px-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;