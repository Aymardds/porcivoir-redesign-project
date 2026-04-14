import { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { Search, Eye, Filter, ArrowUpDown, Mail, FileText, X, Loader2, Send, Download, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useEmailNotification } from '@/hooks/useEmailNotification';
import { generateInvoicePdf } from '@/utils/generateInvoicePdf';

export default function OrdersManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { sendEmail } = useEmailNotification();
  
  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    invoiceSentCount: 0,
    totalOrders: 0
  });

  // Invoice modal state
  const [invoiceModal, setInvoiceModal] = useState<{ open: boolean; order: any | null }>({ open: false, order: null });
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [sendingInvoice, setSendingInvoice] = useState(false);

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
      calculateStats(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des commandes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersList: any[]) => {
    const totalRevenue = ordersList
      .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
      .reduce((acc, o) => acc + Number(o.total_amount), 0);
    
    const pendingAmount = ordersList
      .filter(o => o.status === 'pending')
      .reduce((acc, o) => acc + Number(o.total_amount), 0);
    
    const invoiceSentCount = ordersList.filter(o => o.invoice_sent).length;

    setStats({
      totalRevenue,
      pendingAmount,
      invoiceSentCount,
      totalOrders: ordersList.length
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

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

  // Open invoice modal: load items then open
  const openInvoiceModal = async (order: any) => {
    try {
      // Step 1: fetch order items (names are stored directly in this table)
      const { data: items, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select('product_name, quantity, unit_price, total_price')
        .eq('order_id', order.id);

      if (itemsError) throw itemsError;

      const enrichedOrder = {
        ...order,
        items: (items || []).map((item: any) => ({
          product_name: item.product_name ?? 'Produit',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      };

      setInvoiceModal({ open: true, order: enrichedOrder });
      setInvoiceEmail(order.customer_email || '');
    } catch (err: any) {
      toast.error('Erreur lors du chargement des détails de la commande');
      console.error(err);
    }
  };



  const handleDownloadInvoice = (order: any) => {
    try {
      const pdfBase64 = generateInvoicePdf({
        id: order.id,
        customer_name: order.customer_name || 'Client',
        customer_phone: order.customer_phone,
        shipping_address: order.shipping_address,
        shipping_area: order.shipping_area,
        total_amount: order.total_amount,
        delivery_fee: order.delivery_fee,
        payment_method: order.payment_method,
        created_at: order.created_at,
        items: order.items,
      });

      // Simple browser download
      const link = document.createElement('a');
      link.href = pdfBase64;
      link.download = `Facture_PorcIvoire_${order.id.split('-')[0].toUpperCase()}.pdf`;
      link.click();
      toast.success('Facture téléchargée');
    } catch (err: any) {
      toast.error('Erreur de génération PDF');
    }
  };

  const handleSendInvoice = async () => {
    if (!invoiceModal.order) return;
    if (!invoiceEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoiceEmail)) {
      toast.error('Veuillez entrer une adresse email valide.');
      return;
    }

    setSendingInvoice(true);
    try {
      const order = invoiceModal.order;

      // Generate PDF
      const pdfBase64 = generateInvoicePdf({
        id: order.id,
        customer_name: order.customer_name || 'Client',
        customer_phone: order.customer_phone,
        shipping_address: order.shipping_address,
        shipping_area: order.shipping_area,
        total_amount: order.total_amount,
        delivery_fee: order.delivery_fee,
        payment_method: order.payment_method,
        created_at: order.created_at,
        items: order.items,
      });

      // Send via Resend
      const result = await sendEmail({
        order: { ...order, client_name: order.customer_name || 'Client' },
        type: 'invoice',
        client_email: invoiceEmail,
        invoice_base64: pdfBase64,
      });

      if (result.success) {
        // Update DB
        await supabaseAdmin
          .from('orders')
          .update({ invoice_sent: true, invoice_sent_at: new Date().toISOString() })
          .eq('id', order.id);

        toast.success(`Facture envoyée à ${invoiceEmail} !`);
        setInvoiceModal({ open: false, order: null });
        setInvoiceEmail('');
        fetchOrders(); // Refresh to update badge
      } else {
        toast.error("Échec de l'envoi. Vérifiez la configuration Resend.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la génération de la facture");
    } finally {
      setSendingInvoice(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600';
      case 'processing': return 'bg-blue-500/10 text-blue-600';
      case 'shipped': return 'bg-purple-500/10 text-purple-600';
      case 'delivered': return 'bg-primary/10 text-primary';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      case 'refunded': return 'bg-gray-500/10 text-gray-600';
      default: return 'bg-secondary text-muted-foreground';
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
        <div className="flex gap-2">
          <Button variant="outline" className="text-foreground">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
        </div>
      </div>

      {/* ── Billing Dashboard ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cumul CA</span>
          </div>
          <div>
            <h3 className="text-2xl font-black">{stats.totalRevenue.toLocaleString()} <small className="text-xs font-bold opacity-50 uppercase">FCFA</small></h3>
            <p className="text-xs text-muted-foreground mt-1">Chiffre d'affaires total TTC</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Encours</span>
          </div>
          <div>
            <h3 className="text-2xl font-black">{stats.pendingAmount.toLocaleString()} <small className="text-xs font-bold opacity-50 uppercase">FCFA</small></h3>
            <p className="text-xs text-muted-foreground mt-1">Commandes en attente</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary/80 rounded-lg">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Facturation</span>
          </div>
          <div>
            <h3 className="text-2xl font-black">{stats.invoiceSentCount} <span className="text-xs font-bold opacity-30">/ {stats.totalOrders}</span></h3>
            <p className="text-xs text-muted-foreground mt-1">Factures envoyées</p>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${(stats.invoiceSentCount / (stats.totalOrders || 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Moyenne</span>
          </div>
          <div>
            <h3 className="text-2xl font-black">{Math.round(stats.totalRevenue / (stats.totalOrders || 1)).toLocaleString()} <small className="text-xs font-bold opacity-50 uppercase">FCFA</small></h3>
            <p className="text-xs text-muted-foreground mt-1">Panier moyen brut</p>
          </div>
        </div>
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
                <th className="px-6 py-4 font-medium text-center">Facture</th>
                <th className="px-6 py-4 font-medium text-center">Statut</th>
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
                      <div className="flex justify-center">
                        {order.invoice_sent ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" /> ENVOYÉE
                            </span>
                            {order.invoice_sent_at && (
                              <span className="text-[9px] text-muted-foreground opacity-60">
                                {new Date(order.invoice_sent_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[10px] font-bold opacity-50">
                            <Clock className="w-3 h-3" /> NON-ENVOYÉE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
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
                        {/* Download button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          title="Télécharger la facture"
                          onClick={() => {
                            openInvoiceModal(order);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        
                        {/* Invoice button (Email) */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          title="Envoyer par Email"
                          onClick={() => openInvoiceModal(order)}
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

      {/* ── Invoice Modal ─────────────────────────────────────── */}
      {invoiceModal.open && invoiceModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !sendingInvoice && setInvoiceModal({ open: false, order: null })}
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Envoyer la facture</h2>
                  <p className="text-xs text-muted-foreground font-mono">
                    #{invoiceModal.order.id.split('-')[0].toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !sendingInvoice && setInvoiceModal({ open: false, order: null })}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order summary inside modal */}
            <div className="px-6 pt-5 pb-2">
              <div className="bg-secondary/40 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">{invoiceModal.order.customer_name || 'Client inconnu'}</p>
                    {invoiceModal.order.customer_phone && (
                      <p className="text-xs text-muted-foreground mt-0.5">{invoiceModal.order.customer_phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold text-foreground text-lg">
                      {invoiceModal.order.total_amount.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {invoiceModal.order.items.length} article{invoiceModal.order.items.length !== 1 ? 's' : ''} •{' '}
                  {new Date(invoiceModal.order.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="space-y-1.5 pb-5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email destinataire <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="client@email.com"
                    value={invoiceEmail}
                    onChange={(e) => setInvoiceEmail(e.target.value)}
                    className="pl-9 bg-secondary/50 border-transparent focus:border-primary"
                    disabled={sendingInvoice}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  La facture PDF sera jointe à l'email envoyé via Resend.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 px-6 pb-6">
              <Button
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold"
                onClick={handleSendInvoice}
                disabled={sendingInvoice}
              >
                {sendingInvoice ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Envoi en cours...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" />Envoyer par Email</>
                )}
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-10 font-bold border-primary/20 hover:bg-primary/5 text-primary"
                  onClick={() => handleDownloadInvoice(invoiceModal.order)}
                  disabled={sendingInvoice}
                >
                  <Download className="w-4 h-4 mr-2" /> Télécharger (PDF)
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 h-10 font-medium"
                  onClick={() => setInvoiceModal({ open: false, order: null })}
                  disabled={sendingInvoice}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
