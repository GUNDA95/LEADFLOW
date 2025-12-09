import React from 'react';
import { LayoutDashboard, Users, Zap, Settings, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { signOut, user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'intelligence', label: 'AI Intelligence', icon: Zap },
    { id: 'analytics', label: 'Analisi', icon: BarChart3 },
    { id: 'settings', label: 'Impostazioni', icon: Settings },
  ];

  // Get user initials
  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'JD';
  // Try to get metadata name if available
  const fullName = user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
    : user?.email || 'Utente LeadFlow';

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 hidden md:flex">
      <div className="p-6 flex items-center gap-2 border-b border-gray-100">
        <div className="bg-primary-600 text-white p-1.5 rounded-lg">
          <Zap size={20} fill="currentColor" />
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900">LeadFlow</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-50 border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate" title={fullName}>{fullName}</p>
            <p className="text-xs text-gray-500 truncate">Utente</p>
          </div>
          <button onClick={() => signOut()} title="Logout">
            <LogOut size={16} className="text-gray-400 cursor-pointer hover:text-red-600 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;