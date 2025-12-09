import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatRole } from '../types';
import { chatWithCRMCoach } from '../services/geminiService';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: ChatRole.MODEL, text: "Ciao! Sono il tuo assistente LeadFlow. Come posso aiutarti a chiudere più vendite oggi?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: ChatRole.USER, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass only the last few messages to keep context but save tokens if needed, 
      // though Flash Lite is efficient.
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await chatWithCRMCoach(history, userMsg.text);
      
      const botMsg: ChatMessage = { role: ChatRole.MODEL, text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: ChatRole.MODEL, text: "Scusa, ho avuto un problema di connessione." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col max-w-4xl mx-auto">
        <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-purple-600" />
                AI Intelligence
            </h2>
            <p className="text-gray-500 text-sm">Chatta con Gemini Flash Lite per strategie di vendita immediate.</p>
        </div>

      <Card className="flex-1 flex flex-col min-h-0 relative shadow-lg border-purple-100" noPadding>
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, index) => {
            const isUser = msg.role === ChatRole.USER;
            return (
              <div key={index} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-gray-900 text-white' : 'bg-purple-600 text-white'}`}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                    isUser 
                      ? 'bg-gray-900 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="flex gap-3 max-w-[80%]">
                 <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-gray-200 p-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-purple-600" />
                    <span className="text-xs text-gray-400 font-medium">Gemini sta pensando...</span>
                  </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Chiedi un consiglio strategico..."
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
            <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4"
            >
              <Send size={18} />
            </Button>
          </div>
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-400">Powered by Gemini 2.5 Flash Lite • Risposte a bassa latenza</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;