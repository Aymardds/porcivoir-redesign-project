import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, Loader2, Tag } from 'lucide-react';
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

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des catégories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category: any = null) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || ''
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: ''
      });
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      // Automatic slug if empty
      const finalSlug = formData.slug || formData.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const payload = { 
        name: formData.name.trim(),
        slug: finalSlug,
        description: formData.description.trim() || null
      };

      let result;
      if (selectedCategory) {
        result = await supabase
          .from('categories')
          .update(payload)
          .eq('id', selectedCategory.id);
      } else {
        result = await supabase
          .from('categories')
          .insert([payload]);
      }

      if (result.error) throw result.error;
      
      toast.success(selectedCategory ? 'Catégorie mise à jour' : 'Catégorie créée');
      setIsOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message || 'Problème lors de l\'enregistrement'}`);
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la catégorie "${name}" ? Cela pourrait affecter l'affichage des produits liés.`)) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Catégorie supprimée');
      fetchCategories();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression : ' + error.message);
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Gestion des Catégories</h1>
          <p className="text-muted-foreground mt-1">
            Organisez vos produits par familles.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Catégorie
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une catégorie..."
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
                  Nom <ArrowUpDown className="w-3 h-3" />
                </th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-right text-transparent">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Chargement des catégories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Aucune catégorie trouvée.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <Tag className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-foreground">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{cat.slug}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                      {cat.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          onClick={() => handleOpenDialog(cat)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(cat.id, cat.name)}
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
        <DialogContent className="max-w-md bg-card border-border">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-sans">
                {selectedCategory ? 'Modifier la Catégorie' : 'Créer une Catégorie'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les détails de la catégorie.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase font-bold text-muted-foreground">Nom</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Viande de Porc"
                  className="bg-secondary/50 border-transparent focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs uppercase font-bold text-muted-foreground">Slug (URL)</Label>
                <Input 
                  id="slug" 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  placeholder="Ex: viande-de-porc"
                  className="bg-secondary/50 border-transparent focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc" className="text-xs uppercase font-bold text-muted-foreground">Description (Optionnel)</Label>
                <Textarea 
                  id="desc" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="bg-secondary/50 border-transparent focus:border-primary min-h-[80px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={actionLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={actionLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedCategory ? 'Enregistrer' : 'Créer')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
