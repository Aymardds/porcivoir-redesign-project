import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, User, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des clients');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.first_name && customer.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.last_name && customer.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre base de clients et leurs informations.
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
              placeholder="Rechercher par nom ou numéro..."
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
                <th className="px-6 py-4 font-medium">Ville</th>
                <th className="px-6 py-4 font-medium">Date d'inscription</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Chargement des clients...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {customer.first_name?.charAt(0) || <User className="w-4 h-4" />}
                        </div>
                        <span className="font-medium text-foreground">
                          {customer.first_name} {customer.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {customer.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {customer.city || '-'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                        Voir profil
                      </Button>
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
