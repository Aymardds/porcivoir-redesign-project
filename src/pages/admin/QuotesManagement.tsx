import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  MoreVertical,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function QuotesManagement() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          quote_items (
            *,
            services (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des devis');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, field: 'status' | 'payment_status', value: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('quote_requests')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
      toast.success('Information mise à jour avec succès');
      
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteQuote = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce devis ?')) return;

    try {
      const { error } = await supabaseAdmin
        .from('quote_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Devis supprimé');
      setQuotes(prev => prev.filter(q => q.id !== id));
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600';
      case 'in_progress': return 'bg-blue-500/10 text-blue-600';
      case 'completed': return 'bg-primary/10 text-primary';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const getPaymentColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client_phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-sans text-foreground">Gestion des Devis</h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Liste et suivi des demandes de services AgriQuote Pro.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={fetchQuotes} variant="outline" size="sm" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : null} Actualiser
            </Button>
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden ring-1 ring-black/5">
        <div className="p-4 border-b border-border bg-secondary/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher (Nom, Téléphone, ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full bg-background/50 border-border focus:border-primary shadow-none"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                <Filter className="w-4 h-4 mr-2" /> Filtrer
             </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-sans uppercase text-[11px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">N° Devis</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Statut Demande</th>
                <th className="px-6 py-4">Paiement</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary opacity-20" />
                    Chargement des devis...
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    Aucun devis trouvé.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-secondary/10 transition-colors group">
                    <td className="px-6 py-4 font-mono text-[11px] font-bold text-muted-foreground">
                      #{quote.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{quote.client_name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-medium">
                        <Phone className="w-3 h-3" /> {quote.client_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-foreground">
                      {formatCurrency(quote.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={quote.status}
                        onChange={(e) => updateStatus(quote.id, 'status', e.target.value)}
                        className={`text-[11px] font-black uppercase px-3 py-1.5 rounded-full outline-none border-none cursor-pointer appearance-none pr-8 transition-all ${getStatusColor(quote.status)}`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.6rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1em 1em'
                        }}
                      >
                        <option value="pending">En attente</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminé</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={quote.payment_status}
                        onChange={(e) => updateStatus(quote.id, 'payment_status', e.target.value)}
                        className={`text-[11px] font-black uppercase px-3 py-1.5 rounded-full outline-none border border-transparent cursor-pointer appearance-none pr-8 transition-all ${getPaymentColor(quote.payment_status)}`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.6rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1em 1em'
                        }}
                      >
                        <option value="pending">Paiement Attendu</option>
                        <option value="paid">Payé</option>
                        <option value="failed">Échoué</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-primary hover:bg-primary/10"
                                onClick={() => setSelectedQuote(quote)}
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-card border-border sm:rounded-2xl shadow-2xl">
                             <DialogHeader>
                               <DialogTitle className="text-2xl font-black font-sans uppercase tracking-tight">Détails du Devis</DialogTitle>
                               <DialogDescription className="sr-only">Visualisation détaillée des services et informations du client.</DialogDescription>
                             </DialogHeader>
                             {selectedQuote && (
                               <div className="mt-6 space-y-6">
                                 <div className="grid grid-cols-2 gap-6 p-4 bg-secondary/30 rounded-xl border border-border/50">
                                   <div>
                                     <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Informations Client</h4>
                                     <p className="font-bold text-foreground">{selectedQuote.client_name}</p>
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 font-medium"><Phone className="w-3 h-3"/> {selectedQuote.client_phone}</div>
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 font-medium"><Mail className="w-3 h-3"/> {selectedQuote.client_email}</div>
                                   </div>
                                   <div>
                                     <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Localisation</h4>
                                     <div className="flex items-center gap-2 text-sm text-foreground font-bold mt-1"><MapPin className="w-3 h-3 text-primary"/> {selectedQuote.client_location}</div>
                                     <p className="text-xs text-muted-foreground mt-1 font-medium italic">{selectedQuote.client_address}</p>
                                   </div>
                                 </div>

                                 <div>
                                   <h4 className="text-sm font-black font-sans uppercase mb-4 text-primary tracking-wider">Services Demandés</h4>
                                   <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                      {selectedQuote.quote_items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg border border-border/30">
                                          <div>
                                            <p className="font-bold text-foreground text-sm">{item.services?.title}</p>
                                            <p className="text-[11px] text-muted-foreground font-medium">{item.quantity} x {formatCurrency(item.unit_price)}</p>
                                          </div>
                                          <p className="font-black text-primary text-sm">{formatCurrency(item.total_price)}</p>
                                        </div>
                                      ))}
                                   </div>
                                 </div>

                                 <div className="border-t border-border pt-4 flex justify-between items-center">
                                    <div className="text-xs text-muted-foreground font-medium">
                                      {new Date(selectedQuote.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="text-2xl font-black text-primary font-sans">
                                      {formatCurrency(selectedQuote.total_amount)}
                                    </div>
                                 </div>
                               </div>
                             )}
                          </DialogContent>
                        </Dialog>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteQuote(quote.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
