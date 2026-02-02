import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { queryCollection } from '../lib/firebaseUtils';
import { where } from 'firebase/firestore';
import { US_STATES } from '../utils/constants';

interface LLCApplication {
  id: string;
  user_id: string;
  package_id: string;
  state: string;
  company_name: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  form_data: Record<string, unknown>;
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const [applications, setApplications] = useState<LLCApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set(prev).add(entry.target.id));
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    const scrollElements = document.querySelectorAll('[data-scroll]');
    scrollElements.forEach(el => {
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadApplications();
    } else if (!authLoading && !user) {
      onNavigate('auth');
    }
  }, [user, authLoading, onNavigate]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const apps = await queryCollection<LLCApplication>('llc_applications', [
        where('user_id', '==', user!.uid),
      ]);
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin-slow" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800';
      case 'processing':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';
      default:
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 font-bold';
      case 'failed':
        return 'text-red-600 dark:text-red-400 font-bold';
      default:
        return 'text-yellow-600 dark:text-yellow-400 font-bold';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 dark:border-blue-400 absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400">Please log in to view your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAydjJ6bTAtMnYyem0yIDB2MnptLTIgMHYyem0yIDB2MnptLTIgMHYyem0yIDB2MnptLTIgMHYyem0yIDB2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/30 mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Welcome Back!</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                My Dashboard
              </h1>
              <p className="text-xl md:text-2xl text-blue-50">
                Track your LLC formation applications
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onNavigate('contact')}
                className="group px-6 py-3 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <User className="h-5 w-5" />
                <span>Contact Admin</span>
              </button>
              <button
                onClick={handleSignOut}
                className="group px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" className="fill-gray-50 dark:fill-gray-900"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {loading ? (
          <div className="text-center py-32">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 dark:border-blue-400 absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center border border-gray-100 dark:border-gray-700" id="empty-state" data-scroll>
            <div className={`transition-all duration-1000 ${visibleSections.has('empty-state') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-6">
                <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                No Applications Yet
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                You haven't submitted any LLC formation applications yet. Start your business journey today!
              </p>
              <button
                onClick={() => onNavigate('get-started')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center space-x-2"
              >
                <span>Start Your First Application</span>
                <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Applications List */}
            <div className="space-y-6 mb-12" id="applications-list" data-scroll>
              {applications.map((app, index) => (
                <div
                  key={app.id}
                  className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-700 border border-gray-100 dark:border-gray-700 ${
                    visibleSections.has('applications-list')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    transitionDelay: visibleSections.has('applications-list') 
                      ? `${index * 150}ms` 
                      : '0ms'
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                          {app.company_name}
                        </h3>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(app.status)} inline-flex items-center space-x-2`}>
                          {getStatusIcon(app.status)}
                          <span>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">State</p>
                          <p className="font-bold text-lg text-gray-900 dark:text-white">
                            {US_STATES.find((s) => s.code === app.state)?.name}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">Order Status</p>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(app.status)}
                            <span className="font-bold text-lg text-gray-900 dark:text-white">
                              {app.status === 'completed' && 'Completed'}
                              {app.status === 'processing' && 'In Progress'}
                              {app.status === 'pending' && 'Pending'}
                              {app.status === 'rejected' && 'Attention'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-4 rounded-xl border border-green-200 dark:border-green-800">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">Payment</p>
                          <p className={`text-lg ${getPaymentStatusColor(app.payment_status)}`}>
                            {app.payment_status.charAt(0).toUpperCase() + app.payment_status.slice(1)}
                          </p>
                        </div>
                      </div>

                      <div className={`p-6 rounded-2xl ${getStatusColor(app.status)}`}>
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {getStatusIcon(app.status)}
                          </div>
                          <div>
                            <p className="font-bold text-lg mb-1">
                              {app.status === 'completed' && '✅ Application Completed'}
                              {app.status === 'processing' && '⏳ Processing Application'}
                              {app.status === 'pending' && '⏱️ Awaiting Review'}
                              {app.status === 'rejected' && '❌ Requires Attention'}
                            </p>
                            <p className="text-sm opacity-90">
                              {app.status === 'completed' && 'Your LLC has been successfully formed! Congratulations on your new business!'}
                              {app.status === 'processing' && 'Your application is being processed. We will notify you of any updates soon.'}
                              {app.status === 'pending' && 'Your application is pending review. Please ensure payment is completed to proceed.'}
                              {app.status === 'rejected' && 'Your application needs attention. Please contact our support team for assistance.'}
                            </p>
                            <p className="text-xs mt-2 opacity-75">
                              Submitted on {new Date(app.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {app.payment_status === 'pending' && (
                      <div className="lg:w-64">
                        <button className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105">
                          Complete Payment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="stats" data-scroll>
              {[
                {
                  icon: FileText,
                  title: 'Total Applications',
                  value: applications.length,
                  color: 'from-blue-500 to-cyan-500',
                  bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
                  borderColor: 'border-blue-200 dark:border-blue-800'
                },
                {
                  icon: CheckCircle,
                  title: 'Completed',
                  value: applications.filter((app) => app.status === 'completed').length,
                  color: 'from-green-500 to-emerald-500',
                  bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                  borderColor: 'border-green-200 dark:border-green-800'
                },
                {
                  icon: Clock,
                  title: 'In Progress',
                  value: applications.filter((app) => ['pending', 'processing'].includes(app.status)).length,
                  color: 'from-yellow-500 to-orange-500',
                  bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
                  borderColor: 'border-yellow-200 dark:border-yellow-800'
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-8 text-center border ${stat.borderColor} transition-all duration-700 hover:scale-105 hover:shadow-xl ${
                    visibleSections.has('stats')
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    transitionDelay: visibleSections.has('stats') 
                      ? `${index * 150}ms` 
                      : '0ms'
                  }}
                >
                  <div className={`bg-gradient-to-br ${stat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{stat.title}</h3>
                  <p className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
          }
          50% { 
            transform: translateY(-30px) translateX(15px); 
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
          }
          50% { 
            transform: translateY(30px) translateX(-15px); 
          }
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}