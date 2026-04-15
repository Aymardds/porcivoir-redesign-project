import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'URL contient un access_token (cas du clic sur le lien reçu par e-mail),
    // Supabase va s'occuper de le valider en arrière-plan et de créer la session.
    // On ne veut donc surtout pas rediriger immédiatement.
    if (window.location.hash && window.location.hash.includes('access_token')) {
      return;
    }

    // Check if we have a session (Supabase adds it automatically from the URL hash)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Le lien de réinitialisation est invalide ou a expiré.");
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success("Votre mot de passe a été mis à jour avec succès !");
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md p-8 rounded-xl shadow-sm border border-border">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Nouveau mot de passe</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Veuillez entrer votre nouveau mot de passe sécurisé.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-10 bg-secondary/50 border-transparent focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Utilisez au moins 8 caractères, dont des lettres et des chiffres.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-11"
            disabled={loading}
          >
            {loading ? "Mise à jour..." : "Réinitialiser mon mot de passe"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
