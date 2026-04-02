import { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { Search, Eye, Filter, ArrowUpDown, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useEmailNotification } from '@/hooks/useEmailNotification';

export default function OrdersManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { sendEmail } = useEmailNotification();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des commandes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Auto-send email notification on shipping
      if (newStatus === 'shipped') {
        const order = orders.find(o => o.id === orderId);
        if (order?.profiles?.email) {
          const result = await sendEmail({
            order: { ...order, client_name: order.customer_name },
            type: 'order_shipped',
            client_email: order.customer_email || '',
          });
          if (result.success) {
            toast.success('Statut mis à jour + email expédition envoyé !');
          } else {
            toast.success('Statut mis à jour. (Email non envoyé : email client manquant)');
          }
        } else {
          toast.success('Statut de la commande mis à jour');
        }
      } else {
        toast.success('Statut de la commande mis à jour');
      }
      
      fetchOrders();
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const sendInvoiceEmail = async (order: any) => {
    if (!order?.customer_email) {
      toast.error('Email client non disponible');
      return;
    }
    toast.promise(
      sendEmail({
        order: { ...order, client_name: order.customer_name },
        type: 'order_confirmed',
        client_email: order.customer_email,
      }),
      {
        loading: 'Envoi de la facture...',
        success: 'Facture envoyée avec succès !',
        error: 'Erreur lors de l\'envoi',
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600';
      case 'processing': return 'bg-blue-500/10 text-blue-600';
      case 'shipped': return 'bg-purple-500/10 text-purple-600';
      case 'delivered': return 'bg-primary/10 text-primary';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      case 'refunded': return 'bg-gray-500/10 text-gray-600';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'En attente';
      case 'processing': return 'En cours';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      case 'refunded': return 'Remboursée';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer_phone && order.customer_phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Commandes</h1>
          <p className="text-muted-foreground mt-1">
            Gérez et suivez le traitement des commandes de vos clients.
          </p>
        </div>
        <Button variant="outline" className="text-foreground">
          <Filter className="w-4 h-4 mr-2" />
          Filtrer
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une commande (ID, Client)..."
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
                <th className="px-6 py-4 font-medium">N° Commande</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium flex items-center gap-1 cursor-pointer">
                  Date <ArrowUpDown className="w-3 h-3" />
                </th>
                <th className="px-6 py-4 font-medium">Total (FCFA)</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Chargement des commandes...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium font-mono text-xs">
                      #{order.id.split('-')[0]}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{order.customer_name || '—'}</span>
                      {order.customer_phone && <p className="text-xs text-muted-foreground">{order.customer_phone}</p>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {order.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1.5 rounded outline-none border-none cursor-pointer appearance-none pr-6 ${getStatusColor(order.status)}`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.25rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.2em 1.2em'
                        }}
                      >
                        <option value="pending">En attente</option>
                        <option value="processing">En cours</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                        <option value="refunded">Remboursée</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Envoyer la facture"
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => sendInvoiceEmail(order)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Eye className="w-4 h-4" />
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
