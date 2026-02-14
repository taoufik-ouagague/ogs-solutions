import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, Plus, Edit2, Trash2, Save, AlertCircle, Upload } from 'lucide-react';
import { toast } from '../utils/toast';
import { PAYMENT_DETAILS } from '../lib/paymentService';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'crypto' | 'cashplus';
  details: Record<string, string>;
  logo?: string;
  active: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface PaymentMethodsFormData {
  name: string;
  type: 'bank' | 'crypto' | 'cashplus';
  details: Record<string, string>;
  logo?: string;
}

const PAYMENT_TYPE_FIELDS: Record<string, string[]> = {
  bank: ['bankName', 'accountHolder', 'accountNumber', 'reference'],
  crypto: ['walletAddress', 'network', 'currency'],
  cashplus: ['merchantCode', 'phone', 'currency']
};

const FIELD_LABELS: Record<string, string> = {
  bankName: 'Bank Name',
  accountHolder: 'Account Holder',
  accountNumber: 'Account Number (RIB)',
  reference: 'Reference',
  walletAddress: 'Wallet Address',
  network: 'Network',
  currency: 'Currency',
  merchantCode: 'Merchant Code',
  phone: 'Phone Number',
};

export default function PaymentMethodsPanel() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentMethodsFormData>({
    name: '',
    type: 'bank',
    details: {}
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'payment_methods'));
      let methods = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentMethod[];

      // If collection is empty, initialize with default payment methods
      if (methods.length === 0) {
        await initializeDefaultPaymentMethods();
        // Reload after initialization
        const reloadSnapshot = await getDocs(collection(db, 'payment_methods'));
        methods = reloadSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PaymentMethod[];
      }

      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultPaymentMethods = async () => {
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, 'payment_methods');

      // Bank method
      const bankDoc = doc(collectionRef);
      batch.set(bankDoc, {
        name: PAYMENT_DETAILS.bank.bankName,
        type: 'bank',
        logo: 'https://www.cihbank.ma/100ansdhistoire/img/logo2014-big.jpg',
        details: {
          accountHolder: PAYMENT_DETAILS.bank.accountHolder,
          bankName: PAYMENT_DETAILS.bank.bankName,
          accountNumber: PAYMENT_DETAILS.bank.accountNumber
        },
        active: true,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      // Crypto method
      const cryptoDoc = doc(collectionRef);
      batch.set(cryptoDoc, {
        name: 'Cryptocurrency (USDT)',
        type: 'crypto',
        details: {
          walletAddress: PAYMENT_DETAILS.crypto.walletAddress,
          network: PAYMENT_DETAILS.crypto.network,
          currency: PAYMENT_DETAILS.crypto.currency
        },
        active: true,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      // Cash Plus method
      const cashplusDoc = doc(collectionRef);
      batch.set(cashplusDoc, {
        name: 'Cash Plus',
        type: 'cashplus',
        details: {
          merchantCode: PAYMENT_DETAILS.cashplus.merchantCode,
          phone: PAYMENT_DETAILS.cashplus.phone,
          currency: PAYMENT_DETAILS.cashplus.currency
        },
        active: true,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      await batch.commit();
      toast.success('Default payment methods initialized');
    } catch (error) {
      console.error('Error initializing default payment methods:', error);
      toast.error('Failed to initialize payment methods');
    }
  };

  const handleNewMethod = () => {
    setEditingId(null);
    setFormData({
      name: '',
      type: 'bank',
      details: {},
      logo: ''
    });
    setShowForm(true);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingId(method.id);
    setFormData({
      name: method.name,
      type: method.type,
      details: method.details,
      logo: method.logo || ''
    });
    setShowForm(true);
  };

  const handleSaveMethod = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Payment method name is required');
        return;
      }

      // Validate that all required fields are filled
      const requiredFields = PAYMENT_TYPE_FIELDS[formData.type];
      const emptyFields = requiredFields.filter(field => !formData.details[field]?.trim());
      
      if (emptyFields.length > 0) {
        toast.error(`Please fill in all required fields: ${emptyFields.map(f => FIELD_LABELS[f]).join(', ')}`);
        return;
      }

      if (editingId) {
        // Update existing
        await updateDoc(doc(db, 'payment_methods', editingId), {
          name: formData.name,
          type: formData.type,
          details: formData.details,
          logo: formData.logo || null,
          updated_at: Timestamp.now()
        });
        toast.success('Payment method updated successfully');
      } else {
        // Add new
        await addDoc(collection(db, 'payment_methods'), {
          name: formData.name,
          type: formData.type,
          details: formData.details,
          logo: formData.logo || null,
          active: true,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        });
        toast.success('Payment method added successfully');
      }

      setShowForm(false);
      loadPaymentMethods();
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error('Failed to save payment method');
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await deleteDoc(doc(db, 'payment_methods', id));
        toast.success('Payment method deleted successfully');
        loadPaymentMethods();
      } catch (error) {
        console.error('Error deleting payment method:', error);
        toast.error('Failed to delete payment method');
      }
    }
  };

  const handleDetailChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value
      }
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast.error('Logo file must be less than 500KB');
      return;
    }

    // Convert to base64 data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFormData(prev => ({
        ...prev,
        logo: dataUrl
      }));
      toast.success('Logo uploaded successfully');
    };
    reader.onerror = () => {
      toast.error('Failed to upload logo');
    };
    reader.readAsDataURL(file);
  };

  const requiredFields = PAYMENT_TYPE_FIELDS[formData.type];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          💳 Payment Methods Management
        </h2>
        <button
          onClick={handleNewMethod}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Payment Method
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">Loading payment methods...</div>
      ) : (
        <div>
          {/* Payment Methods List */}
          <div className="space-y-4 mb-8">
            {paymentMethods.length === 0 ? (
              <div className="p-6 text-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No payment methods configured yet</p>
                <button
                  onClick={handleNewMethod}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add your first payment method
                </button>
              </div>
            ) : (
              paymentMethods.map(method => (
                <div
                  key={method.id}
                  className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {method.logo && (
                          <img src={method.logo} alt={method.name} className="h-10 object-contain" />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{method.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            Type: {method.type === 'cashplus' ? 'Cash Plus' : method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditMethod(method)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMethod(method.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(method.details).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">{FIELD_LABELS[key] || key}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono break-all">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Form Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Payment Method' : 'Add New Payment Method'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-6">
              {/* Method Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., OGS Solutions CIH Account, Main Crypto Wallet"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Method Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as 'bank' | 'crypto' | 'cashplus';
                    setFormData(prev => ({
                      ...prev,
                      type: newType,
                      details: {} // Reset details when type changes
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="cashplus">Cash Plus (Mobile Money)</option>
                </select>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    Choose Logo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {formData.logo && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {formData.logo && (
                  <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg inline-block">
                    <img src={formData.logo} alt="Logo preview" className="h-12 object-contain" />
                  </div>
                )}
              </div>

              {/* Dynamic Fields Based on Type */}
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Fill in all fields below. These details will be displayed to users during checkout.
                  </p>
                </div>

                {requiredFields.map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {FIELD_LABELS[field] || field} *
                    </label>
                    <input
                      type={field.includes('phone') ? 'tel' : 'text'}
                      value={formData.details[field] || ''}
                      onChange={(e) => handleDetailChange(field, e.target.value)}
                      placeholder={`Enter ${FIELD_LABELS[field] || field}`}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Form Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMethod}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-5 w-5" />
                Save Payment Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
