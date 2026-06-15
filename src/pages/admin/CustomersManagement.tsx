import { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { Search, User, Filter, ShoppingBag, MapPin, Calendar, MessageCircle, ArrowRight, DollarSign, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CustomerData {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  address: string;
  created_at: string;
  is_registered: boolean;
  total_orders: number;
  total_spent: number;
}

const orderStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-800" },
  processing: { label: "En préparation", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "En cours de livraison", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800" },
  refunded: { label: "Remboursée", color: "bg-gray-100 text-gray-800" }
};

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog state
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [selectedCustomerOrders, setSelectedCustomerOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // 1. Fetch registered profiles
      const { data: profilesData, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('role', 'customer');

      if (profilesError) throw profilesError;

      // 2. Fetch all orders
      const { data: ordersData, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setAllOrders(ordersData || []);

      const customerMap = new Map<string, CustomerData>();

      // A. Populate registered profiles first
      (profilesData || []).forEach((profile) => {
        customerMap.set(profile.id, {
          id: profile.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
          city: profile.city || 'Abidjan',
          address: profile.address || '',
          created_at: profile.created_at,
          is_registered: true,
          total_orders: 0,
          total_spent: 0,
        });
      });

      // B. Process orders to link info and capture guest accounts
      (ordersData || []).forEach((order) => {
        const amount = Number(order.total_amount) || 0;
        
        if (order.user_id && customerMap.has(order.user_id)) {
          // Registered customer: update info if missing on profile
          const client = customerMap.get(order.user_id)!;
          client.total_orders += 1;
          client.total_spent += amount;
          
          if (!client.first_name && !client.last_name && order.customer_name) {
            const parts = order.customer_name.trim().split(' ');
            client.first_name = parts[0] || '';
            client.last_name = parts.slice(1).join(' ') || '';
          }
          if (!client.phone && order.customer_phone) {
            client.phone = order.customer_phone;
          }
          if (!client.address && order.shipping_address) {
            client.address = order.shipping_address;
            client.city = order.shipping_area || client.city;
          }
        } else {
          // Guest checkout customer: group by normalized phone number
          const phoneKey = order.customer_phone ? order.customer_phone.replace(/\D/g, '') : '';
          const guestKey = phoneKey || order.customer_name || `guest-${order.id}`;

          if (customerMap.has(guestKey)) {
            const client = customerMap.get(guestKey)!;
            client.total_orders += 1;
            client.total_spent += amount;
          } else {
            const parts = (order.customer_name || 'Client Invité').trim().split(' ');
            const firstName = parts[0] || '';
            const lastName = parts.slice(1).join(' ') || '';

            customerMap.set(guestKey, {
              id: guestKey,
              first_name: firstName,
              last_name: lastName,
              phone: order.customer_phone || '',
              city: order.shipping_area || 'Abidjan',
              address: order.shipping_address || '',
              created_at: order.created_at,
              is_registered: false,
              total_orders: 1,
              total_spent: amount,
            });
          }
        }
      });

      // Sort by creation / order date
      const sortedCustomers = Array.from(customerMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setCustomers(sortedCustomers);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des clients');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    // Find all orders for this customer
    const filteredOrders = allOrders.filter(
      (order) =>
        order.user_id === customer.id ||
        (order.customer_phone && order.customer_phone.replace(/\D/g, '') === customer.phone.replace(/\D/g, ''))
    );
    setSelectedCustomerOrders(filteredOrders);
  };

  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
    const phone = customer.phone.replace(/\D/g, '');
    const term = searchTerm.toLowerCase();
    
    return fullName.includes(term) || phone.includes(term) || customer.city.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre base de clients (membres & invités) et suivez leur historique d'achat.
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
              placeholder="Rechercher par nom, numéro ou quartier..."
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
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Téléphone</th>
                <th className="px-6 py-4 font-medium">Localisation</th>
                <th className="px-6 py-4 font-medium">Commandes</th>
                <th className="px-6 py-4 font-medium">Total Dépensé</th>
                <th className="px-6 py-4 font-medium">Date d'inscription/Achat</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Chargement des clients...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const name = `${customer.first_name} ${customer.last_name}`.trim() || 'Client sans nom';
                  return (
                    <tr key={customer.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {customer.first_name?.charAt(0) || <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-medium text-foreground block">
                              {name}
                            </span>
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 ${
                              customer.is_registered 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {customer.is_registered ? 'Membre' : 'Invité'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {customer.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {customer.city || '-'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-bold">
                        {customer.total_orders} {customer.total_orders > 1 ? 'commandes' : 'commande'}
                      </td>
                      <td className="px-6 py-4 text-primary font-bold">
                        {customer.total_spent.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenDetails(customer)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          Détails
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={selectedCustomer !== null} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        {selectedCustomer && (
          <DialogContent className="max-w-3xl bg-card border-border sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-center pr-4">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Fiche Client : {selectedCustomer.first_name} {selectedCustomer.last_name}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Customer Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-secondary/10 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Statut</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-sm px-2.5 py-1 rounded-full font-black uppercase ${
                      selectedCustomer.is_registered 
                        ? 'bg-primary/20 text-primary border border-primary/20' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {selectedCustomer.is_registered ? 'Membre enregistré' : 'Client Invité'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/10 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Commandé</span>
                  <div className="mt-2 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    <span className="text-lg font-black text-foreground">{selectedCustomer.total_orders} commandes</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/10 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Valeur Client (LTV)</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-black text-primary">{selectedCustomer.total_spent.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h4 className="text-sm font-bold uppercase text-muted-foreground">Informations de contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">Téléphone :</span>
                    <span className="text-foreground font-bold">{selectedCustomer.phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">Date de création :</span>
                    <span className="text-foreground font-bold">{new Date(selectedCustomer.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-start gap-2 md:col-span-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-muted-foreground">Adresse par défaut :</span>
                      <span className="text-foreground block font-bold mt-0.5">
                        {selectedCustomer.address || 'Non renseignée'}
                        {selectedCustomer.city && <span className="text-primary ml-1 font-semibold">({selectedCustomer.city})</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedCustomer.phone && (
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                      Contacter sur WhatsApp
                    </a>
                  </div>
                )}
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase text-muted-foreground">Historique des commandes</h4>
                {selectedCustomerOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic bg-secondary/5 p-4 rounded-xl text-center border border-border">
                    Aucune commande passée dans le système pour l'instant.
                  </p>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-secondary/30 text-muted-foreground uppercase">
                        <tr>
                          <th className="px-4 py-3">Commande ID</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Montant</th>
                          <th className="px-4 py-3">Paiement</th>
                          <th className="px-4 py-3 text-right">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedCustomerOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-secondary/10 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold">
                              #{order.id.split('-')[0].toUpperCase()}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 py-3 font-bold text-foreground">
                              {Number(order.total_amount).toLocaleString('fr-FR')} FCFA
                            </td>
                            <td className="px-4 py-3 text-muted-foreground uppercase">
                              {order.payment_method === 'online' ? 'Ligne (CinetPay)' : 'Livraison (COD)'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${orderStatusMap[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                                {orderStatusMap[order.status]?.label || order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
