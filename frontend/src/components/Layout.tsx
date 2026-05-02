import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { FileText, LogOut, UploadCloud, History, FileSpreadsheet } from 'lucide-react';
import clsx from 'clsx';

export default function Layout({ children, title }: { children: ReactNode, title: string }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { name: 'New Scan', path: '/dashboard', icon: UploadCloud },
    { name: 'Table to Excel', path: '/table-extract', icon: FileSpreadsheet },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-outline-variant/30">
          <FileText className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold font-sans">PrecisionOCR</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-on-surface/70 hover:bg-surface-container hover:text-on-surface"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-outline-variant/30">
          <div className="mb-4 px-4 text-sm text-on-surface/60 truncate">
            {user?.email}
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-outline-variant/30 flex items-center px-8 bg-surface-container-lowest shrink-0">
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
