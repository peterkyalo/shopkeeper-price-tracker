import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { SupplierProvider } from './contexts/SupplierContext';
import { ProductProvider } from './contexts/ProductContext';
import { PriceProvider } from './contexts/PriceContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SupplierProvider>
          <ProductProvider>
            <PriceProvider>
              <App />
            </PriceProvider>
          </ProductProvider>
        </SupplierProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);