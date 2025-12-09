import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Zap, Clock, MessageSquare, ChevronDown, ChevronUp, Play, Pause } from 'lucide-react';
import { Badge } from './ui/Badge';

interface Automation {
  id: string;
  title: string;
  description: string;
  active: boolean;
  trigger: string;
  delay?: number; // minutes
}

const Automations: React.FC = () => {
  const [masterSwitch, setMasterSwitch] = useState(true);
  const [automations, setAutomations] = useState<Automation[]>([
    { id: '1', title: 'Conferma Appuntamento', description: 'Invia WhatsApp di conferma subito dopo la prenotazione.', active: true, trigger: 'Nuovo Appuntamento' },
    { id: '2', title: 'Reminder 24h', description: 'Ricorda l\'appuntamento un giorno prima.', active: true, trigger: '24h prima Appuntamento' },
    { id: '3', title: 'Reminder 1h', description: 'Ultimo avviso breve prima della call.', active: false, trigger: '1h prima Appuntamento' },
    { id: '4', title: 'Recupero No-Show', description: 'Messaggio empatico per riprogrammare dopo mancata presenza.', active: true, trigger: 'Status = No-Show', delay: 15 },
    { id: '5', title: 'Richiesta Feedback', description: 'Chiede recensione dopo vendita conclusa.', active: false, trigger: 'Status = Vinto', delay: 60 },
  ]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className={masterSwitch ? "text-primary-600" : "text-gray-400"} fill={masterSwitch ? "currentColor" : "none"} />
            Automazioni
          </h2>
          <p className="text-gray-500 text-sm">Gestisci i flussi automatici del CRM.</p>
        </div>
        <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${masterSwitch ? 'text-green-600' : 'text-gray-400'}`}>
                {masterSwitch ? 'SISTEMA ATTIVO' : 'SISTEMA IN PAUSA'}
            </span>
            <button 
                onClick={() => setMasterSwitch(!masterSwitch)}
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${masterSwitch ? 'bg-green-500' : 'bg-gray-300'}`}
            >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${masterSwitch ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Automations List */}
        <div className="lg:col-span-2 space-y-4">
            {automations.map(auto => (
                <Card key={auto.id} className={`transition-all duration-200 border-l-4 ${auto.active && masterSwitch ? 'border-l-green-500' : 'border-l-gray-300'}`} noPadding>
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => toggleExpand(auto.id)}>
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${auto.active && masterSwitch ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                <Zap size={20} />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${auto.active && masterSwitch ? 'text-gray-900' : 'text-gray-500'}`}>{auto.title}</h3>
                                <p className="text-xs text-gray-500 md:block hidden">{auto.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant={auto.active && masterSwitch ? 'success' : 'secondary'}>
                                {auto.active && masterSwitch ? 'ON' : 'OFF'}
                            </Badge>
                            {expandedId === auto.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                        </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {expandedId === auto.id && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-4 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Trigger</label>
                                    <div className="flex items-center gap-2 bg-white p-2 border border-gray-200 rounded text-sm text-gray-700">
                                        <Zap size={14} className="text-primary-500" /> {auto.trigger}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Ritardo Invio</label>
                                    <div className="flex items-center gap-2 bg-white p-2 border border-gray-200 rounded text-sm text-gray-700">
                                        <Clock size={14} className="text-orange-500" /> 
                                        {auto.delay ? `${auto.delay} minuti` : 'Immediato'}
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Template Messaggio</label>
                                <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-600 italic">
                                    "Ciao {'{name}'}, questo è un messaggio automatico di esempio..."
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button size="sm" variant="outline">Modifica Template</Button>
                                <Button 
                                    size="sm" 
                                    variant={auto.active ? "secondary" : "primary"}
                                    onClick={(e) => { e.stopPropagation(); toggleAutomation(auto.id); }}
                                >
                                    {auto.active ? <Pause size={14} className="mr-1" /> : <Play size={14} className="mr-1" />}
                                    {auto.active ? 'Pausa' : 'Attiva'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            ))}
        </div>

        {/* Logs Sidebar */}
        <div className="lg:col-span-1">
            <Card className="h-full max-h-[600px] flex flex-col">
                <div className="mb-4">
                    <h3 className="font-bold text-gray-900">Activity Log</h3>
                    <p className="text-xs text-gray-500">Ultime azioni automatiche</p>
                </div>
                <div className="space-y-4 overflow-y-auto pr-2">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="flex gap-3 text-sm border-b border-gray-50 pb-3 last:border-0">
                            <div className="mt-1">
                                <MessageSquare size={14} className="text-primary-500" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">Reminder 24h inviato</p>
                                <p className="text-gray-500 text-xs">a Marco Rossi</p>
                                <p className="text-gray-400 text-[10px] mt-1">Oggi, 10:3{i}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Automations;