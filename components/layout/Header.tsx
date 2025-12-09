import React from 'react';
import { Bell, Menu, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  activeTab: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onMenuClick }) => {
  const { user } = useAuth();
  
  // Format tab name for breadcrumb
  const pageTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ');

  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'LF';

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center text-sm text-gray-500">
          <span className="hover:text-gray-900 cursor-pointer">App</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="font-semibold text-gray-900">{pageTitle}</span>
        </nav>
        
        {/* Mobile Title (visible when breadcrumb hidden) */}
        <span className="md:hidden font-semibold text-gray-900">{pageTitle}</span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search Bar - Hidden on small mobile */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Cerca..." 
            className="h-9 w-64 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>

        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-8 w-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-xs font-bold text-primary-700 cursor-pointer hover:ring-2 hover:ring-primary-100 transition-all">
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Header;