import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Search, Loader2, BookOpen, User, CreditCard, Calendar, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function TrainingSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch subscriptions with training details
            const { data: subsData, error: subsError } = await supabase
                .from('training_subscriptions')
                .select(`
          *,
          trainings (
            title, price
          )
        `)
                .order('created_at', { ascending: false });

            if (subsError) throw subsError;

            const userIds = [...new Set((subsData || []).map(s => s.user_id))];

            // Fetch profiles for these users
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email')
                .in('id', userIds);

            if (profilesError) throw profilesError;

            const profileMap: Record<string, any> = {};
            profilesData?.forEach(p => {
                profileMap[p.id] = p;
            });

            setProfiles(profileMap);
            setSubscriptions(subsData || []);
        } catch (error: any) {
            toast.error('Erreur lors du chargement des souscriptions');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'paid') return <span className="bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Payé</span>;
        if (status === 'failed') return <span className="bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Échoué</span>;
        return <span className="bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> En attente</span>;
    };

    const filteredSubs = subscriptions.filter(s => {
        const p = profiles[s.user_id];
        const search = searchTerm.toLowerCase();
        return (
            s.trainings?.title?.toLowerCase().includes(search) ||
            p?.first_name?.toLowerCase().includes(search) ||
            p?.last_name?.toLowerCase().includes(search) ||
            p?.email?.toLowerCase().includes(search) ||
            s.payment_reference?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black font-sans text-foreground">Souscriptions aux Formations</h1>
                    <p className="text-muted-foreground mt-1 font-medium">
                        Suivez les inscriptions clients et le statut de leurs paiements.
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden ring-1 ring-black/5">
                <div className="p-4 border-b border-border bg-secondary/20">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom, formation, référence..."
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
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Formation</th>
                                <th className="px-6 py-4">Paiement</th>
                                <th className="px-6 py-4">Date Inscription</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary opacity-20" />
                                        Chargement...
                                    </td>
                                </tr>
                            ) : filteredSubs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-medium">
                                        Aucune souscription trouvée.
                                    </td>
                                </tr>
                            ) : (
                                filteredSubs.map((sub) => {
                                    const p = profiles[sub.user_id] || {};
                                    return (
                                        <tr key={sub.id} className="hover:bg-secondary/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                                                        {(p.first_name?.[0] || '?') + (p.last_name?.[0] || '')}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground">
                                                            {p.first_name} {p.last_name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground break-all">{p.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-primary" />
                                                    <span className="font-semibold text-foreground">{sub.trainings?.title}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {sub.trainings?.price?.toLocaleString('fr-FR')} FCFA
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    {getStatusBadge(sub.payment_status)}
                                                    {sub.payment_reference && (
                                                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 bg-secondary w-fit px-2 py-0.5 rounded">
                                                            <CreditCard className="w-3 h-3" /> {sub.payment_reference}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(sub.created_at).toLocaleDateString('fr-FR')}
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
