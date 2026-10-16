import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Bell,
  BellOff,
  BellRing,
  Mail,
  UserPlus,
  Trash2,
  Search,
  Loader2,
  X,
  Info,
  Shield,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Subscriber = {
  id: string;
  email: string;
  label: string;
  active: boolean;
  created_at: string;
};

const defaultForm = { email: '', label: '' };

export default function OrderNotifications() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_notification_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des abonnés');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) {
      toast.error('Veuillez saisir une adresse email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Adresse email invalide.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('order_notification_subscribers')
        .insert({
          email: form.email.trim().toLowerCase(),
          label: form.label.trim() || form.email.trim(),
          active: true,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Cet email est déjà abonné aux notifications.');
        } else {
          throw error;
        }
        return;
      }

      toast.success(`${form.email} ajouté aux notifications de commandes !`);
      setShowModal(false);
      setForm(defaultForm);
      fetchSubscribers();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'ajout de l'abonné");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (sub: Subscriber) => {
    setToggling(sub.id);
    try {
      const { error } = await supabase
        .from('order_notification_subscribers')
        .update({ active: !sub.active })
        .eq('id', sub.id);

      if (error) throw error;
      toast.success(sub.active ? 'Notifications désactivées.' : 'Notifications réactivées.');
      fetchSubscribers();
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (sub: Subscriber) => {
    if (!confirm(`Supprimer ${sub.email} des notifications ?`)) return;
    setDeleting(sub.id);
    try {
      const { error } = await supabase
        .from('order_notification_subscribers')
        .delete()
        .eq('id', sub.id);

      if (error) throw error;
      toast.success(`${sub.email} supprimé.`);
      fetchSubscribers();
    } catch (err: any) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const activeCount = subscribers.filter((s) => s.active).length;
  const filteredSubscribers = subscribers.filter((sub) => {
    const s = searchTerm.toLowerCase();
    return (
      sub.email.toLowerCase().includes(s) ||
      sub.label.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">
            Notifications Commandes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les destinataires notifiés par email à chaque nouvelle commande.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 shrink-0">
          <UserPlus className="w-4 h-4" />
          Ajouter un abonné
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total abonnés</p>
            <p className="text-2xl font-black text-foreground">{subscribers.length}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actifs</p>
            <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
            <BellOff className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inactifs</p>
            <p className="text-2xl font-black text-orange-500">{subscribers.length - activeCount}</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Comment ça fonctionne : </span>
          Chaque fois qu'une nouvelle commande est passée sur la boutique, tous les abonnés
          <span className="font-semibold text-emerald-600"> actifs </span>
          reçoivent automatiquement un email de notification avec le récapitulatif de la commande.
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un abonné..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary/50 border-transparent focus:border-primary"
            />
          </div>
          <span className="text-sm text-muted-foreground sm:ml-auto">
            {filteredSubscribers.length} abonné{filteredSubscribers.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-sans uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Nom / Label</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Depuis</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Chargement...
                  </td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Bell className="w-10 h-10 opacity-20" />
                      <p className="text-sm font-medium">
                        {searchTerm
                          ? 'Aucun abonné trouvé pour cette recherche.'
                          : 'Aucun abonné aux notifications. Ajoutez le premier destinataire.'}
                      </p>
                      {!searchTerm && (
                        <Button size="sm" variant="outline" onClick={() => setShowModal(true)} className="mt-1">
                          <UserPlus className="w-3.5 h-3.5 mr-2" />
                          Ajouter un abonné
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary shrink-0">
                          {sub.label.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-semibold text-foreground">{sub.label}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[220px]">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          <BellRing className="w-3 h-3" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-600">
                          <BellOff className="w-3 h-3" />
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(sub)}
                          disabled={toggling === sub.id}
                          className={`text-xs h-8 ${
                            sub.active
                              ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
                              : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {toggling === sub.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : sub.active ? (
                            <>
                              <BellOff className="w-3.5 h-3.5 mr-1.5" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <Bell className="w-3.5 h-3.5 mr-1.5" />
                              Activer
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(sub)}
                          disabled={deleting === sub.id}
                          className="text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                        >
                          {deleting === sub.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subscriber Modal */}
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
                  <BellRing className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Nouvel abonné</h2>
                  <p className="text-xs text-muted-foreground">
                    Notifié à chaque nouvelle commande
                  </p>
                </div>
              </div>
              <button
                onClick={() => !submitting && setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="commercial@porcivoir.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="pl-9 bg-secondary/50 border-transparent focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nom / Label <span className="text-muted-foreground font-normal">(optionnel)</span>
                </label>
                <Input
                  placeholder="Ex: Équipe commerciale, Jean Martin…"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="bg-secondary/50 border-transparent focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Si laissé vide, l'adresse email sera utilisée comme label.
                </p>
              </div>

              {/* Info */}
              <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-xs text-emerald-800 dark:text-emerald-300">
                <ShoppingCart className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Cet email recevra une notification instantanée à chaque nouvelle commande passée sur la boutique.
                </span>
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
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Ajout en cours...</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-2" />Ajouter</>
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
