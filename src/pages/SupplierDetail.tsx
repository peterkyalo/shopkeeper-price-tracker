import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { useSuppliers } from '../hooks/useSuppliers';
import { usePrices } from '../hooks/usePrices';
import SupplierModal from '../components/SupplierModal';
import PriceModal from '../components/PriceModal';
import { format } from 'date-fns';
import type { Supplier, PriceWithDetails } from '../types/supabase';

function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSupplier, deleteSupplier } = useSuppliers();
  const { fetchPricesBySupplier, deletePrice } = usePrices();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [prices, setPrices] = useState<PriceWithDetails[]>([]);
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
        const supplierData = await getSupplier(id);
        if (supplierData) {
          setSupplier(supplierData);
          const priceData = await fetchPricesBySupplier(id);
          setPrices(priceData);
        } else {
          navigate('/suppliers');
        }
      } catch (err) {
        console.error('Error loading supplier details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, getSupplier, fetchPricesBySupplier, navigate]);

  const handleEditSupplier = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Refresh supplier data
    if (id) {
      getSupplier(id).then(data => {
        if (data) setSupplier(data);
      });
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (id) {
      await deleteSupplier(id);
      navigate('/suppliers');
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
      const priceData = await fetchPricesBySupplier(id);
      setPrices(priceData);
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
        const priceData = await fetchPricesBySupplier(id);
        setPrices(priceData);
      }
    }
  };

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

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Supplier not found</h2>
        <Link to="/suppliers" className="btn btn-primary">
          Back to Suppliers
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link to="/suppliers" className="inline-flex items-center text-primary-600 hover:text-primary-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Suppliers
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">{supplier.name}</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleEditSupplier}
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
      
      {/* Supplier Info */}
      <div className="card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Contact Person</p>
                <p className="font-medium">{supplier.contact || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{supplier.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{supplier.address || '-'}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-700 whitespace-pre-line">{supplier.notes || 'No notes available.'}</p>
          </div>
        </div>
      </div>
      
      {/* Price History */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Price History</h2>
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
                <th className="px-6 py-3">Product</th>
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
                    {(price.products as any)?.name || 'Unknown Product'}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No price history</h3>
          <p className="text-gray-500 mb-4">No prices have been recorded for this supplier yet.</p>
          <button
            onClick={handleAddPrice}
            className="btn btn-primary inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Price
          </button>
        </div>
      )}
      
      {/* Supplier Modal */}
      {isModalOpen && (
        <SupplierModal
          supplier={supplier}
          onClose={handleCloseModal}
        />
      )}
      
      {/* Price Modal */}
      {isPriceModalOpen && (
        <PriceModal
          price={selectedPrice}
          defaultSupplierId={supplier.id}
          onClose={handleClosePriceModal}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Supplier</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{supplier.name}</span>? This action cannot be undone.
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
              Are you sure you want to delete this price record for{' '}
              <span className="font-semibold">{(priceToDelete.products as any)?.name || 'this product'}</span>? This action cannot be undone.
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

export default SupplierDetail;