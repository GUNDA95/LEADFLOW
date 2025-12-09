import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle, XCircle, UserX, Trash2, Loader2, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Appointment } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface AppointmentActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onUpdate: () => void;
}

const AppointmentActionModal: React.FC<AppointmentActionModalProps> = ({ isOpen, onClose, appointment, onUpdate }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!appointment) return null;

  const handleStatusChange = async (newStatus: 'completed' | 'noshow' | 'canceled') => {
    setLoading(true);
    try {
      // 1. Update in Supabase
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointment.id);

      if (error) throw error;

      // 2. Logic for Google Calendar Sync could go here (e.g. updating title)
      
      addToast(`Stato aggiornato a: ${newStatus}`, 'success');
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      addToast('Errore durante l\'aggiornamento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isGoogleEvent = !appointment.leadId && appointment.leadName === 'Google Calendar';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dettagli Appuntamento">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{appointment.title}</h3>
          <div className="flex items-center gap-2 mt-2">
             <Badge variant="outline">{appointment.type}</Badge>
             <span className="text-sm text-gray-500">
               {appointment.start.toLocaleDateString()} • {appointment.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
          </div>
        </div>

        {appointment.leadName && (
             <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                 <p className="text-xs text-gray-500 uppercase font-semibold">Cliente</p>
                 <p className="font-medium text-gray-900">{appointment.leadName}</p>
             </div>
        )}

        {isGoogleEvent && (
            <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-center gap-2">
                <Calendar size={16} />
                Questo è un evento esterno di Google Calendar.
            </div>
        )}

        <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Cambia Stato:</p>
            <div className="grid grid-cols-3 gap-3">
                <button 
                    onClick={() => handleStatusChange('completed')}
                    disabled={loading || appointment.status === 'completed'}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 ${appointment.status === 'completed' ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700'}`}
                >
                    <CheckCircle size={24} />
                    <span className="text-xs font-medium">Completato</span>
                </button>

                <button 
                    onClick={() => handleStatusChange('noshow')}
                    disabled={loading || appointment.status === 'noshow'}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 ${appointment.status === 'noshow' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' : 'bg-white border-gray-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700'}`}
                >
                    <UserX size={24} />
                    <span className="text-xs font-medium">No-Show</span>
                </button>

                <button 
                    onClick={() => handleStatusChange('canceled')}
                    disabled={loading || appointment.status === 'canceled'}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 ${appointment.status === 'canceled' ? 'bg-gray-100 border-gray-400 text-gray-700 ring-1 ring-gray-400' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'}`}
                >
                    <XCircle size={24} />
                    <span className="text-xs font-medium">Annullato</span>
                </button>
            </div>
        </div>

        {loading && (
            <div className="flex justify-center">
                <Loader2 className="animate-spin text-primary-600" />
            </div>
        )}
      </div>
    </Modal>
  );
};

export default AppointmentActionModal;