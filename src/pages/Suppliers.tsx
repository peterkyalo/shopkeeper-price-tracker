import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useSuppliers } from '../hooks/useSuppliers';
import SupplierModal from '../components/SupplierModal';
import type { Supplier } from '../types/supabase';

function Suppliers() {
  const { suppliers, loading, error, fetchSuppliers, deleteSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddSupplier = () => {
    setCurrentSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSupplier(null);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      await deleteSupplier(supplierToDelete.id);
      setIsDeleteModalOpen(false);
      setSupplierToDelete(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Suppliers</h1>
        <button
          onClick={handleAddSupplier}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Supplier
        </button>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-error-800 bg-error-100 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Suppliers List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse card p-5">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded mt-4"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredSuppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="card hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{supplier.name}</h3>
                    {supplier.contact && (
                      <p className="text-sm text-gray-600 mb-1">{supplier.contact}</p>
                    )}
                    {supplier.phone && (
                      <p className="text-sm text-gray-600 mb-1">{supplier.phone}</p>
                    )}
                    {supplier.address && (
                      <p className="text-sm text-gray-600 mb-1">{supplier.address}</p>
                    )}
                  </div>
                  <div className="border-t border-gray-200 px-5 py-3 flex justify-between">
                    <Link
                      to={`/suppliers/${supplier.id}`}
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSupplier(supplier)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(supplier)}
                        className="text-error-600 hover:text-error-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
              {searchTerm ? (
                <p className="text-gray-500 mb-4">No results for "{searchTerm}"</p>
              ) : (
                <p className="text-gray-500 mb-4">Get started by adding your first supplier</p>
              )}
              <button
                onClick={handleAddSupplier}
                className="btn btn-primary inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-1" />
                Add Supplier
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Supplier Modal */}
      {isModalOpen && (
        <SupplierModal
          supplier={currentSupplier}
          onClose={handleCloseModal}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && supplierToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Supplier</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{supplierToDelete.name}</span>? This action cannot be undone.
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
    </div>
  );
}

export default Suppliers;