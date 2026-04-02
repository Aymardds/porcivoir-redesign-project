import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type UserRole = 'customer' | 'admin' | 'editor' | 'stock_manager' | 'seo';

const ROLES: { value: UserRole; label: string; color: string }[] = [
  { value: 'customer', label: 'Client', color: 'bg-gray-100 text-gray-600' },
  { value: 'seo', label: 'SEO', color: 'bg-blue-100 text-blue-600' },
  { value: 'editor', label: 'Éditeur', color: 'bg-purple-100 text-purple-600' },
  { value: 'stock_manager', label: 'Gestionnaire Stock', color: 'bg-orange-100 text-orange-600' },
  { value: 'admin', label: 'Administrateur', color: 'bg-red-100 text-red-600' },
];

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { profile: currentProfile } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (userId === currentProfile?.id) {
      toast.error("Vous ne pouvez pas modifier votre propre rôle.");
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Rôle mis à jour avec succès');
      fetchUsers();
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const getRoleBadge = (role: string) => {
    const found = ROLES.find(r => r.value === role);
    return found ?? { label: role, color: 'bg-gray-100 text-gray-600' };
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.first_name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (user.last_name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (user.role?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">
            Attribuez des rôles aux membres de votre équipe (Admin uniquement).
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg text-primary text-sm font-medium">
          <Shield className="w-4 h-4" />
          Accès Administrateur
        </div>
      </div>

      {/* Roles legend */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Légende des rôles</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <span key={role.value} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.color}`}>
              {role.label}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full bg-secondary/50 border-transparent focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-sans uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Utilisateur</th>
                <th className="px-6 py-4 font-medium">Rôle actuel</th>
                <th className="px-6 py-4 font-medium">Date d'inscription</th>
                <th className="px-6 py-4 font-medium text-right">Changer le rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Chargement des utilisateurs...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const isSelf = user.id === currentProfile?.id;
                  return (
                    <tr key={user.id} className={`hover:bg-secondary/20 transition-colors ${isSelf ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {user.first_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.first_name || 'Inconnu'} {user.last_name || ''}
                              {isSelf && <span className="ml-2 text-xs text-muted-foreground">(vous)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                          disabled={isSelf}
                          className="text-xs font-medium border border-border rounded-md px-2 py-1.5 bg-background text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
