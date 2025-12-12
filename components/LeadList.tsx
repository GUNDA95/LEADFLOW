import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { Badge } from './ui/Badge';
import { Skeleton } from './ui/Skeleton';
import AddLeadModal from './leads/AddLeadModal';
import { 
  Search, Filter, Download, Plus, MoreHorizontal, 
  ChevronLeft, ChevronRight, ArrowUpDown, Mail, Phone, Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; // Import supabase directly if needed for fetching, though currently leads comes from props or fetching logic inside

interface LeadListProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

const LeadList: React.FC<LeadListProps> = ({ leads: initialLeads, onLeadClick }) => {
  // In a real implementation where LeadList fetches its own data, we would use state.
  // Since App.tsx currently passes [] and handles fetching or we fetch here:
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{key: keyof Lead, direction: 'asc' | 'desc'} | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch leads from Supabase directly in this component to ensure data is real
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
            const mappedLeads: Lead[] = data.map((l: any) => ({
                id: l.id,
                name: l.name,
                company: l.company,
                email: l.email,
                phone: l.phone,
                status: l.status,
                value: l.value,
                lastContact: l.last_contact || l.created_at,
                notes: l.notes,
                createdAt: l.created_at
            }));
            setLeads(mappedLeads);
        }
    } catch (error) {
        console.error('Error fetching leads:', error);
    } finally {
        setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Nuovo': return 'info';
      case 'Contattato': return 'warning';
      case 'In Negoziazione': return 'secondary';
      case 'Vinto': return 'success';
      case 'Perso': return 'destructive';
      default: return 'outline';
    }
  };

  const handleSort = (key: keyof Lead) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedLeads = React.useMemo(() => {
    if (!sortConfig) return leads;
    return [...leads].sort((a, b) => {
      // Handle potential undefined values safely
      const valA = a[sortConfig.key] ?? '';
      const valB = b[sortConfig.key] ?? '';
      
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, sortConfig]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
          <p className="text-gray-500 text-sm">Gestisci il tuo database contatti.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download size={16} className="mr-2" /> Export
          </Button>
          <Button size="sm" className="w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} className="mr-2" /> Aggiungi Lead
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cerca per nome, email, azienda..." 
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="flex-1 sm:flex-none justify-between">
             Status <Filter size={14} className="ml-2 text-gray-400" />
           </Button>
           <Button variant="outline" size="sm" className="flex-1 sm:flex-none justify-between">
             Valore <ArrowUpDown size={14} className="ml-2 text-gray-400" />
           </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block overflow-hidden" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 cursor-pointer hover:text-gray-700" onClick={() => handleSort('name')}>
                  Nome {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 cursor-pointer hover:text-gray-700" onClick={() => handleSort('status')}>
                  Status
                </th>
                <th className="px-6 py-3 cursor-pointer hover:text-gray-700 text-right" onClick={() => handleSort('value')}>
                  Valore
                </th>
                <th className="px-6 py-3">Contatti</th>
                <th className="px-6 py-3 cursor-pointer hover:text-gray-700" onClick={() => handleSort('lastContact')}>
                  Ultimo Contatto
                </th>
                <th className="px-6 py-3 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedLeads.length === 0 ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                        Nessun lead trovato. Aggiungine uno nuovo!
                    </td>
                 </tr>
              ) : (
                sortedLeads.map((lead) => (
                    <tr 
                    key={lead.id} 
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => onLeadClick(lead)}
                    >
                    <td className="px-6 py-4">
                        <div>
                        <div className="font-medium text-gray-900">{lead.name}</div>
                        <div className="text-gray-500 text-xs">{lead.company}</div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                        €{lead.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex gap-2 text-gray-400">
                        <div className="hover:text-gray-600 p-1" onClick={e => e.stopPropagation()}><Mail size={16} /></div>
                        <div className="hover:text-gray-600 p-1" onClick={e => e.stopPropagation()}><Phone size={16} /></div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                        {new Date(lead.lastContact).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600" onClick={e => e.stopPropagation()}>
                        <MoreHorizontal size={18} />
                        </button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span>Mostrando {leads.length} risultati</span>
          <div className="flex gap-1">
             <Button variant="outline" size="sm" disabled><ChevronLeft size={16} /></Button>
             <Button variant="outline" size="sm" disabled><ChevronRight size={16} /></Button>
          </div>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden grid gap-4">
        {sortedLeads.map((lead) => (
          <Card key={lead.id} className="p-4 cursor-pointer" onClick={() => onLeadClick(lead)}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                <p className="text-sm text-gray-500">{lead.company}</p>
              </div>
              <button className="text-gray-400">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
              <span className="text-sm font-bold text-gray-900 ml-auto">€{lead.value.toLocaleString()}</span>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
               <span className="text-xs text-gray-400">Ultimo: {new Date(lead.lastContact).toLocaleDateString()}</span>
               <div className="flex gap-2">
                 <Button variant="secondary" size="sm"><Mail size={16} /></Button>
                 <Button variant="secondary" size="sm"><Sparkles size={16} className="text-purple-600" /></Button>
               </div>
            </div>
          </Card>
        ))}
      </div>

      <AddLeadModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchLeads}
      />
    </div>
  );
};

export default LeadList;