import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import Tabs from './ui/Tabs';
import { User, CreditCard, Bell, Key, Shield, Smartphone, AlertTriangle, ExternalLink, Save, Loader2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { saveTwilioConfig, getTwilioConfig } from '../services/twilioService';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Twilio State
  const [twilioConfig, setTwilioConfig] = useState({
      accountSid: '',
      authToken: '',
      phoneNumber: '',
      enabled: false
  });
  const [savingTwilio, setSavingTwilio] = useState(false);

  useEffect(() => {
    if (activeTab === 'whatsapp') {
        loadTwilio();
    }
  }, [activeTab]);

  const loadTwilio = async () => {
    const config = await getTwilioConfig();
    if (config) setTwilioConfig(config);
  };

  const handleSaveTwilio = async () => {
      setSavingTwilio(true);
      try {
          await saveTwilioConfig(twilioConfig);
          addToast('Configurazione Twilio salvata!', 'success');
      } catch (error) {
          addToast('Errore nel salvataggio.', 'error');
          console.error(error);
      } finally {
          setSavingTwilio(false);
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold text-gray-900">Impostazioni</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="md:col-span-1">
            <Card noPadding className="overflow-hidden">
                <div className="flex flex-col">
                    {[
                        { id: 'profile', label: 'Profilo', icon: User },
                        { id: 'whatsapp', label: 'Integrazioni', icon: Smartphone },
                        { id: 'billing', label: 'Piano & Fatture', icon: CreditCard },
                        { id: 'notifications', label: 'Notifiche', icon: Bell },
                        { id: 'api', label: 'API Keys', icon: Key },
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                                    activeTab === tab.id 
                                    ? 'bg-primary-50 text-primary-700 border-primary-600' 
                                    : 'text-gray-600 hover:bg-gray-50 border-transparent'
                                }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </Card>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
            <Card>
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Informazioni Account</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nome" defaultValue={user?.user_metadata?.first_name || 'Mario'} />
                            <Input label="Cognome" defaultValue={user?.user_metadata?.last_name || 'Rossi'} />
                            <Input label="Email" defaultValue={user?.email || ''} disabled />
                            <Input label="Azienda" defaultValue={user?.user_metadata?.company_name || 'My Company'} />
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button>Salva Modifiche</Button>
                        </div>
                    </div>
                )}

                {activeTab === 'whatsapp' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Twilio WhatsApp API</h3>
                        
                        <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg">
                            <p className="font-semibold mb-1">Perché serve Twilio?</p>
                            <p>Per inviare messaggi automatici dal CRM, devi collegare un account Twilio attivo con WhatsApp abilitato.</p>
                        </div>

                        <div className="space-y-4">
                            <Input 
                                label="Account SID" 
                                placeholder="ACxxxxxxxx..."
                                value={twilioConfig.accountSid}
                                onChange={(e) => setTwilioConfig({...twilioConfig, accountSid: e.target.value})}
                            />
                            <Input 
                                label="Auth Token" 
                                type="password" 
                                placeholder="••••••••••••"
                                value={twilioConfig.authToken}
                                onChange={(e) => setTwilioConfig({...twilioConfig, authToken: e.target.value})}
                            />
                            <Input 
                                label="Numero WhatsApp Twilio" 
                                placeholder="+14155238886"
                                value={twilioConfig.phoneNumber}
                                onChange={(e) => setTwilioConfig({...twilioConfig, phoneNumber: e.target.value})}
                            />
                            
                            <div className="flex items-center gap-3 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={twilioConfig.enabled} onChange={() => setTwilioConfig({...twilioConfig, enabled: !twilioConfig.enabled})} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-900">Abilita invio messaggi</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSaveTwilio} disabled={savingTwilio}>
                                {savingTwilio ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2" size={16}/>}
                                Salva Configurazione
                            </Button>
                        </div>

                        <hr className="my-6 border-gray-100" />

                        {/* Google Troubleshooting Box */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                            <h4 className="flex items-center gap-2 font-semibold text-yellow-800 mb-2">
                                <AlertTriangle size={16} /> Problemi con Google Calendar?
                            </h4>
                            <p className="text-sm text-yellow-800 mb-2">Se ricevi "Errore 403" durante il login, controlla la Google Console:</p>
                            <ul className="list-disc pl-5 text-xs text-yellow-700 space-y-1">
                                <li>Assicurati che <strong>"Google Calendar API"</strong> sia abilitata in "Libreria".</li>
                                <li>Nello "Schermata di consenso OAuth", se lo stato è "Testing", devi aggiungere la tua email agli <strong>Utenti di test</strong>.</li>
                                <li>Assicurati di aver aggiunto lo scope <code>.../auth/calendar</code>.</li>
                            </ul>
                            <a 
                              href="https://console.cloud.google.com/apis/dashboard" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-yellow-900 underline mt-2 inline-flex items-center"
                            >
                              Vai a Google Cloud Console <ExternalLink size={10} className="ml-1"/>
                            </a>
                        </div>
                    </div>
                )}
                
                {activeTab === 'billing' && (
                    <div className="text-center py-8">
                        <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Piano Pro Attivo</h3>
                        <p className="text-gray-500 mb-6">Prossimo rinnovo: 01 Dic 2023</p>
                        <Button variant="outline">Gestisci Abbonamento</Button>
                    </div>
                )}

                {activeTab === 'api' && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">API Keys</h3>
                        <p className="text-sm text-gray-500">Usa queste chiavi per collegare servizi esterni a LeadFlow.</p>
                        <div className="relative">
                            <Input label="Public Key" value="pk_live_51Mz..." readOnly />
                            <Button size="sm" variant="ghost" className="absolute right-0 bottom-1">Copia</Button>
                        </div>
                        <Button variant="danger">Rigenera Keys</Button>
                     </div>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;