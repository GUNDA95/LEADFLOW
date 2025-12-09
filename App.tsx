import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './components/Dashboard';
import LeadList from './components/LeadList';
import LeadDetail from './components/leads/LeadDetail';
import AppointmentsCalendar from './components/appointments/AppointmentsCalendar';
import AIAssistant from './components/AIAssistant';
import NoShow from './components/NoShow';
import Automations from './components/Automations';
import Settings from './components/Settings';
import Analytics from './components/Analytics';
import { Lead, AuthRoute } from './types';
import { Loader2, Wrench } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import VerifyEmail from './components/auth/VerifyEmail';
import OnboardingFlow from './components/onboarding/OnboardingFlow';

const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Giulia Bianchi',
    company: 'Tech Solutions SpA',
    email: 'giulia.b@techsolutions.it',
    phone: '+39 333 9876543',
    status: 'In Negoziazione',
    value: 12500,
    lastContact: '2023-10-25T10:00:00Z',
    notes: 'Interessata al piano Enterprise. Ha richiesto demo tecnica.'
  },
  {
    id: '2',
    name: 'Marco Verdi',
    company: 'Green Energy Srl',
    email: 'm.verdi@greenenergy.com',
    phone: '+39 340 1234567',
    status: 'Nuovo',
    value: 5400,
    lastContact: '2023-10-27T09:30:00Z',
    notes: 'Contattato via LinkedIn. In attesa di risposta.'
  },
  {
    id: '3',
    name: 'Elena Rossi',
    company: 'Marketing Pro',
    email: 'elena@marketingpro.it',
    phone: '+39 328 5554444',
    status: 'Vinto',
    value: 8200,
    lastContact: '2023-10-20T14:15:00Z',
    notes: 'Contratto firmato. Onboarding programmato per lunedì.'
  },
  {
    id: '4',
    name: 'Luca Neri',
    company: 'Consulting Group',
    email: 'l.neri@consulting.it',
    phone: '+39 335 1112233',
    status: 'Contattato',
    value: 15000,
    lastContact: '2023-10-26T16:45:00Z',
    notes: 'Ha dubbi sul prezzo. Necessita di call con il manager.'
  },
  {
    id: '5',
    name: 'Sofia Gialli',
    company: 'StartUp Innovativa',
    email: 'sofia@startup.io',
    phone: '+39 339 9988777',
    status: 'Perso',
    value: 3000,
    lastContact: '2023-10-15T11:20:00Z',
    notes: 'Budget insufficiente per quest\'anno.'
  }
];

const AppContent: React.FC = () => {
  const { session, loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authRoute, setAuthRoute] = useState<AuthRoute>('login');
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // View State for sub-pages
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Dev mode helper
  const forceOnboarding = () => setShowOnboarding(true);

  useEffect(() => {
    // Determine if onboarding should be shown based on user metadata
    // We only check this if the user is confirmed
    if (session && user && user.email_confirmed_at) {
       const isOnboarded = user.user_metadata?.onboarding_completed;
       setShowOnboarding(!isOnboarded);
    }
  }, [session, user]);

  // Handle Tab Switch (reset sub-views)
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedLeadId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  // Auth Pages
  if (!session) {
    switch (authRoute) {
      case 'register': return <Register onNavigate={setAuthRoute} />;
      case 'forgot-password': return <ForgotPassword onNavigate={setAuthRoute} />;
      default: return <Login onNavigate={setAuthRoute} />;
    }
  }

  // --- SECURITY GATE: EMAIL VERIFICATION ---
  // If user is logged in but email is not confirmed, block access.
  // Exception: Social logins (like Google) often auto-confirm, but if it's not confirmed, we still block.
  if (user && !user.email_confirmed_at) {
    return <VerifyEmail />;
  }

  // Onboarding
  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  // Main App Content Switcher
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'leads':
        if (selectedLeadId) {
          const lead = MOCK_LEADS.find(l => l.id === selectedLeadId);
          // In real app, we might need to fetch the single lead if not in the mock list
          // For now, if mock lead exists use it, otherwise pass null or handle fetch
          return <LeadDetail lead={lead || {} as Lead} onBack={() => setSelectedLeadId(null)} />;
        }
        return <LeadList leads={[]} onLeadClick={(lead) => setSelectedLeadId(lead.id)} />; 
        // Note: LeadList fetches its own leads now, passing [] as initial props is fine
      case 'appointments':
        return <AppointmentsCalendar />;
      case 'no-show':
        return <NoShow />;
      case 'automations':
        return <Automations />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        // Use AI Assistant as a fallback
        return <AIAssistant />; 
    }
  };

  return (
    <div className="relative font-sans text-slate-900">
      <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
        {renderContent()}
      </Layout>

      {/* DEV TOOLS */}
      <div className="fixed bottom-4 left-4 z-[60] md:block hidden group">
        <div className="bg-gray-900 text-white p-2 rounded-full shadow-lg opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          <Wrench size={16} />
        </div>
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 p-2 hidden group-hover:block">
           <p className="text-xs font-bold text-gray-500 mb-2 px-2">DEV TOOLS</p>
           <button onClick={forceOnboarding} className="w-full text-left text-xs p-2 hover:bg-gray-100 rounded text-gray-700">
             Restart Onboarding Flow
           </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;