import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function InventoryManagement() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: 0,
    original_price: 0,
    stock_quantity: 0,
    sku: '',
    image_url: '',
    category_id: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des produits');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      console.log('Categories fetched:', data);
      if (data) setCategories(data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('Impossible de charger les catégories : ' + error.message);
    }
  };

  const handleOpenDialog = (product: any = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        title: product.title || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price || 0,
        original_price: product.original_price || product.price || 0,
        stock_quantity: product.stock_quantity || 0,
        sku: product.sku || '',
        image_url: product.image_url || '',
        category_id: product.category_id || (categories.length > 0 ? categories[0].id : '')
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        title: '',
        slug: '',
        description: '',
        price: 0,
        original_price: 0,
        stock_quantity: 0,
        sku: '',
        image_url: '',
        category_id: categories.length > 0 ? categories[0].id : ''
      });
    }
    setIsOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image importée avec succès');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors de l\'upload : ' + (error.message || 'vérifiez que le bucket "product-images" existe en public'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      // Automatic slug if empty
      const finalSlug = formData.slug || formData.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Sanitize payload: Empty strings to NULL for UUID/numeric fields
      const payload: any = { 
        title: formData.title.trim(),
        slug: finalSlug,
        description: formData.description.trim() || null,
        price: Number(formData.price),
        original_price: Number(formData.original_price || formData.price),
        stock_quantity: Number(formData.stock_quantity),
        sku: formData.sku.trim() || null,
        image_url: formData.image_url.trim() || null,
        category_id: formData.category_id && formData.category_id !== "" ? formData.category_id : null
      };

      let result;
      if (selectedProduct) {
        result = await supabase
          .from('products')
          .update(payload)
          .eq('id', selectedProduct.id);
      } else {
        result = await supabase
          .from('products')
          .insert([payload]);
      }

      if (result.error) {
        console.error("Supabase Error Details:", result.error);
        throw result.error;
      }
      
      toast.success(selectedProduct ? 'Produit mis à jour' : 'Produit créé');
      setIsOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message || 'Problème lors de l\'enregistrement'}`);
      console.error("Full Error Object:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer "${name}" ?`)) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Produit supprimé');
      fetchProducts();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Inventaire & Produits</h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre catalogue, vos prix et vos stocks.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Produit
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit (Nom, SKU)..."
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
                <th className="px-6 py-4 font-medium flex items-center gap-1 cursor-pointer hover:text-foreground">
                  Produit <ArrowUpDown className="w-3 h-3" />
                </th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Prix Normal</th>
                <th className="px-6 py-4 font-medium">Prix Promo</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right text-transparent">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Chargement des produits...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Aucun produit trouvé. Vous pouvez en créer un nouveau.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Aucun</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{product.title}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{product.categories?.name || 'Général'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{product.sku || '-'}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className={product.original_price && product.original_price > product.price ? "line-through text-xs" : "font-medium"}>
                        {(product.original_price || product.price).toLocaleString()} FCFA
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.original_price && product.original_price > product.price ? (
                        <span className="text-primary font-bold">{product.price.toLocaleString()} FCFA</span>
                      ) : (
                        <span className="text-muted-foreground italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        product.stock_quantity > 10 ? 'bg-primary/10 text-primary' :
                        product.stock_quantity > 0 ? 'bg-orange-500/10 text-orange-500' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {product.stock_quantity} EN STOCK
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-primary font-bold uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span>
                          Masqué
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          onClick={() => handleOpenDialog(product)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(product.id, product.title)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-sans">
                {selectedProduct ? 'Modifier le Produit' : 'Créer un Produit'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les détails du produit ci-dessous. Les modifications sont instantanées.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-6">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="title" className="text-xs uppercase font-bold text-muted-foreground">Nom du produit</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="Ex: Porc entier"
                  className="bg-secondary/50 border-transparent focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="category" className="text-xs uppercase font-bold text-muted-foreground">Catégorie</Label>
                <select 
                  id="category"
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                  className="flex h-9 w-full rounded-md border border-transparent bg-secondary/50 px-3 py-1 text-sm shadow-sm transition-colors focus:border-primary outline-none"
                >
                  <option value="">Sélectionner</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="original_price" className="text-xs uppercase font-bold text-muted-foreground">Prix Normal</Label>
                <Input 
                  id="original_price" 
                  type="number" 
                  value={formData.original_price} 
                  onChange={e => setFormData({...formData, original_price: parseFloat(e.target.value)})} 
                  className="bg-secondary/50 border-transparent focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="price" className="text-xs uppercase font-bold text-muted-foreground">Prix Promotionnel</Label>
                <Input 
                  id="price" 
                  type="number" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                  className="bg-secondary/50 border-transparent border-primary/20 focus:border-primary font-bold text-primary"
                  required
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="stock" className="text-xs uppercase font-bold text-muted-foreground">Stock Quantité</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  value={formData.stock_quantity} 
                  onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} 
                  className="bg-secondary/50 border-transparent focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="sku" className="text-xs uppercase font-bold text-muted-foreground">SKU / Code</Label>
                <Input 
                  id="sku" 
                  value={formData.sku} 
                  onChange={e => setFormData({...formData, sku: e.target.value})} 
                  placeholder="PRC-123"
                  className="bg-secondary/50 border-transparent focus:border-primary"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Image du produit</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-16 h-16 rounded-lg bg-secondary border-dashed border-2 border-muted-foreground/30 flex items-center justify-center overflow-hidden">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <Search className="w-6 h-6 text-muted-foreground/20" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="cursor-pointer file:bg-primary file:text-primary-foreground file:border-none file:rounded file:px-2 file:mr-4 file:text-xs file:font-bold h-10"
                    />
                    <p className="text-[10px] text-muted-foreground">Format recommandé: 800x800px. Taille max: 2Mo.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="desc" className="text-xs uppercase font-bold text-muted-foreground">Description</Label>
                <Textarea 
                  id="desc" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="bg-secondary/50 border-transparent focus:border-primary min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={actionLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={actionLoading || uploadingImage} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedProduct ? 'Mettre à jour' : 'Ajouter')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
