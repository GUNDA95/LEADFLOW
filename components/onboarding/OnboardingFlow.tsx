import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
  Check, ChevronRight, Upload, Calendar, MessageSquare, ShieldCheck, 
  Loader2, ArrowLeft, Scissors, Stethoscope, Dumbbell, Briefcase, 
  ShoppingBag, Sparkles, Clock, Smartphone, Mail, FileText, Smile,
  Home, GraduationCap, TrendingUp, Wrench
} from 'lucide-react';
import { Service, OnboardingData, AutomationConfig } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabaseClient';

interface OnboardingFlowProps {
  onComplete: () => void;
}

// --- DATA DICTIONARIES ---

const SECTORS = [
  { id: 'consulting', label: 'Consulenti', icon: Briefcase, term: 'Consulenza' },
  { id: 'beauty', label: 'Beauty & Benessere', icon: Scissors, term: 'Trattamento' },
  { id: 'fitness', label: 'Fitness & Salute', icon: Dumbbell, term: 'Sessione' },
  { id: 'medical', label: 'Medicina & Terapie', icon: Stethoscope, term: 'Visita' },
  { id: 'sales', label: 'Vendite & Commerciali', icon: TrendingUp, term: 'Incontro' },
  { id: 'home', label: 'Casa & Servizi', icon: Home, term: 'Intervento' },
  { id: 'education', label: 'Coaching & Formazione', icon: GraduationCap, term: 'Lezione' },
  { id: 'other', label: 'Altro', icon: Sparkles, term: 'Appuntamento' },
];

const SUB_CATEGORIES: Record<string, string[]> = {
  beauty: ['Parrucchiere', 'Barber', 'Estetista', 'Lash / Brow artist', 'Make-up artist', 'Solarium'],
  medical: ['Dentista', 'Fisioterapista', 'Chiropratico', 'Osteopata', 'Podologo', 'Nutrizionista'],
  fitness: ['Personal Trainer', 'Preparatore atletico', 'Istruttore yoga / pilates', 'CrossFit coach', 'Massoterapista'],
  consulting: ['Consulente marketing', 'Consulente business', 'Consulente finanziario', 'Coach motivazionale'],
  sales: ['Immobiliare', 'Assicurazioni', 'Automotive', 'Venditore freelance'],
  home: ['Idraulico', 'Elettricista', 'Impiantista', 'Serramentista'],
  education: ['Formatore', 'Insegnante privato', 'Tutor'],
  other: ['Altro'],
};

const DEFAULT_SERVICES: Record<string, Partial<Service>[]> = {
  // Beauty & Benessere
  'Parrucchiere': [
    { name: 'Taglio donna', duration: 45, price: 40 },
    { name: 'Taglio uomo', duration: 30, price: 25 },
    { name: 'Colore completo (tinta)', duration: 120, price: 60 },
    { name: 'Taglio + Colore', duration: 150, price: 90 },
    { name: 'Piega / Styling', duration: 30, price: 20 },
    { name: 'Trattamento ristrutturante (keratina)', duration: 60, price: 50 },
  ],
  'Barber': [
    { name: 'Taglio uomo classico', duration: 30, price: 25 },
    { name: 'Barba completa (rifinitura + contorno)', duration: 25, price: 15 },
    { name: 'Taglio + Barba', duration: 45, price: 35 },
    { name: 'Rasatura di precisione', duration: 20, price: 20 },
    { name: 'Trattamento barba (oli/panni caldi)', duration: 15, price: 10 },
  ],
  'Estetista': [
    { name: 'Ceretta zona piccola', duration: 15, price: 10 },
    { name: 'Ceretta gambe complete', duration: 45, price: 30 },
    { name: 'Trattamento viso base (pulizia)', duration: 60, price: 50 },
    { name: 'Trattamento mani/pedicure', duration: 45, price: 35 },
    { name: 'Trattamento viso anti-age', duration: 75, price: 80 },
  ],
  'Lash / Brow artist': [
    { name: 'Applicazione extension ciglia (full set)', duration: 90, price: 80 },
    { name: 'Ritocco extension ciglia', duration: 45, price: 40 },
    { name: 'Laminazione sopracciglia', duration: 45, price: 50 },
    { name: 'Tintura ciglia/sopracciglia', duration: 20, price: 15 },
    { name: 'Rimozione extension + cura', duration: 30, price: 20 },
  ],
  'Make-up artist': [
    { name: 'Make-up giorno', duration: 45, price: 50 },
    { name: 'Make-up sposa (prova + giorno)', duration: 210, price: 250 },
    { name: 'Make-up fotografico', duration: 60, price: 70 },
    { name: 'Trucco serale / evento', duration: 60, price: 60 },
    { name: 'Lesson make-up (mini)', duration: 60, price: 80 },
  ],
  'Solarium': [
    { name: 'Sessione lampada 10 min', duration: 10, price: 10 },
    { name: 'Sessione abbronzatura UVA 15 min', duration: 15, price: 15 },
    { name: 'Pacchetto 3 sessioni', duration: 45, price: 35 },
    { name: 'Consulenza pelle + prova', duration: 20, price: 0 },
    { name: 'Trattamento combinato (lampada + peeling)', duration: 30, price: 25 },
  ],

  // Medicina & Terapie
  'Dentista': [
    { name: 'Visita di controllo & igiene', duration: 45, price: 80 },
    { name: 'Otturazione semplice', duration: 60, price: 100 },
    { name: 'Devitalizzazione (singolo canale)', duration: 90, price: 150 },
    { name: 'Estrazione dentale semplice', duration: 45, price: 80 },
    { name: 'Prima visita ortodonzia', duration: 60, price: 50 },
  ],
  'Fisioterapista': [
    { name: 'Visita iniziale + valutazione', duration: 60, price: 70 },
    { name: 'Trattamento terapia manuale', duration: 45, price: 50 },
    { name: 'Seduta riabilitativa (esercizi)', duration: 30, price: 40 },
    { name: 'Tecarterapia / laser terapia', duration: 30, price: 40 },
    { name: 'Programma sedute pacchetto 5x', duration: 150, price: 200 },
  ],
  'Chiropratico': [
    { name: 'Prima visita + valutazione postura', duration: 60, price: 80 },
    { name: 'Trattamento manipolativo', duration: 45, price: 60 },
    { name: 'Follow-up / controllo', duration: 30, price: 40 },
    { name: 'Consulenza ergonomica', duration: 30, price: 50 },
    { name: 'Pacchetto trattamento spinale (3 sedute)', duration: 135, price: 150 },
  ],
  'Osteopata': [
    { name: 'Visita iniziale osteopatia', duration: 60, price: 80 },
    { name: 'Seduta osteopatica', duration: 50, price: 60 },
    { name: 'Trattamento craniale', duration: 45, price: 60 },
    { name: 'Seduta post-operatoria di supporto', duration: 60, price: 70 },
    { name: 'Check-up posturale completo', duration: 45, price: 50 },
  ],
  'Podologo': [
    { name: 'Visita podologica + test postura', duration: 45, price: 60 },
    { name: 'Trattamento callo/ipercheratosi', duration: 30, price: 40 },
    { name: 'Plantare su misura (prima seduta)', duration: 60, price: 150 },
    { name: 'Controllo unghie incarnite', duration: 30, price: 30 },
    { name: 'Consulenza calzature sport', duration: 30, price: 0 },
  ],
  'Nutrizionista': [
    { name: 'Prima visita nutrizionale', duration: 60, price: 100 },
    { name: 'Follow-up controllo', duration: 30, price: 50 },
    { name: 'Piano alimentare base', duration: 45, price: 80 },
    { name: 'Valutazione antropometrica + BIA', duration: 40, price: 60 },
    { name: 'Consulenza integrazione', duration: 30, price: 40 },
  ],

  // Fitness & Salute
  'Personal Trainer': [
    { name: 'Valutazione iniziale + piano', duration: 60, price: 60 },
    { name: 'Allenamento one-to-one 1h', duration: 60, price: 50 },
    { name: 'Sessione express', duration: 30, price: 30 },
    { name: 'Programma mensile', duration: 0, price: 100 },
    { name: 'Personal training outdoor (1h)', duration: 60, price: 50 },
  ],
  'Preparatore atletico': [
    { name: 'Valutazione test performance', duration: 90, price: 100 },
    { name: 'Allenamento specifico (forza)', duration: 60, price: 70 },
    { name: 'Programma periodizzazione mensile', duration: 0, price: 120 },
    { name: 'Analisi video tecnica', duration: 60, price: 60 },
    { name: 'Test salto / resistenza', duration: 45, price: 50 },
  ],
  'Istruttore yoga / pilates': [
    { name: 'Lezione privata yoga 1:1', duration: 60, price: 60 },
    { name: 'Pacchetto 5 lezioni', duration: 0, price: 250 },
    { name: 'Lezione pilates rieducativa', duration: 50, price: 55 },
    { name: 'Lezione prova introduttiva', duration: 45, price: 20 },
    { name: 'Lezione duo (2 persone)', duration: 60, price: 80 },
  ],
  'CrossFit coach': [
    { name: 'WOD individuale', duration: 60, price: 25 },
    { name: 'Valutazione capacità funzionale', duration: 45, price: 50 },
    { name: 'Programma settimanale personalizzato', duration: 0, price: 40 },
    { name: 'Sessione tecnica sollevamento', duration: 45, price: 45 },
    { name: 'Test soglia/metcon', duration: 45, price: 40 },
  ],
  'Massoterapista': [
    { name: 'Massaggio rilassante 30 min', duration: 30, price: 40 },
    { name: 'Massaggio terapeutico 50 min', duration: 50, price: 60 },
    { name: 'Massaggio decontratturante 60 min', duration: 60, price: 70 },
    { name: 'Linfodrenaggio 45 min', duration: 45, price: 60 },
    { name: 'Trattamento post-sport 30 min', duration: 30, price: 40 },
  ],

  // Consulenti
  'Consulente marketing': [
    { name: 'Audit social + report', duration: 90, price: 150 },
    { name: 'Sessione strategica (kickoff)', duration: 60, price: 100 },
    { name: 'Pianificazione contenuti 1 mese', duration: 120, price: 200 },
    { name: 'Analisi competitor', duration: 60, price: 100 },
    { name: 'Setup campagna pubblicitaria', duration: 90, price: 150 },
  ],
  'Consulente business': [
    { name: 'Assessment business model', duration: 90, price: 200 },
    { name: 'Sessione coaching strategico', duration: 60, price: 150 },
    { name: 'Business plan light', duration: 120, price: 250 },
    { name: 'Analisi KPI / report mensile', duration: 60, price: 120 },
    { name: 'Workshop team (mezza giornata)', duration: 240, price: 500 },
  ],
  'Consulente finanziario': [
    { name: 'Consulto finanziario iniziale', duration: 60, price: 0 },
    { name: 'Analisi portafoglio base', duration: 90, price: 150 },
    { name: 'Pianificazione fiscale (consigli)', duration: 60, price: 100 },
    { name: 'Revisione spese e budget', duration: 45, price: 80 },
    { name: 'Sessione follow-up', duration: 30, price: 50 },
  ],
  'Coach motivazionale': [
    { name: 'Sessione coaching 1:1', duration: 60, price: 100 },
    { name: 'Pacchetto 6 sessioni', duration: 0, price: 500 },
    { name: 'Sessione emergenziale', duration: 30, price: 60 },
    { name: 'Workshop motivazionale (2h)', duration: 120, price: 200 },
    { name: 'Test valutazione obiettivi', duration: 45, price: 80 },
  ],

  // Vendite & Commerciali
  'Immobiliare': [
    { name: 'Valutazione immobile in loco', duration: 60, price: 0 },
    { name: 'Tour virtuale + foto', duration: 90, price: 0 },
    { name: 'Consulenza valutazione prezzo', duration: 45, price: 0 },
    { name: 'Incontro con potenziali acquirenti', duration: 60, price: 0 },
    { name: 'Open house (organizzazione)', duration: 120, price: 0 },
  ],
  'Assicurazioni': [
    { name: 'Consulenza polizza auto', duration: 45, price: 0 },
    { name: 'Preventivo vita / salute', duration: 60, price: 0 },
    { name: 'Revisione portafoglio assicurativo', duration: 60, price: 0 },
    { name: 'Firma e spiegazione polizza', duration: 30, price: 0 },
    { name: 'Consulenza sinistri (prima analisi)', duration: 45, price: 0 },
  ],
  'Automotive': [
    { name: 'Test drive (demo)', duration: 45, price: 0 },
    { name: 'Valutazione permuta', duration: 30, price: 0 },
    { name: 'Preventivo personalizzato', duration: 45, price: 0 },
    { name: 'Consegna veicolo (check-in)', duration: 60, price: 0 },
    { name: 'Consulenza finanziamento', duration: 45, price: 0 },
  ],
  'Venditore freelance': [
    { name: 'Meeting scoperta cliente', duration: 45, price: 0 },
    { name: 'Presentazione offerta', duration: 60, price: 0 },
    { name: 'Negoziazione / follow-up', duration: 30, price: 0 },
    { name: 'Demo prodotto/servizio', duration: 60, price: 0 },
    { name: 'Firma contratto / onboarding', duration: 45, price: 0 },
  ],

  // Casa & Servizi
  'Idraulico': [
    { name: 'Intervento perdita piccola', duration: 45, price: 80 },
    { name: 'Sostituzione rubinetteria', duration: 60, price: 100 },
    { name: 'Installazione caldaia (check)', duration: 90, price: 150 },
    { name: 'Pulizia scarico', duration: 45, price: 80 },
    { name: 'Preventivo sopralluogo', duration: 30, price: 40 },
  ],
  'Elettricista': [
    { name: 'Intervento prese/luci', duration: 45, price: 80 },
    { name: 'Revisione impianto luce', duration: 60, price: 100 },
    { name: 'Installazione quadro elettrico (check)', duration: 120, price: 200 },
    { name: 'Riparazione corto circuito', duration: 60, price: 100 },
    { name: 'Preventivo impianto domotica', duration: 90, price: 50 },
  ],
  'Impiantista': [
    { name: 'Installazione split (sopralluogo)', duration: 60, price: 50 },
    { name: 'Manutenzione condizionatore', duration: 60, price: 80 },
    { name: 'Sostituzione unità interna', duration: 90, price: 150 },
    { name: 'Verifica pressione impianto', duration: 45, price: 60 },
    { name: 'Preventivo impianto completo', duration: 120, price: 50 },
  ],
  'Serramentista': [
    { name: 'Misura e sopralluogo', duration: 60, price: 0 },
    { name: 'Sostituzione finestra standard', duration: 120, price: 200 },
    { name: 'Riparazione scorrevole', duration: 90, price: 150 },
    { name: 'Manutenzione guarnizioni', duration: 45, price: 80 },
    { name: 'Preventivo su misura', duration: 60, price: 0 },
  ],

  // Coaching & Formazione
  'Formatore': [
    { name: 'Corso aziendale mezza giornata', duration: 240, price: 600 },
    { name: 'Corso intensivo 1 giorno', duration: 480, price: 1000 },
    { name: 'Workshop 2 ore', duration: 120, price: 300 },
    { name: 'Lezione pratica 90 min', duration: 90, price: 200 },
    { name: 'Valutazione apprendimento post corso', duration: 45, price: 100 },
  ],
  'Insegnante privato': [
    { name: 'Lezione lingua 60 min', duration: 60, price: 30 },
    { name: 'Lezione musica 45 min', duration: 45, price: 35 },
    { name: 'Pacchetto 10 lezioni', duration: 0, price: 250 },
    { name: 'Preparazione esame', duration: 90, price: 45 },
    { name: 'Lezione prova gratuita', duration: 30, price: 0 },
  ],
  'Tutor': [
    { name: 'Supporto compiti 60 min', duration: 60, price: 25 },
    { name: 'Ripetizione mirata', duration: 60, price: 30 },
    { name: 'Revisione esame finale', duration: 90, price: 45 },
    { name: 'Piano studio personalizzato', duration: 60, price: 40 },
    { name: 'Lezione weekend intensiva', duration: 120, price: 60 },
  ],

  // Altro
  'Altro': [
    { name: 'Consulenza rapida', duration: 30, price: 0 },
    { name: 'Incontro commerciale', duration: 45, price: 0 },
    { name: 'Servizio su appuntamento', duration: 60, price: 0 },
    { name: 'Audit / sopralluogo', duration: 60, price: 0 },
    { name: 'Pacchetto personalizzato', duration: 0, price: 0 },
  ]
};

const TONE_PREVIEWS = {
  professional: "Gentile {name}, le confermiamo l'appuntamento per domani alle {time}. Cordiali saluti.",
  friendly: "Ciao {name}! 🌟 Ti aspettiamo domani alle {time} per il tuo appuntamento. A presto!",
  promotional: "Ehi {name}! Domani alle {time} è il tuo momento. 🎁 P.S. Porta un amico e ricevi il 10% di sconto!"
};

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- STATE ---
  const [data, setData] = useState<OnboardingData>({
    importMethod: null,
    sector: '',
    subCategory: '',
    services: [],
    bufferTime: 10,
    calendarSystem: null,
    workingDays: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven'],
    automations: {
      reminder24h: true,
      reminder2h: true,
      noShowRecovery: true,
      askReview: false,
      channels: { sms: false, email: true, whatsapp: false }
    },
    toneOfVoice: 'friendly',
    whatsappConsent: false,
  });

  const [customSector, setCustomSector] = useState('');

  // --- HANDLERS ---

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const toggleService = (index: number) => {
    const newServices = [...data.services];
    newServices[index].selected = !newServices[index].selected;
    updateData('services', newServices);
  };

  const handleSectorSelect = (sectorId: string) => {
    updateData('sector', sectorId);
    handleNext();
  };

  const handleSubCategorySelect = (sub: string) => {
    updateData('subCategory', sub);
    // Pre-populate services
    // Try to find exact match in DEFAULT_SERVICES
    let defaults = DEFAULT_SERVICES[sub];
    
    // If not found, check if it's 'Altro' or custom
    if (!defaults) {
      defaults = DEFAULT_SERVICES['Altro'];
    }

    const mappedServices: Service[] = defaults.map((s, i) => ({
      id: `svc-${i}`,
      name: s.name || 'Servizio',
      duration: s.duration || 60,
      price: s.price,
      selected: true
    }));
    
    updateData('services', mappedServices);
    handleNext();
  };

  const handleImportMock = (method: 'google' | 'csv' | 'none') => {
    setLoading(true);
    setTimeout(() => {
      updateData('importMethod', method);
      setLoading(false);
      handleNext();
    }, 1500);
  };

  const handleGoogleCalendarConnect = () => {
    setLoading(true);
    setTimeout(() => {
      updateData('calendarSystem', 'google');
      setLoading(false);
      addToast('Google Calendar connesso con successo!', 'success');
      // In real app, this would fetch events
    }, 2000);
  };

  const handleWhatsappConnect = () => {
    setLoading(true);
    setTimeout(() => {
        updateData('automations', {
            ...data.automations,
            channels: { ...data.automations.channels, whatsapp: true }
        });
        updateData('whatsappConsent', true);
        setLoading(false);
        addToast('WhatsApp Business API connesso!', 'success');
    }, 2000);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          onboarding_data: data
        }
      });

      if (error) throw error;
      
      addToast('Setup completato con successo!', 'success');
      onComplete();
    } catch (error: any) {
      console.error(error);
      addToast(error.message || 'Errore durante il salvataggio.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER STEPS ---

  const renderStepContent = () => {
    switch(step) {
        case 0: // Welcome & Import
            return (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Benvenuto in LeadFlow 👋</h1>
                        <p className="text-gray-500">Configuriamo il tuo CRM in meno di 5 minuti. Hai già dei dati?</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card onClick={() => handleImportMock('google')} className="p-6 hover:border-primary-500 hover:ring-1 hover:ring-primary-200 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4 h-64">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Google Calendar</h3>
                                <p className="text-sm text-gray-500 mt-1">Importa appuntamenti e contatti automaticamente.</p>
                            </div>
                        </Card>
                        <Card onClick={() => handleImportMock('csv')} className="p-6 hover:border-primary-500 hover:ring-1 hover:ring-primary-200 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4 h-64">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">File CSV / Excel</h3>
                                <p className="text-sm text-gray-500 mt-1">Carica un file con la lista dei tuoi clienti.</p>
                            </div>
                        </Card>
                        <Card onClick={() => handleImportMock('none')} className="p-6 hover:border-primary-500 hover:ring-1 hover:ring-primary-200 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4 h-64">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Parto da Zero</h3>
                                <p className="text-sm text-gray-500 mt-1">Configurazione pulita per una nuova attività.</p>
                            </div>
                        </Card>
                    </div>
                    {loading && <div className="text-center text-primary-600 flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Elaborazione in corso...</div>}
                </div>
            );

        case 1: // Sector
            return (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">In che settore lavori?</h2>
                        <p className="text-gray-500 text-sm mt-1">Personalizzeremo icone e terminologia per te.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {SECTORS.map(s => (
                            <button 
                                key={s.id}
                                onClick={() => handleSectorSelect(s.id)}
                                className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${data.sector === s.id ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-100 bg-white hover:border-primary-200 hover:bg-gray-50'}`}
                            >
                                <s.icon size={32} />
                                <span className="font-medium text-center">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 2: // Sub Category
            return (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Scegli la tua specializzazione</h2>
                        <p className="text-gray-500 text-sm mt-1">Ci aiuta a suggerirti i servizi giusti.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {SUB_CATEGORIES[data.sector || 'other']?.map(sub => (
                             <button 
                                key={sub}
                                onClick={() => handleSubCategorySelect(sub)}
                                className="p-4 text-left rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all font-medium flex items-center justify-between group"
                             >
                                {sub}
                                <ChevronRight className="opacity-0 group-hover:opacity-100 text-primary-500 transition-opacity" size={20} />
                             </button>
                        ))}
                        <button 
                            onClick={() => setCustomSector('custom')}
                            className="p-4 text-left rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-all font-medium"
                        >
                            + Altro (inserisci manuale)
                        </button>
                    </div>
                    {customSector && (
                         <div className="flex gap-2 animate-in fade-in">
                            <Input 
                                placeholder="Scrivi la tua attività..." 
                                value={data.subCategory}
                                onChange={(e) => updateData('subCategory', e.target.value)}
                            />
                            <Button onClick={() => handleSubCategorySelect(data.subCategory)}>Conferma</Button>
                         </div>
                    )}
                </div>
            );

        case 3: // Services
            return (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">I tuoi servizi principali</h2>
                        <p className="text-gray-500 text-sm mt-1">Seleziona e modifica durata/prezzi.</p>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {data.services.map((svc, idx) => (
                            <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${svc.selected ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-white opacity-60'}`}>
                                <div 
                                    className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer ${svc.selected ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 bg-white'}`}
                                    onClick={() => toggleService(idx)}
                                >
                                    {svc.selected && <Check size={14} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Input 
                                        className="h-8 text-sm font-medium border-transparent bg-transparent focus:bg-white focus:border-primary-200 px-0" 
                                        value={svc.name}
                                        onChange={(e) => {
                                            const newSvc = [...data.services];
                                            newSvc[idx].name = e.target.value;
                                            updateData('services', newSvc);
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-20 shrink-0">
                                    <Clock size={14} className="text-gray-400" />
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent text-sm border-b border-gray-200 focus:border-primary-500 focus:outline-none text-right"
                                        value={svc.duration}
                                        onChange={(e) => {
                                            const newSvc = [...data.services];
                                            newSvc[idx].duration = parseInt(e.target.value) || 0;
                                            updateData('services', newSvc);
                                        }}
                                    />
                                    <span className="text-xs text-gray-400">m</span>
                                </div>
                                <div className="flex items-center gap-2 w-16 shrink-0">
                                    <span className="text-gray-400 text-sm">€</span>
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent text-sm border-b border-gray-200 focus:border-primary-500 focus:outline-none text-right"
                                        value={svc.price}
                                        onChange={(e) => {
                                            const newSvc = [...data.services];
                                            newSvc[idx].price = parseInt(e.target.value) || 0;
                                            updateData('services', newSvc);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                         <Button variant="outline" className="w-full border-dashed text-gray-500" onClick={() => {
                             updateData('services', [...data.services, { id: Date.now().toString(), name: 'Nuovo Servizio', duration: 30, price: 0, selected: true }]);
                         }}>
                             + Aggiungi Servizio
                         </Button>
                    </div>
                </div>
            );

        case 4: // Buffer & Timings
             return (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Tempi e Buffer</h2>
                        <p className="text-gray-500 text-sm mt-1">Quanto tempo ti serve tra un cliente e l'altro?</p>
                    </div>
                    
                    <Card className="p-6 space-y-6">
                        <div>
                            <label className="text-sm font-medium text-gray-900 mb-2 block">Buffer tra appuntamenti (minuti)</label>
                            <p className="text-xs text-gray-500 mb-4">Utile per pulizia, preparazione o spostamenti.</p>
                            <div className="flex gap-3">
                                {[0, 5, 10, 15, 30].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => updateData('bufferTime', val)}
                                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${data.bufferTime === val ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {val} min
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                             <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="font-medium text-gray-900">Giorni Lavorativi</h4>
                                    <p className="text-xs text-gray-500">Seleziona i giorni in cui accetti appuntamenti.</p>
                                </div>
                             </div>
                             <div className="flex gap-2 justify-between">
                                 {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
                                     <button
                                        key={day}
                                        onClick={() => {
                                            const newDays = data.workingDays.includes(day) 
                                                ? data.workingDays.filter(d => d !== day)
                                                : [...data.workingDays, day];
                                            updateData('workingDays', newDays);
                                        }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${data.workingDays.includes(day) ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500' : 'bg-gray-100 text-gray-400'}`}
                                     >
                                         {day.charAt(0)}
                                     </button>
                                 ))}
                             </div>
                        </div>
                    </Card>
                </div>
             );
        
        case 5: // Calendar Integration
             return (
                 <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Il tuo Calendario</h2>
                        <p className="text-gray-500 text-sm mt-1">Sincronizza per evitare doppi appuntamenti.</p>
                    </div>

                    <Card className={`p-6 border-2 transition-all ${data.calendarSystem === 'google' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm">
                                    <Calendar className="text-blue-500" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Google Calendar</h3>
                                    <p className="text-sm text-gray-500">Sincronizzazione bidirezionale</p>
                                </div>
                            </div>
                            {data.calendarSystem === 'google' ? (
                                <Badge variant="success" className="px-3 py-1"><Check size={14} className="mr-1"/> Connesso</Badge>
                            ) : (
                                <Button onClick={handleGoogleCalendarConnect} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : 'Connetti'}
                                </Button>
                            )}
                        </div>
                    </Card>

                     <div className="text-center">
                         <button onClick={handleNext} className="text-sm text-gray-500 underline hover:text-gray-700">
                             Salterò questo passaggio per ora
                         </button>
                     </div>
                 </div>
             );

        case 6: // Automations
             return (
                 <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Automazioni Smart</h2>
                        <p className="text-gray-500 text-sm mt-1">Riduci i no-show senza alzare un dito.</p>
                    </div>

                    <Card className="divide-y divide-gray-100">
                        {/* Reminder 24h */}
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Clock size={20} /></div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Reminder 24h prima</h4>
                                    <p className="text-xs text-gray-500">Ricorda l'appuntamento il giorno prima.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={data.automations.reminder24h} onChange={() => updateData('automations', {...data.automations, reminder24h: !data.automations.reminder24h})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                         {/* Reminder 2h */}
                         <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Clock size={20} /></div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Reminder 2h prima</h4>
                                    <p className="text-xs text-gray-500">Ultimo avviso a ridosso dell'evento.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={data.automations.reminder2h} onChange={() => updateData('automations', {...data.automations, reminder2h: !data.automations.reminder2h})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        {/* No Show Recovery */}
                         <div className="p-4 flex items-center justify-between bg-red-50/50">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 p-2 rounded-lg text-red-600"><ShieldCheck size={20} /></div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Recupero No-Show</h4>
                                    <p className="text-xs text-gray-500">Invia messaggio automatico se il cliente non si presenta.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={data.automations.noShowRecovery} onChange={() => updateData('automations', {...data.automations, noShowRecovery: !data.automations.noShowRecovery})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </Card>
                    
                    <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Canali di invio</label>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => updateData('automations', {...data.automations, channels: {...data.automations.channels, email: !data.automations.channels.email}})}
                                className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all ${data.automations.channels.email ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                             >
                                 <Mail size={16} /> Email
                             </button>
                             <button 
                                onClick={() => updateData('automations', {...data.automations, channels: {...data.automations.channels, sms: !data.automations.channels.sms}})}
                                className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all ${data.automations.channels.sms ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                             >
                                 <MessageSquare size={16} /> SMS
                             </button>
                             <button 
                                onClick={() => updateData('automations', {...data.automations, channels: {...data.automations.channels, whatsapp: !data.automations.channels.whatsapp}})}
                                className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all ${data.automations.channels.whatsapp ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}
                             >
                                 <Smartphone size={16} /> WhatsApp
                             </button>
                        </div>
                    </div>
                 </div>
             );

        case 7: // Tone of Voice
             return (
                 <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Tono di Voce AI</h2>
                        <p className="text-gray-500 text-sm mt-1">Come deve parlare il tuo assistente virtuale?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'professional', label: 'Professionale', icon: Briefcase },
                            { id: 'friendly', label: 'Amichevole', icon: Smile },
                            { id: 'promotional', label: 'Energico', icon: Sparkles }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => updateData('toneOfVoice', t.id)}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${data.toneOfVoice === t.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                            >
                                <t.icon size={24} />
                                <span className="font-medium">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <Card className="bg-gray-100 border-gray-200">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0">
                                <Sparkles size={16} />
                            </div>
                            <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-gray-800">
                                {TONE_PREVIEWS[data.toneOfVoice].replace('{name}', 'Marco').replace('{time}', '10:30')}
                            </div>
                        </div>
                    </Card>
                 </div>
             );

        case 8: // WhatsApp & GDPR
             return (
                 <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">WhatsApp & Consensi</h2>
                        <p className="text-gray-500 text-sm mt-1">Ultimo step: Integrazione e Privacy.</p>
                    </div>

                    <Card className={`p-6 border-2 transition-all ${data.automations.channels.whatsapp ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#25D366] text-white p-2 rounded-lg"><Smartphone size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-gray-900">WhatsApp Business API</h3>
                                    <p className="text-sm text-gray-500">Richiesto per invio automatico su WA</p>
                                </div>
                            </div>
                            {data.automations.channels.whatsapp ? (
                                <Badge variant="success" className="px-3 py-1"><Check size={14} className="mr-1"/> Attivo</Badge>
                            ) : (
                                <Button onClick={handleWhatsappConnect} disabled={loading} className="bg-[#25D366] hover:bg-[#128C7E] text-white border-transparent">
                                    {loading ? <Loader2 className="animate-spin" /> : 'Collega'}
                                </Button>
                            )}
                        </div>
                        {data.automations.channels.whatsapp && (
                            <div className="bg-white p-4 rounded-lg border border-green-100 text-sm">
                                <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-green-600"/> 
                                    Gestione Consensi (GDPR)
                                </p>
                                <p className="text-gray-600 mb-2">
                                    LeadFlow creerà automaticamente un record di opt-in per ogni contatto. 
                                </p>
                                <div className="text-xs text-gray-400 italic">
                                    "Confermo di autorizzare {data.subCategory || 'l\'attività'} a contattarmi su WhatsApp. Posso revocare il consenso scrivendo STOP."
                                </div>
                            </div>
                        )}
                    </Card>
                    
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                        <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                        <p>Cliccando "Completa Setup" accetti i termini di servizio e confermi di avere il permesso di contattare i lead importati.</p>
                    </div>
                 </div>
             );

        default: return null;
    }
  };

  // --- MAIN RENDER ---

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
            <div className="flex justify-between text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                <span>Step {step + 1} di 9</span>
                <span>{Math.round(((step + 1) / 9) * 100)}% Completato</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary-600 transition-all duration-500 ease-out"
                    style={{ width: `${((step + 1) / 9) * 100}%` }}
                />
            </div>
        </div>

        {/* Content Card */}
        <Card className="shadow-xl border-0 mb-6 min-h-[500px] flex flex-col relative">
            <div className="flex-1">
                {renderStepContent()}
            </div>
            
            {/* Footer Navigation */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                {step > 0 ? (
                    <Button variant="ghost" onClick={handlePrev} disabled={loading}>
                        <ArrowLeft size={18} className="mr-2" /> Indietro
                    </Button>
                ) : (
                    <div></div> // Spacer
                )}

                {step < 8 ? (
                    <Button onClick={handleNext} disabled={loading} className="px-8">
                        Avanti <ChevronRight size={18} className="ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleFinalSubmit} disabled={loading} className="px-8 bg-green-600 hover:bg-green-700 text-white border-transparent">
                        {loading ? <Loader2 className="animate-spin" /> : 'Completa Setup'}
                        {!loading && <Check size={18} className="ml-2" />}
                    </Button>
                )}
            </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;