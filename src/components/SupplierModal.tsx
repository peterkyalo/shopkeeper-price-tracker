import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSuppliers } from '../hooks/useSuppliers';
import type { Supplier } from '../types/supabase';

interface SupplierModalProps {
  supplier: Supplier | null;
  onClose: () => void;
}

function SupplierModal({ supplier, onClose }: SupplierModalProps) {
  const { createSupplier, updateSupplier } = useSuppliers();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setContact(supplier.contact || '');
      setPhone(supplier.phone || '');
      setAddress(supplier.address || '');
      setNotes(supplier.notes || '');
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Supplier name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const supplierData = {
        name: name.trim(),
        contact: contact.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        notes: notes.trim() || null,
      };
      
      if (supplier) {
        await updateSupplier(supplier.id, supplierData);
      } else {
        await createSupplier(supplierData);
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving supplier:', err);
      setError('Failed to save supplier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {supplier ? 'Edit Supplier' : 'Add Supplier'}
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
                placeholder="Supplier name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="contact" className="label">
                Contact Person
              </label>
              <input
                type="text"
                id="contact"
                className="input"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Contact person name"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="label">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="label">
                Address
              </label>
              <input
                type="text"
                id="address"
                className="input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="label">
                Notes
              </label>
              <textarea
                id="notes"
                className="input h-24 resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this supplier"
              ></textarea>
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
                'Save Supplier'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SupplierModal;