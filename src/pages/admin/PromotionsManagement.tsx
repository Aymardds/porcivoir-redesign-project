import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { Tag, Plus, Search, Trash2, Edit2, Calendar, Percent, Banknote, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function PromotionsManagement() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_percent: '',
    discount_amount: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
    is_featured: false,
    max_uses: '',
    product_ids: [] as string[]
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchPromotions(), fetchProducts()]);
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, sku')
        .order('title');
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('promotions')
        .select('*')
        .order('valid_until', { ascending: true });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des promotions');
      console.error(error);
    }
  };

  const handleOpenDialog = async (promo: any = null) => {
    if (promo) {
      setEditingPromo(promo);
      
      // Fetch linked products
      const { data: linked } = await supabaseAdmin
        .from('promotion_products')
        .select('product_id')
        .eq('promotion_id', promo.id);
      
      const productIds = linked?.map(l => l.product_id) || [];

      setFormData({
        code: promo.code,
        description: promo.description || '',
        discount_percent: promo.discount_percent?.toString() || '',
        discount_amount: promo.discount_amount?.toString() || '',
        valid_from: promo.valid_from ? new Date(promo.valid_from).toISOString().split('T')[0] : '',
        valid_until: promo.valid_until ? new Date(promo.valid_until).toISOString().split('T')[0] : '',
        is_active: promo.is_active,
        is_featured: promo.is_featured || false,
        max_uses: promo.max_uses?.toString() || '',
        product_ids: productIds
      });
    } else {
      setEditingPromo(null);
      setFormData({
        code: '',
        description: '',
        discount_percent: '',
        discount_amount: '',
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
        is_active: true,
        is_featured: false,
        max_uses: '',
        product_ids: []
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code) {
      toast.error('Le code est obligatoire');
      return;
    }

    try {
      const { product_ids, ...baseFormData } = formData;
      const payload = {
        ...baseFormData,
        discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : null,
        discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        is_featured: formData.is_featured,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null
      };

      if (editingPromo) {
        const { error } = await supabaseAdmin
          .from('promotions')
          .update(payload)
          .eq('id', editingPromo.id);
        if (error) throw error;
        
        // Update product links: delete old, insert new
        const { error: deleteError } = await supabaseAdmin.from('promotion_products').delete().eq('promotion_id', editingPromo.id);
        if (deleteError) throw deleteError;

        if (formData.product_ids.length > 0) {
          // Unique IDs only to prevent 409
          const uniqueProductIds = Array.from(new Set(formData.product_ids));
          const links = uniqueProductIds.map(pid => ({ promotion_id: editingPromo.id, product_id: pid }));
          const { error: insertError } = await supabaseAdmin.from('promotion_products').insert(links);
          if (insertError) throw insertError;
        }
        
        toast.success('Promotion mise à jour');
      } else {
        const { data: newPromo, error } = await supabaseAdmin
          .from('promotions')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        
        if (formData.product_ids.length > 0 && newPromo) {
          const uniqueProductIds = Array.from(new Set(formData.product_ids));
          const links = uniqueProductIds.map(pid => ({ promotion_id: (newPromo as any).id, product_id: pid }));
          const { error: insertError } = await supabaseAdmin.from('promotion_products').insert(links);
          if (insertError) throw insertError;
        }
        
        toast.success('Nouvelle promotion créée');
      }
      setIsDialogOpen(false);
      fetchPromotions();
    } catch (err: any) {
      console.error('Save Error:', err);
      if (err.code === '23505') {
        toast.error(`Le code "${formData.code}" existe déjà.`);
      } else {
        toast.error('Erreur: ' + (err.message || 'Impossible d\'enregistrer'));
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer ce code promo ?')) return;
    try {
      const { error } = await supabaseAdmin.from('promotions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Promotion supprimée');
      fetchPromotions();
    } catch (err: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredPromotions = promotions.filter(
    (promo) => promo.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Promotions & Offres</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos codes de réduction et campagnes promotionnelles.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg overflow-hidden border-border/50 ring-1 ring-black/5">
            <DialogHeader className="bg-secondary/20 p-6">
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold font-sans">
                {editingPromo ? 'Modifier la promotion' : 'Nouvelle promotion'}
              </DialogTitle>
              <DialogDescription>
                Créez une offre spéciale pour vos clients. Vous pouvez utiliser un pourcentage ou un montant fixe.
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="promo_code">Code Promo <span className="text-destructive">*</span></Label>
                  <Input 
                    id="promo_code" 
                    placeholder="BIENVENUE10" 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="font-mono font-bold uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_uses">Limite d'utilisation</Label>
                  <Input 
                    id="max_uses" 
                    type="number" 
                    placeholder="Illimité" 
                    value={formData.max_uses} 
                    onChange={e => setFormData({...formData, max_uses: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Réduction de 10% pour les nouveaux clients..." 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="resize-none"
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl border border-border">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 px-1">
                    <Percent className="w-4 h-4 opacity-70" /> Pourcentage (%)
                  </Label>
                  <Input 
                    type="number" 
                    placeholder="15" 
                    value={formData.discount_percent} 
                    onChange={e => setFormData({...formData, discount_percent: e.target.value, discount_amount: ''})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 px-1">
                    <Banknote className="w-4 h-4 opacity-70" /> Montant (FCFA)
                  </Label>
                  <Input 
                    type="number" 
                    placeholder="5000" 
                    value={formData.discount_amount} 
                    onChange={e => setFormData({...formData, discount_amount: e.target.value, discount_percent: ''})}
                  />
                </div>
                <p className="md:col-span-2 text-[10px] text-muted-foreground italic px-1">
                  * Remplissez l'un des deux uniquement.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valide à partir du</Label>
                  <Input 
                    id="valid_from" 
                    type="date" 
                    value={formData.valid_from} 
                    onChange={e => setFormData({...formData, valid_from: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Date d'expiration</Label>
                  <Input 
                    id="valid_until" 
                    type="date" 
                    value={formData.valid_until} 
                    onChange={e => setFormData({...formData, valid_until: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Produits éligibles
                </Label>
                <div className="bg-secondary/20 rounded-xl border border-border p-4 max-h-[160px] overflow-y-auto space-y-2">
                  {products.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-4">Aucun produit trouvé dans l'inventaire.</p>
                  ) : (
                    products.map(product => (
                      <div key={product.id} className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id={`prod-${product.id}`}
                          checked={formData.product_ids.includes(product.id)}
                          onChange={(e) => {
                            const ids = e.target.checked 
                              ? Array.from(new Set([...formData.product_ids, product.id]))
                              : formData.product_ids.filter(id => id !== product.id);
                            setFormData({...formData, product_ids: ids});
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor={`prod-${product.id}`} className="text-xs font-medium cursor-pointer flex-1">
                          {product.title} <span className="text-[10px] text-muted-foreground ml-2">{product.sku}</span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground italic px-1">
                  * Si aucun produit n'est sélectionné, la promotion s'applique à tout le catalogue.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Activer cette offre</Label>
                  <p className="text-xs text-muted-foreground">La promotion sera visible au checkout</p>
                </div>
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={checked => setFormData({...formData, is_active: checked})} 
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-accent-foreground">Mettre à la une (Countdown)</Label>
                  <p className="text-[10px] text-muted-foreground">Affiche le compte à rebours sur l'accueil</p>
                </div>
                <Switch 
                  checked={formData.is_featured} 
                  onCheckedChange={checked => setFormData({...formData, is_featured: checked})} 
                />
              </div>
            </div>

            <DialogFooter className="p-6 bg-secondary/10 border-t border-border">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-semibold">
                Annuler
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white font-bold min-w-[120px]">
                {editingPromo ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par code promotionnel..."
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
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Réduction</th>
                <th className="px-6 py-4 font-medium">Date de début</th>
                <th className="px-6 py-4 font-medium">Date de fin</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Chargement des promotions...
                  </td>
                </tr>
              ) : filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Aucune promotion trouvée.
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((promo) => {
                  const isExpired = new Date(promo.valid_until) < new Date();
                  return (
                    <tr key={promo.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 font-mono font-bold bg-secondary px-2 py-1 rounded">
                          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                          {promo.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {promo.discount_percent ? `${promo.discount_percent}%` : `${promo.discount_amount} FCFA`}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {promo.valid_from ? new Date(promo.valid_from).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {promo.valid_until ? new Date(promo.valid_until).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {promo.is_active && !isExpired ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-destructive font-medium">
                            <span className="w-2 h-2 rounded-full bg-destructive"></span>
                            {isExpired ? 'Expiré' : 'Inactif'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenDialog(promo)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(promo.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
