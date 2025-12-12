import { GoogleGenAI } from "@google/genai";
import { Lead } from '../types';

// Safely initialize AI only if key exists, otherwise requests will be handled gracefully
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeLeadWithAI = async (lead: Lead): Promise<string> => {
  if (!ai) return "API Key mancante. Configura Vercel.";
  
  try {
    const prompt = `Analizza questo lead e fornisci consigli strategici:
    Nome: ${lead.name}
    Azienda: ${lead.company}
    Status: ${lead.status}
    Valore: €${lead.value}
    Note: ${lead.notes}
    Ultimo Contatto: ${lead.lastContact}
    
    Fornisci un'analisi breve e punti azione concreti.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Impossibile generare analisi al momento.";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Errore durante l'analisi AI. Verifica la connessione o l'API Key.";
  }
};

export const chatWithCRMCoach = async (history: {role: string, text: string}[], newMessage: string): Promise<string> => {
  if (!ai) return "API Key mancante. Configura le variabili d'ambiente.";

  try {
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: formattedHistory,
      config: {
        systemInstruction: "Sei un esperto coach di vendita CRM. Rispondi in modo conciso, motivante e strategico in italiano.",
      }
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "Non ho capito, puoi ripetere?";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "Mi dispiace, non riesco a connettermi al coach virtuale al momento.";
  }
};

export const generateAnalyticsInsights = async (kpis: any): Promise<string> => {
  if (!ai) return "API Key mancante.";

  try {
    const prompt = `Analizza questi KPI di vendita e genera 3 insight brevi e strategici:
    ${JSON.stringify(kpis, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Nessun insight generato.";
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "Impossibile generare insights. Riprova più tardi.";
  }
};