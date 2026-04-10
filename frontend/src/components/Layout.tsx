import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../lib/api';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { href: '/clients', label: 'Clients', icon: '👥' },
  { href: '/obligations', label: 'Obligations', icon: '📋' },
  { href: '/juridical', label: 'Juridique', icon: '⚖️' },
  { href: '/invoices', label: 'Facturation', icon: '💰' },
  { href: '/settings', label: 'Paramètres', icon: '⚙️' },
];

interface User {
  firstName: string;
  lastName: string;
  role: string;
  cabinet: { name: string };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get<{ user: User }>('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => router.push('/login'));

    api.get<{ alerts: any[] }>('/alerts')
      .then((d) => setAlertCount(d.alerts.filter((a) => !a.isRead).length))
      .catch(() => {});
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 text-white flex flex-col transition-all duration-200`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
          {sidebarOpen && (
            <div>
              <span className="text-xl font-bold text-blue-400">TaxBox</span>
              {user && <p className="text-xs text-slate-400 mt-0.5 truncate">{user.cabinet?.name}</p>}
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white p-1"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1">
          {navItems.map((item) => {
            const active = router.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && item.href === '/dashboard' && alertCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {alertCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-slate-700 p-4">
          {sidebarOpen && user && (
            <div className="mb-3">
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            <span>🚪</span>
            {sidebarOpen && 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
