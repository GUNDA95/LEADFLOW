import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { AuthRoute } from '../../types';

interface ForgotPasswordProps {
  onNavigate: (route: AuthRoute) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/callback', // Simulating callback URL
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Impossibile inviare la mail di recupero");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="text-center shadow-xl border-0 p-8">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Controlla la tua email</h2>
            <p className="text-gray-500 text-sm mb-6">
              Abbiamo inviato un link per reimpostare la password a <strong>{email}</strong>
            </p>
            <Button onClick={() => onNavigate('login')} variant="outline" className="w-full">
              Torna al Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <button 
          onClick={() => onNavigate('login')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Torna al Login
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Recupera Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inserisci la tua email per ricevere le istruzioni.
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@azienda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Invia Link
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;