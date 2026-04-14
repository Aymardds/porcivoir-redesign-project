import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("E-mail de récupération envoyé !");
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md p-8 rounded-xl shadow-sm border border-border">
        <div className="mb-6">
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la connexion
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Mot de passe oublié</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Entrez votre e-mail pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold"
              disabled={loading}
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100 italic">
              Si un compte existe pour <strong>{email}</strong>, un e-mail de réinitialisation a été envoyé.
            </div>
            <p className="text-xs text-muted-foreground">
              Vérifiez vos spams si vous ne recevez rien d'ici quelques minutes.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSubmitted(false)}
            >
              Renvoyer l'e-mail
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
