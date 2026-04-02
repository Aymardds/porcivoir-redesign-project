import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Layers, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

export default function ServicesManagement() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // States for Modals
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form States
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    is_active: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: servicesData }, { data: categoriesData }] = await Promise.all([
        supabase.from('services').select('*, service_categories(name)').order('title'),
        supabase.from('service_categories').select('*').order('name')
      ]);
      setServices(servicesData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // --- SERVICE ACTIONS ---

  const handleServiceSubmit = async () => {
    if (!serviceForm.title || !serviceForm.category_id || !serviceForm.price) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
    }

    try {
      const payload = {
        ...serviceForm,
        price: parseFloat(serviceForm.price as string)
      };

      if (editingService) {
        const { error } = await supabaseAdmin.from('services').update(payload).eq('id', editingService.id);
        if (error) throw error;
        toast.success('Service mis à jour');
      } else {
        const { error } = await supabaseAdmin.from('services').insert(payload);
        if (error) throw error;
        toast.success('Nouveau service ajouté');
      }
      setIsServiceModalOpen(false);
      setEditingService(null);
      setServiceForm({ title: '', description: '', price: '', category_id: '', is_active: true });
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce service ?')) return;
    try {
      const { error } = await supabaseAdmin.from('services').delete().eq('id', id);
      if (error) throw error;
      toast.success('Service supprimé');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleServiceActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabaseAdmin.from('services').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
      toast.success(currentStatus ? 'Service désactivé' : 'Service activé');
    } catch (error) {
      toast.error('Erreur de mise à jour');
    }
  };

  // --- CATEGORY ACTIONS ---

  const handleCategorySubmit = async () => {
    if (!categoryForm.name) {
        toast.error('Le nom de la catégorie est obligatoire');
        return;
    }

    try {
      if (editingCategory) {
        const { error } = await supabaseAdmin.from('service_categories').update(categoryForm).eq('id', editingCategory.id);
        if (error) throw error;
        toast.success('Catégorie mise à jour');
      } else {
        const { error } = await supabaseAdmin.from('service_categories').insert(categoryForm);
        if (error) throw error;
        toast.success('Nouvelle catégorie ajoutée');
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', icon: '' });
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Attention: Supprimer cette catégorie supprimera tous les services rattachés. Continuer ?')) return;
    try {
      const { error } = await supabaseAdmin.from('service_categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Catégorie supprimée');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.service_categories?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-sans text-foreground">Catalogue des Services</h1>
          <p className="text-muted-foreground mt-1 font-medium">Gérez votre offre de services et vos thématiques agricoles.</p>
        </div>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="bg-secondary/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="services" className="data-[state=active]:bg-card rounded-lg px-6 py-2 transition-all">
            <Briefcase className="w-4 h-4 mr-2" /> Services
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-card rounded-lg px-6 py-2 transition-all">
            <Layers className="w-4 h-4 mr-2" /> Catégories
          </TabsTrigger>
        </TabsList>

        {/* --- TABS: SERVICES --- */}
        <TabsContent value="services" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-col md:flex-row justify-between gap-4 py-2">
            <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                placeholder="Rechercher un service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-card border-border shadow-none"
                />
            </div>
            
            <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {setEditingService(null); setServiceForm({title: '', description: '', price: '', category_id: '', is_active: true})}} className="bg-primary hover:bg-primary/90 font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Ajouter un Service
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-card border-border rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold font-sans">
                    {editingService ? 'Modifier le Service' : 'Nouveau Service'}
                  </DialogTitle>
                  <DialogDescription className="sr-only">Formulaire de gestion des services individuels.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label>Titre du Service *</Label>
                    <Input 
                        value={serviceForm.title} 
                        onChange={e => setServiceForm({...serviceForm, title: e.target.value})}
                        placeholder="Ex: Étude de faisabilité"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prix (FCFA) *</Label>
                      <Input 
                        type="number" 
                        value={serviceForm.price} 
                        onChange={e => setServiceForm({...serviceForm, price: e.target.value})}
                        placeholder="50000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Catégorie *</Label>
                      <Select 
                        value={serviceForm.category_id} 
                        onValueChange={v => setServiceForm({...serviceForm, category_id: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={serviceForm.description} 
                      onChange={e => setServiceForm({...serviceForm, description: e.target.value})}
                      placeholder="Détaillez le contenu du service..."
                      className="h-24 resize-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                        checked={serviceForm.is_active} 
                        onCheckedChange={v => setServiceForm({...serviceForm, is_active: v})} 
                    />
                    <Label>Service actif (Affiché sur le site)</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsServiceModalOpen(false)}>Annuler</Button>
                  <Button onClick={handleServiceSubmit} className="bg-primary font-bold">Enregistrer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground font-sans uppercase text-[10px] tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4 text-center">Catégorie</th>
                    <th className="px-6 py-4">Prix</th>
                    <th className="px-6 py-4 text-center">Actif</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                     <tr><td colSpan={5} className="py-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                  ) : filteredServices.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-muted-foreground font-medium">Aucun service trouvé.</td></tr>
                  ) : filteredServices.map(service => (
                    <tr key={service.id} className="hover:bg-secondary/10 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{service.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{service.description}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                            {service.service_categories?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black">{(service.price || 0).toLocaleString()} <span className="text-[10px] font-normal opacity-50">FCFA</span></td>
                      <td className="px-6 py-4 text-center">
                         <button onClick={() => toggleServiceActive(service.id, service.is_active)} className="hover:scale-110 transition-transform">
                            {service.is_active ? 
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : 
                                <XCircle className="w-5 h-5 text-muted-foreground opacity-30 mx-auto" />
                            }
                         </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => {
                                setEditingService(service);
                                setServiceForm({
                                    title: service.title,
                                    description: service.description || '',
                                    price: service.price.toString(),
                                    category_id: service.category_id,
                                    is_active: service.is_active
                                });
                                setIsServiceModalOpen(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteService(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* --- TABS: CATEGORIES --- */}
        <TabsContent value="categories" className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-end mb-4">
                <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => {setEditingCategory(null); setCategoryForm({name: '', description: '', icon: ''})}} className="bg-primary hover:bg-primary/90 font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Nouvelle Catégorie
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-2xl">
                    <DialogHeader>
                    <DialogTitle className="text-xl font-bold font-sans">
                        {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">Formulaire de création et modification des catégories de services.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Emoji/Icône</Label>
                            <Input 
                                value={categoryForm.icon} 
                                onChange={e => setCategoryForm({...categoryForm, icon: e.target.value})}
                                placeholder="🐷"
                                className="col-span-1 text-center text-xl h-12"
                                maxLength={2}
                            />
                            <p className="col-span-2 text-[10px] text-muted-foreground">Un emoji pour identifier visuellement.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Nom de la catégorie *</Label>
                            <Input 
                                value={categoryForm.name} 
                                onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                                placeholder="Ex: Élevage Porcin"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea 
                                value={categoryForm.description} 
                                onChange={e => setCategoryForm({...categoryForm, description: e.target.value})}
                                placeholder="Description courte..."
                                className="h-20 resize-none font-sans text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleCategorySubmit} className="bg-primary font-bold">Enregistrer</Button>
                    </DialogFooter>
                </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                    <Card key={category.id} className="group relative bg-card border border-border p-6 rounded-2xl transition-all hover:shadow-lg hover:border-primary/30 flex flex-col items-start gap-4 ring-1 ring-black/5">
                        <div className="flex justify-between items-start w-full">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl group-hover:bg-primary/20 transition-colors">
                                {category.icon || '📁'}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-primary hover:bg-primary/10"
                                    onClick={() => {
                                        setEditingCategory(category);
                                        setCategoryForm({
                                            name: category.name,
                                            description: category.description || '',
                                            icon: category.icon || ''
                                        });
                                        setIsCategoryModalOpen(true);
                                    }}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteCategory(category.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-black font-sans uppercase tracking-tight text-foreground">{category.name}</h3>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-medium">{category.description || 'Aucune description fournie.'}</p>
                        </div>
                        <div className="mt-auto pt-4 border-t border-border/50 w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                             <span>Porcivoir Services</span>
                             <div className="flex items-center gap-1 text-primary">
                                {services.filter(s => s.category_id === category.id).length} Services 
                                <ChevronRight className="w-3 h-3" />
                             </div>
                        </div>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-card rounded-xl border border-border ${className}`}>
        {children}
    </div>
);
