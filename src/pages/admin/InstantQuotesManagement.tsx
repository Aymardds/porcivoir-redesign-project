import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import {
    Plus, Edit, Trash2, Search, Loader2, Setting, Settings2, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function InstantQuotesManagement() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
    
    // Pour template seul
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [templateForm, setTemplateForm] = useState({
        name: '',
        fee_amount: 25999,
        imprevus_percentage: 5.0,
        is_active: true
    });

    // Pour items du template
    const [selectedTemplateForItems, setSelectedTemplateForItems] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [itemForm, setItemForm] = useState({
        lot_name: '',
        description: '',
        unit: 'm²',
        unit_price: 0
    });


    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('quote_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error: any) {
            toast.error('Erreur lors du chargement des modèles de devis');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async (templateId: string) => {
        setLoadingItems(true);
        try {
            const { data, error } = await supabase
                .from('quote_template_items')
                .select('*')
                .eq('template_id', templateId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (error: any) {
            toast.error('Erreur lors du chargement des lots');
            console.error(error);
        } finally {
            setLoadingItems(false);
        }
    };

    // --- TEMPLATE ACTIONS ---
    const openTemplateDialog = (template: any = null) => {
        setEditingTemplate(template);
        if (template) {
            setTemplateForm({
                name: template.name,
                fee_amount: template.fee_amount,
                imprevus_percentage: template.imprevus_percentage,
                is_active: template.is_active
            });
        } else {
            setTemplateForm({ name: '', fee_amount: 25999, imprevus_percentage: 5.0, is_active: true });
        }
        setIsTemplateDialogOpen(true);
    };

    const saveTemplate = async () => {
        if (!templateForm.name || templateForm.fee_amount < 0) {
            toast.error('Informations invalides');
            return;
        }

        try {
            if (editingTemplate) {
                const { error } = await supabaseAdmin.from('quote_templates').update(templateForm).eq('id', editingTemplate.id);
                if (error) throw error;
                toast.success('Modèle mis à jour');
            } else {
                const { error } = await supabaseAdmin.from('quote_templates').insert(templateForm);
                if (error) throw error;
                toast.success('Modèle créé');
            }
            setIsTemplateDialogOpen(false);
            fetchTemplates();
        } catch (err) {
            toast.error('Erreur de sauvegarde');
        }
    };

    const toggleTemplateStatus = async (id: string, current: boolean) => {
        try {
            await supabaseAdmin.from('quote_templates').update({ is_active: !current }).eq('id', id);
            fetchTemplates();
        } catch(e) {}
    }


    // --- ITEMS ACTIONS ---
    const openItemsDialog = (template: any) => {
        setSelectedTemplateForItems(template);
        fetchItems(template.id);
        setIsItemsDialogOpen(true);
        setEditingItem(null);
        setItemForm({ lot_name: '', description: '', unit: 'm²', unit_price: 0 });
    };

    const saveItem = async () => {
        if (!itemForm.lot_name || itemForm.unit_price < 0) return toast.error('Remplissez les champs obligatoires');
        try {
            if (editingItem) {
                await supabaseAdmin.from('quote_template_items').update(itemForm).eq('id', editingItem.id);
                toast.success('Lot mis à jour');
            } else {
                await supabaseAdmin.from('quote_template_items').insert({ ...itemForm, template_id: selectedTemplateForItems.id });
                toast.success('Lot ajouté');
            }
            fetchItems(selectedTemplateForItems.id);
            setEditingItem(null);
            setItemForm({ lot_name: '', description: '', unit: 'm²', unit_price: 0 });
        } catch (err) {
            toast.error('Erreur lors de la sauvegarde du lot');
        }
    };

    const deleteItem = async (id: string) => {
        if(!confirm('Supprimer ce lot de travaux ?')) return;
        try {
            await supabaseAdmin.from('quote_template_items').delete().eq('id', id);
            toast.success('Supprimé');
            fetchItems(selectedTemplateForItems.id);
        } catch (err) {
            toast.error('Erreur');
        }
    }


    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black font-sans text-foreground">Modèles de Devis</h1>
                    <p className="text-muted-foreground mt-1 font-medium">
                        Gérez les devis modulaires instantanés (frais, lots, prix).
                    </p>
                </div>
                <Button onClick={() => openTemplateDialog(null)} className="bg-primary text-white font-bold shadow-sm">
                    <Plus className="w-5 h-5 mr-2" />
                    Nouveau Modèle
                </Button>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden ring-1 ring-black/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-[11px] font-bold">
                            <tr>
                                <th className="px-6 py-4">Nom du Service</th>
                                <th className="px-6 py-4">Frais Édition (FCFA)</th>
                                <th className="px-6 py-4">Marge Imprévus</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                            ) : templates.map((tpl) => (
                                <tr key={tpl.id} className="hover:bg-secondary/10">
                                    <td className="px-6 py-4 font-bold">{tpl.name}</td>
                                    <td className="px-6 py-4 font-black text-amber-600">{tpl.fee_amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-bold text-destructive">{tpl.imprevus_percentage}%</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Switch checked={tpl.is_active} onCheckedChange={() => toggleTemplateStatus(tpl.id, tpl.is_active)} />
                                            <span className={`text-[11px] font-bold uppercase ${tpl.is_active ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {tpl.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="outline" size="sm" onClick={() => openItemsDialog(tpl)} className="mr-2">
                                            <List className="w-4 h-4 mr-2" /> Lots de travaux
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openTemplateDialog(tpl)}>
                                            <Settings2 className="w-4 h-4 text-primary" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DIALOG MODÈLE */}
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogContent className="max-w-md bg-card">
                    <DialogHeader><DialogTitle>{editingTemplate ? 'Éditer Modèle' : 'Créer Modèle'}</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nom du service</Label>
                            <Input value={templateForm.name} onChange={e => setTemplateForm({...templateForm, name: e.target.value})} placeholder="Ex: Infrastructures..." />
                        </div>
                        <div>
                            <Label>Frais d'édition du devis (Paiement fixe FCFA)</Label>
                            <Input type="number" value={templateForm.fee_amount} onChange={e => setTemplateForm({...templateForm, fee_amount: parseInt(e.target.value) || 0})} />
                        </div>
                        <div>
                            <Label>Marge "Imprévus" (%)</Label>
                            <Input type="number" step="0.5" value={templateForm.imprevus_percentage} onChange={e => setTemplateForm({...templateForm, imprevus_percentage: parseFloat(e.target.value) || 0})} />
                        </div>
                        <Button className="w-full mt-4" onClick={saveTemplate}>Enregistrer</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* DIALOG LOTS DE TRAVAUX (ITEMS) */}
            <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
                <DialogContent className="max-w-3xl bg-card max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Lots de travaux: {selectedTemplateForItems?.name}</DialogTitle></DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 border-t pt-4">
                        {/* LEFT: Liste des lots */}
                        <div className="md:col-span-2 space-y-3">
                            <h3 className="font-bold text-sm uppercase text-muted-foreground mb-2">Lots actuels</h3>
                            {loadingItems ? <Loader2 className="animate-spin w-5 h-5" /> : items.map(item => (
                                <div key={item.id} className="p-3 bg-secondary/20 rounded-lg flex justify-between gap-4 border border-border">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-sm">{item.lot_name}</span>
                                            <span className="font-black text-primary text-sm">{item.unit_price.toLocaleString()} FCFA / {item.unit}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{item.description}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingItem(item); setItemForm({lot_name: item.lot_name, description: item.description, unit: item.unit, unit_price: item.unit_price}); }}>
                                            <Edit className="w-3 h-3 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteItem(item.id)}>
                                            <Trash2 className="w-3 h-3 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && !loadingItems && <p className="text-sm text-muted-foreground">Aucun lot pour ce modèle.</p>}
                        </div>

                        {/* RIGHT: Formulaire Item */}
                        <div className="bg-secondary/10 p-4 rounded-xl border border-border">
                            <h3 className="font-bold text-sm uppercase text-muted-foreground mb-4">
                                {editingItem ? 'Modifier le lot' : 'Ajouter un lot'}
                            </h3>
                            <div className="space-y-3">
                                <div><Label>Nom (ex: Gros Œuvre)</Label><Input size={1} className="text-sm" value={itemForm.lot_name} onChange={e=>setItemForm({...itemForm, lot_name: e.target.value})} /></div>
                                <div><Label>Description</Label><Input size={1} className="text-sm" value={itemForm.description} onChange={e=>setItemForm({...itemForm, description: e.target.value})} /></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><Label>Unité</Label><Input size={1} className="text-sm" value={itemForm.unit} onChange={e=>setItemForm({...itemForm, unit: e.target.value})} /></div>
                                    <div><Label>Prix (FCFA)</Label><Input type="number" size={1} className="text-sm" value={itemForm.unit_price} onChange={e=>setItemForm({...itemForm, unit_price: parseInt(e.target.value)||0})} /></div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    {editingItem && <Button variant="outline" size="sm" className="flex-1" onClick={() => {setEditingItem(null); setItemForm({lot_name:'', description:'', unit:'m²', unit_price:0})}}>Annuler</Button>}
                                    <Button size="sm" className="flex-1" onClick={saveItem}>{editingItem ? 'Mettre à jour' : 'Ajouter'}</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
