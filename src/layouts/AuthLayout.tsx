import { Outlet, Link } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';

function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          <div className="flex flex-col items-center">
            <Link to="/" className="flex items-center mb-8">
              <BarChart2 className="h-10 w-10 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">PriceTrack</span>
            </Link>
            
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Welcome to PriceTrack</h2>
            <p className="mt-2 text-sm text-gray-600">
              The smart way to track supplier prices and save money
            </p>
          </div>

          <div className="mt-8">
            <Outlet />
          </div>
        </div>
      </div>
      
      <div className="relative flex-1 hidden w-0 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-800 flex flex-col items-center justify-center p-12 text-white">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold mb-6">Smart Price Tracking for Shopkeepers</h2>
            <p className="text-lg mb-8">
              Compare prices across suppliers, track price changes over time, and make smarter purchasing decisions.
            </p>
            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 text-primary-200 mr-2">✓</span>
                <span>Track prices from all your suppliers in one place</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 text-primary-200 mr-2">✓</span>
                <span>Identify the best supplier for each product</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 text-primary-200 mr-2">✓</span>
                <span>Get alerts when prices change significantly</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 text-primary-200 mr-2">✓</span>
                <span>Make data-driven purchasing decisions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;