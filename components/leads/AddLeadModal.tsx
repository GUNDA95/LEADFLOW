import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabaseClient';
import { isValidEmail } from '../../lib/utils';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'Nuovo',
    value: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    if (e.target.id === 'email') setEmailError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailError(null);

    // Strict Email Validation
    if (!isValidEmail(formData.email)) {
        setEmailError("Inserisci una email valida");
        setLoading(false);
        return;
    }

    try {
      // Try to insert into Supabase
      const { error } = await supabase.from('leads').insert([{ 
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        value: formData.value ? parseFloat(formData.value) : 0,
        notes: formData.notes
      }]);

      if (error) {
        // If the table doesn't exist, we fallback to mock success but warn the user 
        // (This is common if migrations haven't run)
        console.warn("Supabase insert failed (likely missing table), falling back to UI simulation:", error);
        throw error;
      }
      
      addToast('Lead creato con successo!', 'success');
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'Nuovo',
        value: '',
        notes: ''
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      // Fallback behavior for demo if table is missing
      if (error.code === '42P01') { // undefined_table
         addToast('Lead creato (simulazione: tabella mancante)', 'warning');
         onSuccess();
         onClose();
      } else {
         addToast('Errore nel salvataggio del lead.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aggiungi Nuovo Lead">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            id="name" 
            label="Nome Completo *" 
            placeholder="Mario Rossi" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
          <Input 
            id="company" 
            label="Azienda" 
            placeholder="Rossi Srl" 
            value={formData.company}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            id="email" 
            type="email"
            label="Email *" 
            placeholder="mario@rossi.it" 
            value={formData.email}
            onChange={handleChange}
            required 
            error={emailError || undefined}
          />
          <Input 
            id="phone" 
            type="tel"
            label="Telefono" 
            placeholder="+39 333..." 
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select 
            id="status" 
            label="Stato" 
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'Nuovo', label: 'Nuovo' },
              { value: 'Contattato', label: 'Contattato' },
              { value: 'In Negoziazione', label: 'In Negoziazione' },
              { value: 'Vinto', label: 'Vinto' },
              { value: 'Perso', label: 'Perso' }
            ]} 
          />
          <Input 
            id="value" 
            type="number"
            label="Valore Stimato (€)" 
            placeholder="0" 
            value={formData.value}
            onChange={handleChange}
          />
        </div>

        <Textarea 
          id="notes" 
          label="Note Iniziali" 
          placeholder="Dettagli aggiuntivi..." 
          value={formData.notes}
          onChange={handleChange}
          rows={3}
        />

        <div className="pt-4 flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Annulla</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="animate-spin mr-2" size={16} />}
            Salva Lead
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLeadModal;