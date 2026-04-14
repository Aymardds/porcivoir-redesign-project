import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile && profile.role === 'admin') {
        toast.success("Bienvenue dans l'espace administration");
        navigate('/admin');
      } else {
        toast.success("Connexion réussie");
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md p-8 rounded-xl shadow-sm border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-sans text-foreground">Connexion</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Accédez à votre compte Porcivoir
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-xs text-primary hover:underline font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold"
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </Button>

          <div className="text-center mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
