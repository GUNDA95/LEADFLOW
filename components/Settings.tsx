import React, { useState } from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import Tabs from './ui/Tabs';
import { User, CreditCard, Bell, Key, Shield, Smartphone, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

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
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Stato Integrazioni</h3>
                        
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500 text-white p-2 rounded-full">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-green-900">WhatsApp Business API</p>
                                    <p className="text-sm text-green-700">Connesso: +39 333 ****888</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-green-300 text-green-700 bg-white">Configura</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-70">
                             <div className="flex items-center gap-3">
                                <div className="bg-gray-400 text-white p-2 rounded-full">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">HubSpot Sync</p>
                                    <p className="text-sm text-gray-500">Non connesso</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Connetti</Button>
                        </div>

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