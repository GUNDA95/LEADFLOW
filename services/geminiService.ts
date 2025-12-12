import { Lead } from '../types';

// Mock implementation - No external imports needed for now
// This prevents build errors on Vercel related to @google/genai resolution

export const analyzeLeadWithAI = async (lead: Lead): Promise<string> => {
  console.log(`[Mock AI] Analyzing lead: ${lead.name}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `Analisi AI Simulata:
  Il lead ${lead.name} mostra un buon potenziale (${lead.status}). 
  Consiglio: Procedi con una follow-up call focalizzata sul valore per ${lead.company || 'la loro attività'}.`;
};

export const chatWithCRMCoach = async (history: {role: string, text: string}[], newMessage: string): Promise<string> => {
  console.log(`[Mock AI] Chat message: ${newMessage}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return "Questa è una risposta simulata poiché l'integrazione Gemini è stata temporaneamente disabilitata per risolvere problemi di build. Riprova più tardi per l'intelligenza reale.";
};

export const generateAnalyticsInsights = async (kpis: any): Promise<string> => {
  console.log(`[Mock AI] Generating insights for KPIs:`, kpis);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `Insight 1: Il tasso di conversione è stabile.
Insight 2: I no-show sono diminuiti grazie ai reminder.
Insight 3: Focalizzati sui lead ad alto valore questa settimana.`;
};