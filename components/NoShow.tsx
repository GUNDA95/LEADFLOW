import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Badge } from './ui/Badge';
import { UserX, RefreshCw, Calendar, Trash2, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import AIMessageModal from './ai/AIMessageModal';
import { Lead } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../contexts/ToastContext';
import AddAppointmentModal from './appointments/AddAppointmentModal';

const NoShow: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [kpi, setKpi] = useState({ rate: 0, recovered: 0, revenueAtRisk: 0 });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  useEffect(() => {
    fetchNoShowData();
  }, []);

  const fetchNoShowData = async () => {
    setLoading(true);
    try {
        // 1. Fetch appointments marked as 'noshow'
        // We join with leads to get customer details
        const { data: noShows, error } = await supabase
            .from('appointments')
            .select(`
                id,
                start_time,
                lead:leads (id, name, company, email, phone, value, status, notes)
            `)
            .eq('status', 'noshow');

        if (error) throw error;

        // Map to flat Lead objects for display
        const mappedLeads: Lead[] = [];
        let riskValue = 0;

        noShows?.forEach((item: any) => {
            if (item.lead) {
                mappedLeads.push({
                    id: item.lead.id, // Keeping lead ID, could be appointment ID if we want to act on appt
                    name: item.lead.name,
                    company: item.lead.company,
                    email: item.lead.email,
                    phone: item.lead.phone,
                    status: item.lead.status,
                    value: item.lead.value,
                    lastContact: item.start_time, // Using the missed appointment date
                    notes: `No-Show all'appuntamento del ${new Date(item.start_time).toLocaleDateString()}`
                });
                riskValue += (item.lead.value || 0);
            }
        });

        setLeads(mappedLeads);
        
        // Mocking Rate for now as it requires total appointments count
        setKpi({
            rate: 12.5, // Could be calculated if we fetch all appointments count
            recovered: 0,
            revenueAtRisk: riskValue
        });

    } catch (error) {
        console.error("Error fetching no-shows:", error);
        addToast("Errore nel caricamento dei dati No-Show", "error");
    } finally {
        setLoading(false);
    }
  };

  const handleRecoverClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsMsgModalOpen(true);
  };

  const handleRescheduleClick = (lead: Lead) => {
      setSelectedLead(lead);
      setIsRescheduleModalOpen(true);
  };

  const handleArchive = async (leadId: string) => {
    // In real scenario, we might want to update the appointment status to 'canceled' or 'archived'
    // For now, we just remove from view to simulate archiving
    setLeads(prev => prev.filter(l => l.id !== leadId));
    addToast("Lead archiviato dalla lista No-Show", "success");
  };

  if (loading) {
      return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary-600" size={32} /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserX className="text-red-500" />
            Gestione No-Show
          </h2>
          <p className="text-gray-500 text-sm">Recupera i lead che hanno mancato l'appuntamento.</p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tasso No-Show</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.rate}%</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <RefreshCw size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Recuperati</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.recovered}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full text-orange-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Revenue a Rischio</p>
            <p className="text-2xl font-bold text-gray-900">€{kpi.revenueAtRisk.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      {/* Filters & Automations Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <RefreshCw size={16} />
            </div>
            <div>
                <h4 className="font-semibold text-blue-900 text-sm">Automazione Recupero Attiva</h4>
                <p className="text-xs text-blue-700">Il sistema invia un SMS dopo 15 min dal no-show.</p>
            </div>
        </div>
        <Button variant="outline" size="sm" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
            Configura Automazione
        </Button>
      </div>

      {/* No-Show List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {leads.map(lead => (
          <Card key={lead.id} className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{lead.name}</h3>
                <p className="text-sm text-gray-500">{lead.company}</p>
              </div>
              <Badge variant="destructive">No-Show</Badge>
            </div>
            
            <div className="space-y-2 mb-6 flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} />
                <span>Mancato: {new Date(lead.lastContact).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserX size={14} />
                <span>Valore: €{lead.value.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 italic mt-2 bg-gray-50 p-2 rounded">
                "{lead.notes}"
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              <Button onClick={() => handleRecoverClick(lead)} className="w-full bg-green-600 hover:bg-green-700 text-white">
                <MessageSquare size={16} className="mr-2" /> Recupera con AI
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleRescheduleClick(lead)}>
                    <Calendar size={16} className="mr-2" /> Riprogramma
                </Button>
                <Button variant="ghost" className="text-gray-400 hover:text-red-500" onClick={() => handleArchive(lead.id)}>
                    <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {leads.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400">
                <UserX size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nessun lead in stato No-Show.</p>
                <p className="text-sm mt-2">Segna un appuntamento come "No-Show" dal calendario per vederlo qui.</p>
            </div>
        )}
      </div>

      {selectedLead && (
        <AIMessageModal 
          isOpen={isMsgModalOpen}
          onClose={() => setIsMsgModalOpen(false)}
          lead={selectedLead}
        />
      )}

      {selectedLead && (
         <AddAppointmentModal 
            isOpen={isRescheduleModalOpen}
            onClose={() => setIsRescheduleModalOpen(false)}
            onSuccess={() => {
                fetchNoShowData();
                addToast("Appuntamento riprogrammato", "success");
            }}
            // We pass selectedDate as tomorrow default? Or let modal handle default
         />
      )}
    </div>
  );
};

export default NoShow;