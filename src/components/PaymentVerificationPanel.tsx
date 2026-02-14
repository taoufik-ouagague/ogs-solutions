import { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle, Search, DollarSign, Calendar } from 'lucide-react';
import { getPaidApplications } from '../lib/paymentService';

interface PaidApplication {
  id: string;
  company_name: string;
  state: string;
  user_id: string;
  payment_status: string;
  created_at: string;
  [key: string]: any;
}

interface PaymentVerificationPanelProps {
  applicationId?: string;
}

export default function PaymentVerificationPanel({ applicationId }: PaymentVerificationPanelProps) {
  const [applications, setApplications] = useState<PaidApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    loadPaidApplications();
  }, []);

  const loadPaidApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading paid applications...');
      const data = await getPaidApplications();
      console.log('Paid applications loaded:', data);
      // Filter by application if provided
      const filtered = applicationId ? data.filter((a: any) => a.id === applicationId) : data;
      setApplications(filtered as PaidApplication[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load paid applications';
      console.error('Error loading paid applications:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 dark:border-gray-700"></div>
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-transparent border-t-blue-600 absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  // Filter applications by client name or LLC name
  const filteredApplications = applications.filter((app) => {
    const clientName = (app as any).form_data?.memberName || '';
    const companyName = app.company_name || '';
    const searchLower = searchFilter.toLowerCase();
    return clientName.toLowerCase().includes(searchLower) || companyName.toLowerCase().includes(searchLower);
  });

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .badge-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          background-size: 200% 100%;
        }

        .badge-shimmer:hover {
          animation: shimmer 2s infinite;
        }

        .search-glow:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>

      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex gap-3 animate-slide-in backdrop-blur-sm">
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-red-800 dark:text-red-200 font-semibold text-sm mb-0.5">Error Loading Applications</p>
            <p className="text-red-600 dark:text-red-300 text-xs">{error}</p>
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 animate-fade-in backdrop-blur-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold mb-1">No Paid Applications</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
            Applications marked as paid will appear here
          </p>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="relative animate-fade-in">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="Search by client name or LLC name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 search-glow backdrop-blur-sm hover:border-gray-300 dark:hover:border-gray-600"
            />
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 animate-scale-in backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-700 dark:to-orange-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-1">No Results Found</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                Try adjusting your search filter
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredApplications.map((app, index) => (
                <div
                  key={app.id}
                  className={`card-hover bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-2 rounded-xl p-4 shadow-md relative overflow-hidden animate-scale-in ${
                    app.payment_status === 'advance'
                      ? 'border-blue-200 dark:border-blue-800/50'
                      : 'border-green-200 dark:border-green-800/50'
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {/* Background Gradient Overlay */}
                  <div className={`absolute inset-0 opacity-5 dark:opacity-10 ${
                    app.payment_status === 'advance'
                      ? 'bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-500'
                      : 'bg-gradient-to-br from-green-400 via-emerald-300 to-green-500'
                  }`}></div>

                  {/* Status Badge - Top Right */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 badge-shimmer backdrop-blur-sm border ${
                      app.payment_status === 'advance'
                        ? 'bg-blue-100/90 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : 'bg-green-100/90 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
                    }`}>
                      <DollarSign className="h-3 w-3" />
                      {app.payment_status === 'advance' ? 'Advance' : 'Paid'}
                    </div>
                  </div>

                  <div className="relative flex items-start gap-3">
                    {/* Check Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                      app.payment_status === 'advance'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-green-500 to-green-600'
                    }`}>
                      <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Company Name */}
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 pr-20">
                        {app.company_name}
                      </h3>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Client Name */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 mb-1">
                            <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Client</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold truncate">
                            {(app as any).form_data?.memberName || 'N/A'}
                          </p>
                        </div>

                        {/* State */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 mb-1">
                            <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">State</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold truncate">
                            {app.state}
                          </p>
                        </div>

                        {/* Date */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Date</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold truncate">
                            {new Date(app.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Accent Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    app.payment_status === 'advance'
                      ? 'bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500'
                      : 'bg-gradient-to-r from-green-400 via-emerald-400 to-green-500'
                  }`}></div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}