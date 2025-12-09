import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Mail, ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 shadow-xl border-0">
        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifica la tua Email</h2>
        
        <p className="text-gray-500 mb-6">
          L'accesso è bloccato perché l'indirizzo email non è stato verificato.
          <br />
          Abbiamo inviato un link di conferma a:
          <br />
          <span className="font-semibold text-gray-900 block mt-2">{user?.email}</span>
        </p>

        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 text-sm p-4 rounded-lg mb-6 text-left">
          <strong>Azione richiesta:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Controlla la tua casella di posta.</li>
            <li>Controlla la cartella Spam/Indesiderata.</li>
            <li>Clicca sul link per attivare l'account.</li>
          </ul>
        </div>
        
        <div className="flex flex-col gap-3">
            <Button onClick={() => window.location.reload()} variant="primary" className="w-full">
                <RefreshCw size={16} className="mr-2"/> Ho verificato, aggiorna
            </Button>
            <Button onClick={() => signOut()} variant="outline" className="w-full">
                <LogOut size={16} className="mr-2"/> Esci e torna al Login
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;