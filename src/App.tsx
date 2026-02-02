import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TranslationProvider } from './contexts/TranslationContext';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AIChatAgent from './components/AIChatAgent';
import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import GetStartedPage from './pages/GetStartedPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminSetupPage from './pages/AdminSetupPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

type Page = 'home' | 'services' | 'how-it-works' | 'contact' | 'get-started' | 'dashboard' | 'auth' | 'admin-login' | 'admin-setup' | 'admin-dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const savedPage = localStorage.getItem('currentPage') as Page;
    return savedPage || 'home';
  });
  const [pageData, setPageData] = useState<unknown>(null);
  const [showSplash, setShowSplash] = useState(true);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  const handleNavigate = (page: string, data?: unknown) => {
    setCurrentPage(page as Page);
    setPageData(data || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} />;
      case 'how-it-works':
        return <HomePage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage />;
      case 'get-started':
        return <GetStartedPage onNavigate={handleNavigate} selectedPackage={pageData as any} />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'auth':
        return <AuthPage onNavigate={handleNavigate} />;
      case 'admin-login':
        return <AdminLoginPage onNavigate={handleNavigate} />;
      case 'admin-setup':
        return <AdminSetupPage onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ThemeProvider>
      <TranslationProvider>
        <AuthProvider>
          <AdminAuthProvider>
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
              <Header onNavigate={handleNavigate} currentPage={currentPage} />
              <main>{renderPage()}</main>
              <Footer onNavigate={handleNavigate} />
              <WhatsAppButton />
              <AIChatAgent onNavigate={handleNavigate} />
            </div>
          </AdminAuthProvider>
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}

export default App;
