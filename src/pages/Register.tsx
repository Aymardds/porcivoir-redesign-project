import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign up user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      const user = authData.user;
      if (user) {
        // 2. Add profile data linked to auth user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            role: 'customer',
          });

        if (profileError) {
          throw profileError;
        }

        toast.success("Inscription réussie ! Vous êtes maintenant connecté.");
        navigate('/');
      }
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes("already registered")) {
        toast.error("Cet e-mail est déjà utilisé.");
      } else {
        toast.error(error.message || "Erreur lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md p-8 rounded-xl shadow-sm border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-sans text-foreground">S'inscrire</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Créez votre compte client Porc'Ivoire
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                placeholder="Votre prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                placeholder="Votre nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full"
              />
            </div>
          </div>

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
              placeholder="Min. 6 caractères"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
            disabled={loading}
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Connectez-vous
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
