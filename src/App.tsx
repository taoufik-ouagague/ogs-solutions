import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { loadGitHubConfig, validateGitHubConfig } from './lib/githubConfig';
import * as GitHubStorage from './lib/githubStorage';
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

type PageId = 'home' | 'services' | 'how-it-works' | 'contact' | 'get-started' | 'dashboard' | 'auth' | 'admin-login' | 'admin-setup' | 'admin-dashboard';

const pageMap: Record<PageId, string> = {
  'home': '/',
  'services': '/services',
  'how-it-works': '/how-it-works',
  'contact': '/contact',
  'get-started': '/get-started',
  'dashboard': '/dashboard',
  'auth': '/auth',
  'admin-login': '/admin/login',
  'admin-setup': '/admin/setup',
  'admin-dashboard': '/admin/dashboard',
};

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const routerNavigate = useNavigate();

  // Create a navigation function that works with both old-style page IDs and new URLs
  const handleNavigate = useCallback((page: string, data?: unknown) => {
    const path = pageMap[page as PageId] || '/';
    routerNavigate(path, { state: data || null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [routerNavigate]);

  useEffect(() => {
    const githubConfig = loadGitHubConfig();
    if (githubConfig.enabled) {
      const validation = validateGitHubConfig(githubConfig);
      if (validation.valid) {
        GitHubStorage.initializeGitHubStorage({
          owner: githubConfig.owner,
          repo: githubConfig.repo,
          token: githubConfig.token,
          branch: githubConfig.branch,
        });
        console.log('✅ GitHub storage initialized');
      }
    }
  }, []);

  return (
    <ThemeProvider>
      <TranslationProvider>
        <AuthProvider>
          <AdminAuthProvider>
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors flex flex-col">
              <Header onNavigate={handleNavigate} />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
                  <Route path="/services" element={<ServicesPage onNavigate={handleNavigate} />} />
                  <Route path="/how-it-works" element={<HomePage onNavigate={handleNavigate} />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/get-started" element={<GetStartedPage onNavigate={handleNavigate} />} />
                  <Route path="/dashboard" element={<DashboardPage onNavigate={handleNavigate} />} />
                  <Route path="/auth" element={<AuthPage onNavigate={handleNavigate} />} />
                  <Route path="/admin/login" element={<AdminLoginPage onNavigate={handleNavigate} />} />
                  <Route path="/admin/setup" element={<AdminSetupPage onNavigate={handleNavigate} />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage onNavigate={handleNavigate} />} />
                </Routes>
              </main>
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

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
