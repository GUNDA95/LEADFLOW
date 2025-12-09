import React, { useState } from 'react';
import { Lead, Activity, Appointment } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';
import { Badge } from '../ui/Badge';
import AIMessageModal from '../ai/AIMessageModal';
import { 
  ArrowLeft, Phone, Mail, MessageSquare, Calendar, Clock, 
  MoreHorizontal, MapPin, Globe, Linkedin, FileText, CheckCircle2 
} from 'lucide-react';

interface LeadDetailProps {
  lead: Lead;
  onBack: () => void;
}

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', type: 'call', title: 'Chiamata conoscitiva', description: 'Interesse alto, budget confermato.', date: '2023-10-27T10:30:00' },
  { id: '2', type: 'email', title: 'Invio Preventivo', description: 'Inviato PDF offerta #2023-44', date: '2023-10-26T15:45:00' },
  { id: '3', type: 'system', title: 'Status cambiato', description: 'Da "Nuovo" a "In Negoziazione"', date: '2023-10-26T15:00:00' },
];

const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onBack }) => {
  const [activeTab, setActiveTab] = useState('activities');
  const [isAIMessageOpen, setIsAIMessageOpen] = useState(false);

  return (
    <div className="space-y-6 pb-24 md:pb-0 animate-in slide-in-from-right-4 fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {lead.name}
              <Badge variant="outline">{lead.status}</Badge>
            </h1>
            <p className="text-gray-500">{lead.company}</p>
          </div>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none">
            <Calendar size={16} className="mr-2" /> Appuntamento
          </Button>
          <Button 
            className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 border-none text-white hover:opacity-90"
            onClick={() => setIsAIMessageOpen(true)}
          >
            <MessageSquare size={16} className="mr-2" /> AI Message
          </Button>
          <Button variant="secondary" className="px-3">
            <MoreHorizontal size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs 
            activeTab={activeTab} 
            onChange={setActiveTab}
            tabs={[
              { id: 'activities', label: 'Attività', icon: <Clock size={16} /> },
              { id: 'notes', label: 'Note', icon: <FileText size={16} /> },
              { id: 'files', label: 'File', icon: <FileText size={16} /> },
            ]} 
          />

          <Card className="min-h-[400px]">
             {activeTab === 'activities' && (
               <div className="space-y-6">
                 {MOCK_ACTIVITIES.map((activity, idx) => (
                   <div key={activity.id} className="relative pl-6 pb-6 last:pb-0 border-l border-gray-200 ml-2">
                     <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                       activity.type === 'call' ? 'bg-green-500' :
                       activity.type === 'email' ? 'bg-blue-500' : 'bg-gray-400'
                     }`} />
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="font-semibold text-sm text-gray-900">{activity.title}</p>
                         <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                       </div>
                       <span className="text-xs text-gray-400">
                         {new Date(activity.date).toLocaleDateString()}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             )}
             {activeTab === 'notes' && (
                <div className="prose prose-sm max-w-none text-gray-600">
                    <p>{lead.notes || "Nessuna nota presente."}</p>
                </div>
             )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Info Contatto</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <Mail size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="font-medium text-gray-900 truncate" title={lead.email}>{lead.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Telefono</p>
                  <p className="font-medium text-gray-900">{lead.phone || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Città</p>
                  <p className="font-medium text-gray-900">Milano, IT</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
             <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Deal Info</h3>
             <div className="space-y-3">
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Valore Stimato</span>
                   <span className="font-bold text-gray-900">€{lead.value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Probabilità</span>
                   <span className="font-medium text-green-600">60%</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Chiusura Prevista</span>
                   <span className="text-gray-900">30 Nov 2023</span>
                </div>
             </div>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed md:hidden bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-20 flex gap-2">
         <Button variant="outline" className="flex-1">
            <Calendar size={18} />
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => window.open(`tel:${lead.phone}`)}>
            <Phone size={18} />
          </Button>
          <Button 
            className="flex-[2] bg-purple-600 text-white"
            onClick={() => setIsAIMessageOpen(true)}
          >
            <MessageSquare size={18} className="mr-2" /> AI Msg
          </Button>
      </div>

      <AIMessageModal 
        isOpen={isAIMessageOpen} 
        onClose={() => setIsAIMessageOpen(false)} 
        lead={lead} 
      />
    </div>
  );
};

export default LeadDetail;