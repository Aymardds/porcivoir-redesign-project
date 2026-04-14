import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Search, Shield, Filter, UserPlus, X, Loader2, Mail, User, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type UserRole = 'customer' | 'admin' | 'editor' | 'stock_manager' | 'seo';
type TabId = 'team' | 'customers';

const TEAM_ROLES: { value: UserRole; label: string; color: string }[] = [
  { value: 'seo', label: 'SEO', color: 'bg-blue-100 text-blue-600' },
  { value: 'editor', label: 'Éditeur', color: 'bg-purple-100 text-purple-600' },
  { value: 'stock_manager', label: 'Gestionnaire Stock', color: 'bg-orange-100 text-orange-600' },
  { value: 'admin', label: 'Administrateur', color: 'bg-red-100 text-red-600' },
];

const ALL_ROLES: { value: UserRole; label: string; color: string }[] = [
  { value: 'customer', label: 'Client', color: 'bg-gray-100 text-gray-600' },
  ...TEAM_ROLES,
];

const TEAM_ROLE_VALUES: UserRole[] = ['admin', 'editor', 'stock_manager', 'seo'];

const defaultForm = {
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  role: 'editor' as UserRole,
};

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [activeTab, setActiveTab] = useState<TabId>('team');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const { profile: currentProfile } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset filters when switching tabs
  useEffect(() => {
    setSearchTerm('');
    setRoleFilter('all');
  }, [activeTab]);

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
    const found = ALL_ROLES.find(r => r.value === role);
    return found ?? { label: role, color: 'bg-gray-100 text-gray-600' };
  };

  const getInitials = (user: any) => {
    const f = user.first_name?.charAt(0) ?? '';
    const l = user.last_name?.charAt(0) ?? '';
    return (f + l).toUpperCase() || '?';
  };

  const getDisplayName = (user: any) => {
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return name || user.email || 'Utilisateur inconnu';
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.first_name) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.first_name,
            last_name: form.last_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Création du compte échouée.');

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          role: form.role,
        });

      if (profileError) throw profileError;

      toast.success(`Membre ${form.first_name} ajouté à l'équipe !`);
      setShowModal(false);
      setForm(defaultForm);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création de l'utilisateur");
    } finally {
      setSubmitting(false);
    }
  };

  // Split users by type
  const teamUsers = users.filter(u => TEAM_ROLE_VALUES.includes(u.role));
  const customerUsers = users.filter(u => u.role === 'customer' || !TEAM_ROLE_VALUES.includes(u.role));

  const sourceUsers = activeTab === 'team' ? teamUsers : customerUsers;
  const availableRoleFilters = activeTab === 'team' ? TEAM_ROLES : [{ value: 'customer' as UserRole, label: 'Client', color: 'bg-gray-100 text-gray-600' }];

  const filteredUsers = sourceUsers.filter((user) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (user.first_name?.toLowerCase() ?? '').includes(search) ||
      (user.last_name?.toLowerCase() ?? '').includes(search) ||
      (user.email?.toLowerCase() ?? '').includes(search) ||
      (user.role?.toLowerCase() ?? '').includes(search);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les comptes et les rôles de votre équipe.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg text-primary text-sm font-medium">
            <Shield className="w-4 h-4" />
            Accès Administrateur
          </div>
          {activeTab === 'team' && (
            <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Ajouter un membre
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl w-fit border border-border">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'team'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Équipe opérationnelle
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
            activeTab === 'team' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}>
            {teamUsers.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'customers'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          Clients
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
            activeTab === 'customers' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}>
            {customerUsers.length}
          </span>
        </button>
      </div>

      {/* Roles legend — team only */}
      {activeTab === 'team' && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Rôles disponibles</p>
          <div className="flex flex-wrap gap-2">
            {TEAM_ROLES.map((role) => (
              <span key={role.value} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.color}`}>
                {role.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={activeTab === 'team' ? 'Rechercher un membre...' : 'Rechercher un client...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full bg-secondary/50 border-transparent focus:border-primary"
              />
            </div>
            {activeTab === 'team' && (
              <div className="relative flex items-center">
                <Filter className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                  className="pl-9 pr-4 py-2 text-sm font-medium border border-border rounded-md bg-secondary/50 text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                >
                  <option value="all">Tous les rôles</option>
                  {availableRoleFilters.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            )}
            <span className="text-sm text-muted-foreground self-center ml-auto">
              {filteredUsers.length} {activeTab === 'team' ? 'membre' : 'client'}{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-sans uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">
                  {activeTab === 'team' ? 'Membre' : 'Client'}
                </th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Rôle</th>
                <th className="px-6 py-4 font-medium">Inscription</th>
                {activeTab === 'team' && (
                  <th className="px-6 py-4 font-medium text-right">Changer le rôle</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'team' ? 5 : 4} className="px-6 py-10 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Chargement...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'team' ? 5 : 4} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      {activeTab === 'team' ? (
                        <ShieldCheck className="w-8 h-8 opacity-30" />
                      ) : (
                        <Users className="w-8 h-8 opacity-30" />
                      )}
                      <p className="text-sm">
                        {activeTab === 'team'
                          ? "Aucun membre d'équipe trouvé. Ajoutez votre premier collaborateur."
                          : 'Aucun client trouvé.'}
                      </p>
                      {activeTab === 'team' && (
                        <Button size="sm" variant="outline" onClick={() => setShowModal(true)} className="mt-1">
                          <UserPlus className="w-3.5 h-3.5 mr-2" />
                          Ajouter un membre
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const isSelf = user.id === currentProfile?.id;
                  return (
                    <tr key={user.id} className={`hover:bg-secondary/20 transition-colors ${isSelf ? 'opacity-70' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            activeTab === 'team' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                          }`}>
                            {getInitials(user)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {getDisplayName(user)}
                              {isSelf && <span className="ml-2 text-xs text-muted-foreground">(vous)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate max-w-[160px]">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[200px]">{user.email || '—'}</span>
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
                      {activeTab === 'team' && (
                        <td className="px-6 py-4 text-right">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                            disabled={isSelf}
                            className="text-xs font-medium border border-border rounded-md px-2 py-1.5 bg-background text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            {TEAM_ROLES.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !submitting && setShowModal(false)}
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Nouveau membre</h2>
                  <p className="text-xs text-muted-foreground">Ajouter un collaborateur à l'équipe</p>
                </div>
              </div>
              <button
                onClick={() => !submitting && setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Jean"
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      required
                      className="pl-9 bg-secondary/50 border-transparent focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nom</label>
                  <Input
                    placeholder="Dupont"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="bg-secondary/50 border-transparent focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="jean.dupont@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="pl-9 bg-secondary/50 border-transparent focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mot de passe temporaire <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="Minimum 8 caractères"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className="bg-secondary/50 border-transparent focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 text-sm font-medium border border-border rounded-md bg-secondary/50 text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {TEAM_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Peut être modifié ultérieurement dans cette page.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Création...</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-2" />Ajouter à l'équipe</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
