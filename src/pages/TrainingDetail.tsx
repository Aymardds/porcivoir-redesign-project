import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Calendar, User, CreditCard, ChevronLeft, Loader2, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function TrainingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [training, setTraining] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [existingSubscription, setExistingSubscription] = useState<any>(null);

    useEffect(() => {
        fetchTraining();
        if (user) {
            checkExistingSubscription();
        }
    }, [id, user]);

    const fetchTraining = async () => {
        try {
            const { data, error } = await supabase
                .from("trainings")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            setTraining(data);
        } catch (err) {
            console.error(err);
            toast.error("Impossible de charger les détails de la formation");
            navigate("/formations");
        } finally {
            setLoading(false);
        }
    };

    const checkExistingSubscription = async () => {
        try {
            const { data, error } = await supabase
                .from("training_subscriptions")
                .select("*")
                .eq("user_id", user?.id)
                .eq("training_id", id)
                .eq("payment_status", "paid")
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned, which is fine
            if (data) setExistingSubscription(data);
        } catch (err) {
            console.error("Error checking subscription:", err);
        }
    };

    const handleSubscribe = async () => {
        if (!user) {
            toast.error("Veuillez vous connecter pour souscrire à la formation");
            navigate("/login", { state: { returnTo: `/formations/${id}` } });
            return;
        }

        setSubscribing(true);

        try {
            // 1. Create a pending subscription
            const { data: subData, error: subError } = await supabase
                .from("training_subscriptions")
                .insert({
                    user_id: user.id,
                    training_id: training.id,
                    payment_status: "pending",
                })
                .select()
                .single();

            if (subError) throw subError;

            // 2. Initialize CinetPay
            const CP = (window as any).CinetPay;
            if (!CP) {
                throw new Error("Service de paiement non disponible");
            }

            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const notifyUrl = isLocalhost
                ? 'https://porcivoire.vercel.app/api/cinetpay-notify'
                : `${window.location.origin}/api/cinetpay-notify`;

            CP.setConfig({
                apikey: import.meta.env.VITE_CINETPAY_API_KEY,
                site_id: import.meta.env.VITE_CINETPAY_SITE_ID,
                notify_url: notifyUrl,
                mode: 'PRODUCTION',
            });

            const transactionId = `TRN${Date.now()}${Math.floor(Math.random() * 1000)}`;

            const payload = {
                transaction_id: transactionId,
                amount: Math.floor(training.price),
                currency: 'XOF',
                channels: 'ALL',
                description: `Inscription: ${training.title.substring(0, 30)}`,
                customer_name: (profile?.last_name || 'Client').substring(0, 50),
                customer_surname: (profile?.first_name || 'Client').substring(0, 50),
                customer_email: user.email || 'client@porcivoire.ci',
                customer_phone_number: '00000000', // Need phone typically, but we don't strictly have it in base profile
                customer_city: 'Abidjan',
                customer_country: 'CI',
                customer_state: 'CI',
                customer_zip_code: '00225',
            };

            CP.getCheckout(payload);

            CP.waitResponse(async (data: any) => {
                if (data.status === 'ACCEPTED') {
                    // Update subscription to paid
                    const { error: updateError } = await supabase
                        .from("training_subscriptions")
                        .update({
                            payment_status: "paid",
                            payment_reference: transactionId
                        })
                        .eq("id", subData.id);

                    if (updateError) {
                        console.error(updateError);
                        toast.error("Le paiement a réussi mais l'enregistrement a échoué. Contactez le support.");
                    } else {
                        toast.success("Félicitations ! Vous êtes inscrit à la formation.");
                        checkExistingSubscription();
                    }
                } else {
                    // Update to failed
                    await supabase
                        .from("training_subscriptions")
                        .update({ payment_status: "failed", payment_reference: transactionId })
                        .eq("id", subData.id);

                    toast.error("Le paiement a échoué ou a été annulé.");
                }
                setSubscribing(false);
            });

            CP.onError((data: any) => {
                console.error('CinetPay onError:', data);
                toast.error("Une erreur s'est produite avec le terminal de paiement.");
                setSubscribing(false);
            });

        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Une erreur s'est produite lors de la souscription.");
            setSubscribing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    if (!training) return null;

    return (
        <div className="min-h-screen bg-secondary pb-20">
            <div className="bg-card border-b border-border">
                <div className="container py-8 px-4">
                    <Link to="/formations" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Retour aux formations
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-6">
                            <h1 className="text-3xl md:text-5xl font-black font-sans text-foreground leading-tight">
                                {training.title}
                            </h1>

                            <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
                                <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    Du {new Date(training.start_date).toLocaleDateString('fr-FR')}
                                    <span className="opacity-50 mx-1">au</span>
                                    {new Date(training.end_date).toLocaleDateString('fr-FR')}
                                </div>
                                {training.expert_trainer && (
                                    <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
                                        <User className="w-4 h-4 text-primary" />
                                        Par {training.expert_trainer}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-start-3 lg:row-start-1 lg:row-span-2">
                            <div className="bg-background rounded-3xl border border-border p-6 shadow-xl sticky top-24">
                                {training.cover_image && (
                                    <img
                                        src={training.cover_image}
                                        alt={training.title}
                                        className="w-full h-48 object-cover rounded-2xl mb-6 shadow-sm"
                                    />
                                )}

                                <div className="text-center mb-6">
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Frais d'inscription</p>
                                    <p className="text-4xl font-black text-primary font-sans">{training.price.toLocaleString("fr-FR")} <span className="text-xl">FCFA</span></p>
                                </div>

                                {existingSubscription ? (
                                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                        <p className="font-bold text-green-800">Vous êtes déjà inscrit !</p>
                                        <p className="text-sm text-green-700 mt-1">Votre place est confirmée et payée.</p>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleSubscribe}
                                        disabled={subscribing}
                                        className="w-full h-14 text-lg font-black rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                                    >
                                        {subscribing ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5" />
                                                S'inscrire et Payer
                                            </>
                                        )}
                                    </Button>
                                )}

                                <div className="mt-6 space-y-3 text-sm text-muted-foreground font-medium">
                                    <div className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-primary/60" /> Paiement 100% sécurisé</div>
                                    <div className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-primary/60" /> Accès immédiat confirmé</div>
                                    <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-primary/60" /> Places limitées</div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 prose prose-zinc max-w-none">
                            <h3 className="text-2xl font-black font-sans text-foreground mb-4 border-b border-border pb-2">Description & Programme</h3>
                            <div
                                className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg"
                                dangerouslySetInnerHTML={{ __html: training.content?.replace(/\n/g, '<br/>') || 'Aucune description fournie.' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
