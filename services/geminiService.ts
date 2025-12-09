import { GoogleGenAI } from "@google/genai";
import { Lead } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using 'gemini-flash-lite-latest' as per "gemini lite" alias in instructions for low latency
const MODEL_NAME = 'gemini-flash-lite-latest';

export const analyzeLeadWithAI = async (lead: Lead): Promise<string> => {
  try {
    const prompt = `
      Agisci come un esperto consulente di vendita CRM. Analizza il seguente lead e fornisci un breve suggerimento strategico (max 3 frasi) su come procedere per chiudere la vendita.
      
      Dati Lead:
      Nome: ${lead.name}
      Azienda: ${lead.company}
      Status: ${lead.status}
      Valore Stimato: €${lead.value}
      Note Recenti: ${lead.notes}
      
      Output in italiano. Sii conciso e diretto.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Impossibile generare un'analisi al momento.";
  } catch (error) {
    console.error("Errore analisi AI:", error);
    return "Si è verificato un errore durante l'analisi del lead.";
  }
};

export const chatWithCRMCoach = async (history: {role: string, text: string}[], newMessage: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      config: {
        systemInstruction: "Sei LeadFlow AI, un assistente virtuale integrato nel CRM LeadFlow. Rispondi in italiano in modo professionale, conciso e utile per aiutare gli agenti di vendita a gestire i loro lead e task. Usa 'gemini-flash-lite' per risposte ultra veloci."
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Non ho capito, puoi ripetere?";
  } catch (error) {
    console.error("Errore chat AI:", error);
    return "Spiacente, sono momentaneamente offline.";
  }
};

export const generateAnalyticsInsights = async (kpis: any): Promise<string> => {
  try {
    const prompt = `
      Analizza questi dati KPI di vendita e fornisci 3 insight brevi e azionabili per migliorare le performance.
      Usa elenchi puntati.
      
      Dati:
      - Tasso Conversione: ${kpis.conversionRate}
      - No-Show Rate: ${kpis.noShowRate}
      - Revenue Mensile: ${kpis.revenue}
      - Lead Totali: ${kpis.totalLeads}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Dati insufficienti per generare insights.";
  } catch (error) {
    console.error("Errore insights AI:", error);
    return "Impossibile analizzare i dati al momento.";
  }
};