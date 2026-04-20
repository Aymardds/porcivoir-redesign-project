import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import {
    Plus, Edit, Trash2, Search, Calendar, Users, Briefcase, Eye, Loader2, Image as ImageIcon, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function TrainingsManagement() {
    const [trainings, setTrainings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTraining, setEditingTraining] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        price: 0,
        expert_trainer: '',
        cover_image: '',
        start_date: '',
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('trainings')
                .select('*')
                .order('publish_date', { ascending: false });

            if (error) throw error;
            setTrainings(data || []);
        } catch (error: any) {
            toast.error('Erreur lors du chargement des formations');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            price: 0,
            expert_trainer: '',
            cover_image: '',
            start_date: '',
            end_date: '',
            is_active: true
        });
        setEditingTraining(null);
    };

    const openNewDialog = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const openEditDialog = (training: any) => {
        setEditingTraining(training);
        setFormData({
            title: training.title || '',
            content: training.content || '',
            price: training.price || 0,
            expert_trainer: training.expert_trainer || '',
            cover_image: training.cover_image || '',
            start_date: training.start_date ? training.start_date.split('T')[0] : '',
            end_date: training.end_date ? training.end_date.split('T')[0] : '',
            is_active: training.is_active
        });
        setIsDialogOpen(true);
    };

    const saveTraining = async () => {
        if (!formData.title || !formData.price || !formData.start_date || !formData.end_date) {
            toast.error('Veuillez remplir les champs obligatoires (Titre, Prix, Dates)');
            return;
        }

        try {
            const payload = {
                title: formData.title,
                content: formData.content,
                price: formData.price,
                expert_trainer: formData.expert_trainer,
                cover_image: formData.cover_image,
                start_date: formData.start_date,
                end_date: formData.end_date,
                is_active: formData.is_active
            };

            if (editingTraining) {
                const { error } = await supabaseAdmin
                    .from('trainings')
                    .update(payload)
                    .eq('id', editingTraining.id);

                if (error) throw error;
                toast.success('Formation mise à jour avec succès');
            } else {
                const { error } = await supabaseAdmin
                    .from('trainings')
                    .insert(payload);

                if (error) throw error;
                toast.success('Formation créée avec succès');
            }

            setIsDialogOpen(false);
            fetchTrainings();
        } catch (error: any) {
            console.error(error);
            toast.error('Erreur lors de la sauvegarde');
        }
    };

    const deleteTraining = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cette formation ?')) return;
        try {
            const { error } = await supabaseAdmin.from('trainings').delete().eq('id', id);
            if (error) throw error;
            toast.success('Formation supprimée');
            fetchTrainings();
        } catch (error: any) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabaseAdmin
                .from('trainings')
                .update({ is_active: !currentStatus })
                .eq('id', id);
            if (error) throw error;
            setTrainings(trainings.map(t => t.id === id ? { ...t, is_active: !currentStatus } : t));
        } catch (error) {
            toast.error('Erreur lors du changement de statut');
        }
    };

    const filteredTrainings = trainings.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.expert_trainer && t.expert_trainer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black font-sans text-foreground">Gestion des Formations</h1>
                    <p className="text-muted-foreground mt-1 font-medium">
                        Créez et gérez vos offres de formations, dates et tarifs.
                    </p>
                </div>
                <Button onClick={openNewDialog} className="bg-primary text-white font-bold shadow-sm">
                    <Plus className="w-5 h-5 mr-2" />
                    Nouvelle Formation
                </Button>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden ring-1 ring-black/5">
                <div className="p-4 border-b border-border bg-secondary/20">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une formation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full bg-background/50"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-[11px] font-bold">
                            <tr>
                                <th className="px-6 py-4">Formation</th>
                                <th className="px-6 py-4">Période</th>
                                <th className="px-6 py-4">Prix</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading && trainings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary opacity-20" />
                                        Chargement...
                                    </td>
                                </tr>
                            ) : filteredTrainings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        Aucune formation trouvée.
                                    </td>
                                </tr>
                            ) : (
                                filteredTrainings.map((training) => (
                                    <tr key={training.id} className="hover:bg-secondary/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground">{training.title}</div>
                                            {training.expert_trainer && (
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                    <Briefcase className="w-3 h-3" /> Expert: {training.expert_trainer}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs text-muted-foreground font-medium">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary/70" /> Du {new Date(training.start_date).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-destructive/70" /> Au {new Date(training.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-black">
                                            {training.price.toLocaleString('fr-FR')} FCFA
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={training.is_active}
                                                    onCheckedChange={() => toggleStatus(training.id, training.is_active)}
                                                />
                                                <span className={`text-[11px] font-bold uppercase ${training.is_active ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {training.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(training)} className="h-8 w-8 text-primary hover:bg-primary/10">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteTraining(training.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl bg-card border-border sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black font-sans uppercase">
                            {editingTraining ? 'Modifier la Formation' : 'Nouvelle Formation'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label>Titre *</Label>
                                <Input value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="Ex: Formation en élevage porcin" />
                            </div>

                            <div className="space-y-2">
                                <Label>Prix (FCFA) *</Label>
                                <Input type="number" value={formData.price} onChange={e => handleInputChange('price', parseFloat(e.target.value))} placeholder="Ex: 50000" />
                            </div>

                            <div className="space-y-2">
                                <Label>Formateur (Optionnel)</Label>
                                <Input value={formData.expert_trainer} onChange={e => handleInputChange('expert_trainer', e.target.value)} placeholder="Expert en charge" />
                            </div>

                            <div className="space-y-2">
                                <Label>Date de début *</Label>
                                <Input type="date" value={formData.start_date} onChange={e => handleInputChange('start_date', e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Date de fin *</Label>
                                <Input type="date" value={formData.end_date} onChange={e => handleInputChange('end_date', e.target.value)} />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Image de couverture (URL)</Label>
                                <div className="flex gap-2">
                                    <Input value={formData.cover_image} onChange={e => handleInputChange('cover_image', e.target.value)} placeholder="https://..." />
                                    {formData.cover_image && (
                                        <img src={formData.cover_image} alt="preview" className="h-10 w-10 object-cover rounded shadow" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Description & Programme</Label>
                                <Textarea value={formData.content} onChange={e => handleInputChange('content', e.target.value)} rows={6} placeholder="Détaillez le programme..." />
                            </div>

                            <div className="space-y-2 md:col-span-2 flex items-center justify-between p-4 bg-secondary/30 rounded border border-border">
                                <div>
                                    <h4 className="font-bold">Statut de la formation</h4>
                                    <p className="text-sm text-muted-foreground">Les formations inactives ne sont pas visibles par les clients.</p>
                                </div>
                                <Switch checked={formData.is_active} onCheckedChange={c => handleInputChange('is_active', c)} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                            <Button onClick={saveTraining} className="bg-primary text-white font-bold px-8">Enregistrer</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
