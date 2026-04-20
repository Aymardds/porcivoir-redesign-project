import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, Loader2, CreditCard, Calculator, FileText, Pickaxe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function InstantQuoteGenerator() {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    
    const [template, setTemplate] = useState<any>(null);
    const [templateItems, setTemplateItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [quantity, setQuantity] = useState<number>(100); // Default 100m2
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        if (!templateId) {
            navigate("/devis");
            return;
        }
        fetchTemplateData();
    }, [templateId]);

    const fetchTemplateData = async () => {
        try {
            // 1. Fetch Template
            const { data: tplData, error: tplError } = await supabase
                .from('quote_templates')
                .select('*')
                .eq('id', templateId)
                .single();
            if (tplError) throw tplError;

            // 2. Fetch Items
            const { data: itemsData, error: itemsError } = await supabase
                .from('quote_template_items')
                .select('*')
                .eq('template_id', templateId)
                .order('created_at', { ascending: true });
            if (itemsError) throw itemsError;

            setTemplate(tplData);
            setTemplateItems(itemsData || []);
        } catch (error) {
            toast.error("Modèle introuvable ou inactif.");
            navigate("/devis");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAndPay = async () => {
        if (!user) {
            toast.error("Veuillez vous connecter pour générer votre devis.");
            navigate("/login", { state: { returnTo: `/devis/generateur/${templateId}` } });
            return;
        }

        if (quantity < 10) {
            toast.error("La superficie minimum est de 10 m².");
            return;
        }

        setSubscribing(true);

        try {
            // 1. Calculer le total fictif pour la base de données (si désiré)
            // Mais pour instant_quotes, le système CinetPay va encaisser SEULEMENT les fee_amount
            const feeAmount = template.fee_amount;

            // Create initial Database entry
            // Prépare le snapshot exact tel qu'il est maintenant
            const snapshotItems = templateItems.map(item => ({
                lot_name: item.lot_name,
                description: item.description,
                unit: item.unit,
                unit_price: item.unit_price,
                quantity: quantity,
                total_line: quantity * item.unit_price
            }));
            
            const totalHt = snapshotItems.reduce((acc, curr) => acc + curr.total_line, 0);
            const imprevusAmount = Math.round(totalHt * (template.imprevus_percentage / 100));
            const totalTtc = totalHt + imprevusAmount;

            const { data: quoteData, error: quoteError } = await supabase
                .from('instant_quotes')
                .insert({
                    user_id: user.id,
                    client_email: user.email,
                    client_name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : '',
                    template_id: template.id,
                    input_quantity: quantity,
                    total_ht: totalHt,
                    imprevus_amount: imprevusAmount,
                    total_ttc: totalTtc,
                    fee_amount: feeAmount,
                    payment_status: 'pending',
                    snapshot: snapshotItems
                })
                .select()
                .single();

            if (quoteError) throw quoteError;

            // 2. Initialize CinetPay (pour payer les Frais)
            const CP = (window as any).CinetPay;
            if (!CP) throw new Error("Plateforme de paiement CinetPay indisponible.");

            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const notifyUrl = isLocalhost ? 'https://porcivoire.vercel.app/api/cinetpay-notify' : `${window.location.origin}/api/cinetpay-notify`;
            const returnUrl = isLocalhost ? `http://localhost:8080/mes-devis/resultat/${quoteData.id}` : `${window.location.origin}/mes-devis/resultat/${quoteData.id}`;

            CP.setConfig({
                apikey: import.meta.env.VITE_CINETPAY_API_KEY || '40538091862e63855a07ec5.86619961',
                site_id: import.meta.env.VITE_CINETPAY_SITE_ID || '893596',
                notify_url: notifyUrl,
                mode: 'PRODUCTION', // You might want sandbox if testing
            });

            const transactionId = `QTE${Date.now()}${Math.floor(Math.random() * 100)}`;

            const payload = {
                transaction_id: transactionId,
                amount: Math.floor(feeAmount),
                currency: 'XOF',
                channels: 'ALL',
                description: 'Frais Edition Devis: ' + template.name.substring(0, 20).replace(/[^a-zA-Z0-9 ]/g, ""),
                customer_name: (profile?.last_name || 'Client').substring(0, 50).replace(/[^a-zA-Z0-9 ]/g, ""),
                customer_surname: (profile?.first_name || 'Client').substring(0, 50).replace(/[^a-zA-Z0-9 ]/g, ""),
                customer_email: user.email || 'client@porcivoire.com',
                customer_phone_number: '0102030405',
                customer_city: 'Abidjan',
                customer_country: 'CI',
                customer_state: 'CI',
                customer_zip_code: '00225'
            };

            CP.getCheckout(payload);

            CP.waitResponse(async (data: any) => {
                if (data.status === 'ACCEPTED') {
                    // Mettre à jour statuts
                    await supabase.from('instant_quotes').update({
                        payment_status: 'paid',
                        transaction_id: transactionId
                    }).eq('id', quoteData.id);
                    
                    toast.success("Paiement validé ! Votre devis est généré.");
                    navigate(`/mes-devis/resultat/${quoteData.id}`);
                } else {
                    await supabase.from('instant_quotes').update({
                        payment_status: 'failed',
                        transaction_id: transactionId
                    }).eq('id', quoteData.id);
                    toast.error("Le paiement a été annulé ou a échoué.");
                }
                setSubscribing(false);
            });

            CP.onError((data: any) => {
                toast.error("Erreur avec le terminal de paiement.");
                setSubscribing(false);
            });

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erreur de connexion serveur.");
            setSubscribing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    if (!template) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-grow flex items-center justify-center py-12 px-4 bg-secondary/30 relative">
                {/* Shapes background like /formations page */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -z-10" />

                <div className="max-w-xl w-full bg-card rounded-3xl shadow-xl border border-border p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <Pickaxe className="w-32 h-32" />
                    </div>

                    <Link to="/devis" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6 relative z-10">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                    </Link>

                    <div className="relative z-10 text-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                            <Calculator className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black font-sans text-foreground leading-tight mb-2">Devis Instantané</h1>
                        <p className="text-lg font-bold text-primary">{template.name}</p>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="bg-secondary/40 border border-border rounded-2xl p-6 text-center">
                            <p className="text-sm text-muted-foreground mb-4 font-medium flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" /> Entrez la superficie totale (m²) de votre projet
                            </p>
                            
                            <div className="relative w-48 mx-auto">
                                <Input 
                                    type="number"
                                    min="10"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    className="h-16 text-center text-3xl font-black pr-12 rounded-xl border-primary/30 focus-visible:ring-primary shadow-sm"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">m²</span>
                            </div>
                            <p className="mt-4 text-xs font-medium text-muted-foreground leading-relaxed">
                                Le système génèrera automatiquement votre tableau détaillé :<br/> 
                                Gros œuvre, Charpente, Plomberie, Biosécurité, Assainissement...
                            </p>
                        </div>

                        <div className="border-t border-border pt-6">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Frais d'édition</p>
                                    <p className="text-xs text-muted-foreground">Ces frais couvrent la génération instantanée de l'étude financière.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black font-sans text-foreground">
                                        {template.fee_amount.toLocaleString()} <span className="text-lg">FCFA</span>
                                    </p>
                                </div>
                            </div>

                            <Button 
                                onClick={handleGenerateAndPay}
                                disabled={subscribing}
                                className="w-full h-14 text-base font-black rounded-xl shadow-lg bg-green-600 hover:bg-green-500 text-white transition-all flex items-center justify-center gap-2"
                            >
                                {subscribing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" /> 
                                        Payer {template.fee_amount.toLocaleString()} FCFA et générer
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
