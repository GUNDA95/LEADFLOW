import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabaseClient';
import { Lead } from '../../types';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: Date;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ isOpen, onClose, onSuccess, selectedDate }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingLeads, setFetchingLeads] = useState(false);
  const [leads, setLeads] = useState<Partial<Lead>[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '09:00',
    duration: '60',
    type: 'meeting',
    leadId: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Set default date if provided
      if (selectedDate) {
        setFormData(prev => ({
            ...prev,
            date: selectedDate.toISOString().split('T')[0]
        }));
      }
      fetchLeads();
    }
  }, [isOpen, selectedDate]);

  const fetchLeads = async () => {
    setFetchingLeads(true);
    const { data } = await supabase.from('leads').select('id, name, company').order('created_at', { ascending: false }).limit(50);
    if (data) setLeads(data);
    setFetchingLeads(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate start and end times
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);

      const selectedLead = leads.find(l => l.id === formData.leadId);

      const { error } = await supabase.from('appointments').insert([{
        title: formData.title,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        type: formData.type,
        status: 'scheduled',
        lead_id: formData.leadId || null,
        lead_name: selectedLead ? selectedLead.name : null
      }]);

      if (error) throw error;

      addToast('Appuntamento programmato!', 'success');
      onSuccess();
      onClose();
      // Reset form (keep date for convenience?)
      setFormData(prev => ({ ...prev, title: '', leadId: '' }));
    } catch (error: any) {
      console.error(error);
      addToast('Errore durante il salvataggio.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuovo Appuntamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Cliente (Opzionale)</label>
          <select 
            id="leadId"
            value={formData.leadId}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">-- Seleziona Lead --</option>
            {leads.map(lead => (
              <option key={lead.id} value={lead.id}>
                {lead.name} {lead.company ? `(${lead.company})` : ''}
              </option>
            ))}
          </select>
          {fetchingLeads && <span className="text-xs text-gray-400">Caricamento lead...</span>}
        </div>

        <Input 
          id="title" 
          label="Titolo Evento *" 
          placeholder="Es. Demo Prodotto" 
          value={formData.title} 
          onChange={handleChange}
          required 
        />

        <div className="grid grid-cols-2 gap-4">
           <Input 
             id="date" 
             type="date" 
             label="Data *" 
             value={formData.date} 
             onChange={handleChange}
             required 
           />
           <Input 
             id="time" 
             type="time" 
             label="Ora Inizio *" 
             value={formData.time} 
             onChange={handleChange}
             required 
           />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <Select
             id="duration"
             label="Durata"
             value={formData.duration}
             onChange={handleChange}
             options={[
               { value: '15', label: '15 min' },
               { value: '30', label: '30 min' },
               { value: '45', label: '45 min' },
               { value: '60', label: '1 ora' },
               { value: '90', label: '1.5 ore' },
               { value: '120', label: '2 ore' },
             ]}
           />
           <Select
             id="type"
             label="Tipo"
             value={formData.type}
             onChange={handleChange}
             options={[
               { value: 'meeting', label: 'Incontro' },
               { value: 'call', label: 'Chiamata' },
               { value: 'demo', label: 'Demo' },
             ]}
           />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Annulla</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="animate-spin mr-2" size={16} />}
            Salva
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAppointmentModal;