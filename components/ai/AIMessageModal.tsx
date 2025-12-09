import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { Lead } from '../../types';
import { MessageSquare, RefreshCw, Copy, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { analyzeLeadWithAI } from '../../services/geminiService';
import { useToast } from '../../contexts/ToastContext';
import { GoogleGenAI } from "@google/genai";

interface AIMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

const TEMPLATES = [
  { id: 'followup', label: 'Follow-up post call', icon: '📞' },
  { id: 'intro', label: 'Presentazione Fredda', icon: '👋' },
  { id: 'reminder', label: 'Reminder Offerta', icon: '⏰' },
  { id: 'reactivation', label: 'Riattivazione', icon: '🔄' },
];

const AIMessageModal: React.FC<AIMessageModalProps> = ({ isOpen, onClose, lead }) => {
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);

  const generateMessage = async (templateId: string) => {
    setLoading(true);
    setSelectedTemplate(templateId);
    
    try {
      // Using gemini directly here for specific prompt, or could move to service
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Scrivi un messaggio WhatsApp professionale ma cordiale per un lead.
        
        Dati Lead:
        Nome: ${lead.name}
        Azienda: ${lead.company}
        Stato: ${lead.status}
        
        Obiettivo messaggio: ${TEMPLATES.find(t => t.id === templateId)?.label}
        
        Regole:
        - Max 3-4 frasi
        - Tono amichevole ma business
        - Includi una call to action chiara
        - Usa qualche emoji appropriata
        - Output solo il testo del messaggio
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: prompt,
      });

      setGeneratedText(response.text || "Impossibile generare il messaggio.");
      setStep(2);
    } catch (error) {
      console.error(error);
      addToast("Errore generazione AI", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    addToast("Copiato negli appunti", "success");
  };

  const openWhatsApp = () => {
    // Basic clean of phone number required in real app
    const phone = lead.phone || ''; 
    const encodedText = encodeURIComponent(generatedText);
    window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
  };

  const reset = () => {
    setStep(1);
    setSelectedTemplate('');
    setGeneratedText('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generatore Messaggi AI" size="lg">
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6">
          <span className={step >= 1 ? "text-primary-600" : ""}>1. Template</span>
          <div className="h-px w-8 bg-gray-200" />
          <span className={step >= 2 ? "text-primary-600" : ""}>2. Personalizza</span>
          <div className="h-px w-8 bg-gray-200" />
          <span className={step >= 3 ? "text-primary-600" : ""}>3. Anteprima</span>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => generateMessage(t.id)}
                disabled={loading}
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-primary-200 hover:bg-primary-50 transition-all text-center gap-3 group"
              >
                <span className="text-3xl">{t.icon}</span>
                <span className="font-semibold text-gray-900 group-hover:text-primary-700">{t.label}</span>
                {loading && selectedTemplate === t.id && <Loader2 className="animate-spin text-primary-600" />}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
            <Textarea 
              label="Modifica Messaggio"
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              className="min-h-[150px] text-base"
            />
            <div className="flex justify-between items-center">
               <Button variant="ghost" onClick={reset}>Indietro</Button>
               <div className="flex gap-2">
                 <Button variant="secondary" onClick={() => generateMessage(selectedTemplate)}>
                   <RefreshCw size={16} className="mr-2" /> Rigenera
                 </Button>
                 <Button onClick={() => setStep(3)}>
                   Avanti
                 </Button>
               </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
             {/* WhatsApp Preview */}
             <div className="bg-[#E5DDD5] p-6 rounded-xl border border-gray-200 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%] text-sm text-gray-900 relative">
                  {generatedText}
                  <div className="text-[10px] text-gray-400 text-right mt-1">10:42</div>
                </div>
             </div>

             <div className="flex justify-between items-center pt-4">
               <Button variant="ghost" onClick={() => setStep(2)}>Indietro</Button>
               <div className="flex gap-2">
                 <Button variant="outline" onClick={copyToClipboard}>
                   <Copy size={16} className="mr-2" /> Copia
                 </Button>
                 <Button onClick={openWhatsApp} className="bg-[#25D366] hover:bg-[#128C7E] text-white border-transparent">
                   <MessageSquare size={16} className="mr-2" /> Invia WhatsApp
                 </Button>
               </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AIMessageModal;