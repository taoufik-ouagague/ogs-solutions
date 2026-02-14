import { useNavigate } from 'react-router-dom';

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

export function usePageNavigation() {
  const navigate = useNavigate();

  const navigateToPage = (pageId: string, data?: any) => {
    const path = pageMap[pageId as PageId] || '/';
    navigate(path, { state: data || null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { navigateToPage };
}
