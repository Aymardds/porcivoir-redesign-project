import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/context/AuthContext';
import {
  Search, Shield, Filter, UserPlus, X, Loader2, Mail, User,
  Users, ShieldCheck, Check, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type TabId = 'team' | 'customers';

const TEAM_ROLES: { value: UserRole; label: string; color: string; desc: string }[] = [
  { value: 'seo',           label: 'SEO',                color: 'bg-blue-100 text-blue-700 border-blue-200',         desc: 'Accès au blog et optimisation' },
  { value: 'editor',        label: 'Éditeur',            color: 'bg-purple-100 text-purple-700 border-purple-200',   desc: 'Création et édition de contenu' },
  { value: 'stock_manager', label: 'Gestionnaire Stock', color: 'bg-orange-100 text-orange-700 border-orange-200',   desc: 'Inventaire, commandes, catégories' },
  { value: 'commercial',    label: 'Commercial',         color: 'bg-emerald-100 text-emerald-700 border-emerald-200',desc: 'Clients, commandes, devis, promos' },
  { value: 'admin',         label: 'Administrateur',     color: 'bg-red-100 text-red-700 border-red-200',            desc: 'Accès complet à toutes les sections' },
];

const ALL_ROLES = [
  { value: 'customer' as UserRole, label: 'Client', color: 'bg-gray-100 text-gray-600 border-gray-200', desc: '' },
  ...TEAM_ROLES,
];

const TEAM_ROLE_VALUES: UserRole[] = ['admin', 'editor', 'stock_manager', 'seo', 'commercial'];

const defaultForm = {
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  roles: ['commercial'] as UserRole[],
};

const getRoleMeta = (role: string) =>
  ALL_ROLES.find((r) => r.value === role) ?? { label: role, color: 'bg-gray-100 text-gray-600 border-gray-200', desc: '' };

/* ─── Multi-role picker used in modals / table rows ─── */
function RolePicker({
  selected,
  onChange,
  disabled = false,
  teamOnly = true,
}: {
  selected: UserRole[];
  onChange: (roles: UserRole[]) => void;
  disabled?: boolean;
  teamOnly?: boolean;
}) {
  const options = teamOnly ? TEAM_ROLES : ALL_ROLES;

  const toggle = (role: UserRole) => {
    if (disabled) return;
    const next = selected.includes(role)
      ? selected.filter((r) => r !== role)
      : [...selected, role];
    // At least one role must remain
    if (next.length === 0) return;
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((r) => {
        const active = selected.includes(r.value);
        return (
          <button
            key={r.value}
            type="button"
            disabled={disabled}
            onClick={() => toggle(r.value)}
            title={r.desc}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all duration-150
              ${active ? r.color : 'bg-transparent text-muted-foreground border-border hover:border-primary/40'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {active && <Check className="w-3 h-3 shrink-0" />}
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Inline row role editor with save/cancel ─── */
function InlineRoleEditor({
  user,
  currentUserId,
  onSaved,
  teamOnly = true,
}: {
  user: any;
  currentUserId?: string;
  onSaved: () => void;
  teamOnly?: boolean;
}) {
  const isSelf = user.id === currentUserId;
  const initial: UserRole[] = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : [user.role as UserRole];

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserRole[]>(initial);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saving || isSelf) return;
    setSaving(true);
    try {
      const primary = draft.includes('admin') ? 'admin' : draft[0];
      const { error } = await supabase
        .from('profiles')
        .update({ roles: draft, role: primary })
        .eq('id', user.id);
      if (error) throw error;
      toast.success('Rôles mis à jour !');
      setEditing(false);
      onSaved();
    } catch {
      toast.error('Erreur lors de la mise à jour des rôles');
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(initial);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {initial.map((r) => {
          const meta = getRoleMeta(r);
          return (
            <span key={r} className={`text-xs font-bold px-2.5 py-1 rounded-full border ${meta.color}`}>
              {meta.label}
            </span>
          );
        })}
        {!isSelf && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-muted-foreground hover:text-primary underline-offset-2 hover:underline flex items-center gap-1 ml-1"
          >
            <ChevronDown className="w-3 h-3" />
            Modifier
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 min-w-[280px]">
      <RolePicker selected={draft} onChange={setDraft} disabled={isSelf} teamOnly={teamOnly} />
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving} className="h-7 text-xs px-3">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3 mr-1" />Sauvegarder</>}
        </Button>
        <Button size="sm" variant="outline" onClick={cancel} disabled={saving} className="h-7 text-xs px-3">
          Annuler
        </Button>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    // Synchronisation en temps réel de tous les utilisateurs et de leurs rôles
    const channel = supabase
      .channel('team-users-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);
  useEffect(() => { setSearchTerm(''); setRoleFilter('all'); }, [activeTab]);

  const getUserRoles = (user: any): UserRole[] =>
    Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role as UserRole];

  const isTeamUser = (user: any) => getUserRoles(user).some((r) => TEAM_ROLE_VALUES.includes(r));

  const teamUsers = users.filter(isTeamUser);
  const customerUsers = users.filter((u) => !isTeamUser(u));
  const sourceUsers = activeTab === 'team' ? teamUsers : customerUsers;

  const filteredUsers = sourceUsers.filter((user) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      (user.first_name?.toLowerCase() ?? '').includes(s) ||
      (user.last_name?.toLowerCase() ?? '').includes(s) ||
      (user.email?.toLowerCase() ?? '').includes(s);
    const matchRole = roleFilter === 'all' || getUserRoles(user).includes(roleFilter);
    return matchSearch && matchRole;
  });

  const getInitials = (u: any) =>
    ((u.first_name?.charAt(0) ?? '') + (u.last_name?.charAt(0) ?? '')).toUpperCase() || '?';

  const getDisplayName = (u: any) =>
    [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Utilisateur inconnu';

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.first_name) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (form.roles.length === 0) {
      toast.error('Sélectionnez au moins un rôle.');
      return;
    }
    setSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { first_name: form.first_name, last_name: form.last_name } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Création du compte échouée.');

      const primaryRole = form.roles.includes('admin') ? 'admin' : form.roles[0];

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        role: primaryRole,
        roles: form.roles,
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérez les comptes et les rôles de votre équipe.</p>
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
        {[
          { id: 'team' as TabId, icon: ShieldCheck, label: 'Équipe opérationnelle', count: teamUsers.length },
          { id: 'customers' as TabId, icon: Users, label: 'Clients', count: customerUsers.length },
        ].map(({ id, icon: Icon, label, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === id
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Roles legend */}
      {activeTab === 'team' && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Rôles disponibles — un utilisateur peut en avoir plusieurs
          </p>
          <div className="flex flex-wrap gap-2">
            {TEAM_ROLES.map((role) => (
              <span key={role.value} title={role.desc} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${role.color}`}>
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
                  {TEAM_ROLES.map((r) => (
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
                <th className="px-6 py-4 font-medium">{activeTab === 'team' ? 'Membre' : 'Client'}</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Rôles</th>
                <th className="px-6 py-4 font-medium">Inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Chargement...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      {activeTab === 'team' ? <ShieldCheck className="w-8 h-8 opacity-30" /> : <Users className="w-8 h-8 opacity-30" />}
                      <p className="text-sm">
                        {activeTab === 'team'
                          ? "Aucun membre d'équipe trouvé."
                          : 'Aucun client trouvé.'}
                      </p>
                      {activeTab === 'team' && (
                        <Button size="sm" variant="outline" onClick={() => setShowModal(true)} className="mt-1">
                          <UserPlus className="w-3.5 h-3.5 mr-2" />Ajouter un membre
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
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
                        <InlineRoleEditor
                          user={user}
                          currentUserId={currentProfile?.id}
                          onSaved={fetchUsers}
                          teamOnly={activeTab === 'team'}
                        />
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
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

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rôles <span className="text-red-500">*</span>
                  <span className="ml-2 font-normal text-muted-foreground normal-case">
                    ({form.roles.length} sélectionné{form.roles.length > 1 ? 's' : ''})
                  </span>
                </label>
                <RolePicker selected={form.roles} onChange={(roles) => setForm({ ...form, roles })} />
                <p className="text-xs text-muted-foreground">
                  Cliquez pour activer / désactiver un rôle. Plusieurs rôles peuvent être combinés.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)} disabled={submitting}>
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
