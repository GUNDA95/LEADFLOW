import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Loader2, Zap } from 'lucide-react';
import { AuthRoute } from '../../types';

interface LoginProps {
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

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // Redirect handled by AuthStateChange in App.tsx
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message && (err.message.includes('Email not confirmed') || err.message.includes('Email not verified'))) {
        setError("Email non verificata. Controlla la tua posta per attivare l'account.");
      } else if (err.message === "Invalid login credentials") {
        setError("Email o password non corretti.");
      } else {
        setError(err.message || "Errore durante il login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
          // Added 'https://www.googleapis.com/auth/calendar' as requested.
          // Including 'email profile openid' to ensure we get user details.
          scopes: 'https://www.googleapis.com/auth/calendar email profile openid'
        }
      });
      
      if (error) throw error;
      // Redirect happens automatically
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Impossibile accedere con Google");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-primary-600 text-white p-2 rounded-xl mb-4">
            <Zap size={32} fill="currentColor" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Bentornato
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accedi per gestire i tuoi lead e le tue opportunità.
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <div className="space-y-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full py-2.5 font-medium text-gray-700 bg-white hover:bg-gray-50 border-gray-300" 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <GoogleIcon />
              Accedi con Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Oppure con email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot-password')}
                    className="text-xs font-medium text-primary-600 hover:text-primary-500 mb-1.5"
                  >
                    Password dimenticata?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className={`p-3 text-sm border rounded-lg ${error.includes('Email non verificata') ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-100 text-red-500'}`}>
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                Accedi
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Non hai un account? </span>
            <button
              onClick={() => onNavigate('register')}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Registrati
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;