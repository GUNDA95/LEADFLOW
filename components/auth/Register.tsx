import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { isValidEmail } from '../../lib/utils';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Loader2, Zap, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { AuthRoute } from '../../types';

interface RegisterProps {
  onNavigate: (route: AuthRoute) => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    // Clear error when user types to improve UX
    if (error && e.target.id === 'email') setError(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Strict Email Syntax Validation
    if (!isValidEmail(formData.email)) {
      setError("Inserisci una email valida");
      setLoading(false);
      return; // STOP execution here, do not call Supabase
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company_name: formData.companyName,
          },
        },
      });

      if (error) throw error;

      // If email confirmation is enabled, data.user is returned but data.session is null.
      // We check for this state to show the success message.
      if (data.user && !data.session) {
        setSuccess(true);
      }
      
      // If auto-confirm is on (dev mode), session is created and App.tsx handles redirect automatically.
    } catch (err: any) {
      setError(err.message || "Errore durante la registrazione");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Same scopes as login
          scopes: 'https://www.googleapis.com/auth/calendar email profile openid'
        }
      });
      
      if (error) throw error;
    } catch (err: any) {
      console.error("Google signup error:", err);
      setError(err.message || "Impossibile registrarsi con Google");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <Card className="text-center shadow-xl border-0 p-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Controlla la tua email</h2>
            <p className="text-gray-500 mb-6">
              Abbiamo inviato un link di conferma a <br/>
              <span className="font-semibold text-gray-900">{formData.email}</span>.
            </p>
            <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg mb-6">
              Clicca il link nell'email per attivare il tuo account e accedere a LeadFlow.
            </div>
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
          <div className="inline-block bg-primary-600 text-white p-2 rounded-xl mb-4">
            <Zap size={24} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Crea il tuo account LeadFlow
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inizia a gestire i tuoi lead in modo intelligente.
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <div className="space-y-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full py-2.5 font-medium text-gray-700 bg-white hover:bg-gray-50 border-gray-300" 
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <GoogleIcon />
              Registrati con Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Oppure con email</span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="companyName">Nome Attività</Label>
                <Input
                  id="companyName"
                  placeholder="Es. Rossi Consulting"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@azienda.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={error === "Inserisci una email valida" ? error : undefined}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Almeno 6 caratteri"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              {error && error !== "Inserisci una email valida" && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                Crea Account
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;