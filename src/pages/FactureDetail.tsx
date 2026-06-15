import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  CheckCircle2, Clock, Truck, ShieldAlert, MapPin, 
  Phone, User, Calendar, MessageCircle, FileText, ChevronLeft, Loader2
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  customer_name: string;
  customer_phone?: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  shipping_area?: string;
  delivery_fee?: number;
  payment_method?: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const statusSteps = [
  { key: "pending", label: "Reçue", icon: FileText, desc: "Votre commande est enregistrée" },
  { key: "processing", label: "Préparation", icon: Clock, desc: "Préparation par nos bouchers" },
  { key: "shipped", label: "Livraison", icon: Truck, desc: "En cours de route vers vous" },
  { key: "delivered", label: "Livrée", icon: CheckCircle2, desc: "Commande reçue avec succès" }
];

const orderStatusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "En attente", color: "text-amber-600 border-amber-200", bg: "bg-amber-50" },
  processing: { label: "En préparation", color: "text-blue-600 border-blue-200", bg: "bg-blue-50" },
  shipped: { label: "En cours de livraison", color: "text-purple-600 border-purple-200", bg: "bg-purple-50" },
  delivered: { label: "Livrée", color: "text-green-600 border-green-200", bg: "bg-green-50" },
  cancelled: { label: "Annulée", color: "text-red-600 border-red-200", bg: "bg-red-50" },
  refunded: { label: "Remboursée", color: "text-gray-600 border-gray-200", bg: "bg-gray-50" }
};

export default function FactureDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) {
        throw new Error("Commande introuvable ou erreur de chargement");
      }

      setOrder(orderData);

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (itemsError) {
        throw itemsError;
      }

      setItems(itemsData || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-card">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-semibold">Chargement des détails de votre facture...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-card">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-black mb-3">Facture introuvable</h1>
          <p className="text-muted-foreground mb-8">
            Le lien de cette facture semble invalide ou la commande a été supprimée.
          </p>
          <Link to="/boutique" className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 rounded-xl">
              Retourner à la boutique
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const invoiceNum = `#${order.id.split("-")[0].toUpperCase()}`;
  const orderDate = new Date(order.created_at);
  const formattedDate = format(orderDate, "d MMMM yyyy 'à' HH:mm", { locale: fr });

  const currentStatusIndex = statusSteps.findIndex(step => step.key === order.status);
  const isSpecialStatus = ["cancelled", "refunded"].includes(order.status);

  // WhatsApp setup
  const whatsappMessage = `Bonjour Porc'Ivoire ! Je souhaite avoir des informations de livraison pour ma commande ${invoiceNum} d'un montant de ${order.total_amount.toLocaleString("fr-FR")} FCFA.`;
  const whatsappUrl = `https://wa.me/2250787295734?text=${encodeURIComponent(whatsappMessage)}`;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + Number(item.total_price), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <main className="flex-1 container py-8 md:py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header Link */}
          <Link to="/mon-compte" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors gap-1">
            <ChevronLeft className="w-4 h-4" />
            Mon compte
          </Link>

          {/* Main Card */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            
            {/* Top Banner / Order Info */}
            <div className="bg-gradient-to-br from-primary to-green-800 p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-10 -mb-10 blur-xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="bg-white/20 text-white font-black font-mono text-sm px-3 py-1 rounded-full uppercase tracking-wider">
                      Facture {invoiceNum}
                    </span>
                    {isSpecialStatus && (
                      <span className="bg-red-500/30 text-red-200 border border-red-500/20 text-xs font-black px-3 py-1 rounded-full uppercase">
                        {orderStatusMap[order.status]?.label || order.status}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                    Suivi de Commande
                  </h1>
                  <p className="text-white/80 text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Commandé le {formattedDate}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-black uppercase text-xs tracking-wider px-6 py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.03]"
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                    Contacter le support
                  </a>
                </div>
              </div>
            </div>

            {/* Live Tracking Tracker (only if not cancelled/refunded) */}
            {!isSpecialStatus && (
              <div className="p-8 border-b border-slate-100 bg-slate-50/40">
                <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-8">Statut de la livraison</h2>
                
                {/* Desktop view */}
                <div className="hidden md:grid grid-cols-4 gap-4 relative">
                  {/* Connecting Line */}
                  <div className="absolute top-7 left-[12.5%] right-[12.5%] h-1 bg-slate-100 -z-0">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${(Math.max(0, currentStatusIndex) / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>

                  {statusSteps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = idx <= currentStatusIndex;
                    const isActive = idx === currentStatusIndex;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                          isActive 
                            ? "bg-primary text-white border-white ring-4 ring-primary/20 scale-110" 
                            : isCompleted 
                              ? "bg-primary text-white border-white shadow-md" 
                              : "bg-white text-muted-foreground border-slate-100"
                        }`}>
                          <StepIcon className="w-6 h-6" />
                        </div>
                        <p className={`mt-4 text-sm font-black transition-colors ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[150px] font-medium leading-tight">
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile view */}
                <div className="md:hidden space-y-6 relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {/* Active Line indicator */}
                  <div 
                    className="absolute left-3 top-2 w-0.5 bg-primary transition-all duration-500" 
                    style={{ height: `${(Math.max(0, currentStatusIndex) / (statusSteps.length - 1)) * 100}%` }}
                  />

                  {statusSteps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = idx <= currentStatusIndex;
                    const isActive = idx === currentStatusIndex;

                    return (
                      <div key={step.key} className="relative flex gap-4">
                        <div className={`absolute -left-8 w-6.5 h-6.5 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isActive 
                            ? "bg-primary text-white border-white ring-4 ring-primary/15" 
                            : isCompleted 
                              ? "bg-primary text-white border-white shadow-sm" 
                              : "bg-white text-muted-foreground border-slate-100"
                        }`}>
                          <StepIcon className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-black ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grid Layout for details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              
              {/* Left Column: Order items recap (2/3 width on lg) */}
              <div className="lg:col-span-2 p-8 md:p-10 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Articles Commandés</h3>
                
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                          {item.quantity} x {Number(item.unit_price).toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                      <p className="font-black text-foreground shrink-0">
                        {Number(item.total_price).toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                  ))}
                </div>

                {/* Subtotals block */}
                <div className="pt-6 border-t border-dashed border-slate-200 space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground font-semibold">
                    <span>Sous-total</span>
                    <span>{subtotal.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground font-semibold">Frais de livraison</span>
                    <span className="text-orange-500 font-bold uppercase text-[11px] tracking-wide bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                      À la charge du client
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-black text-foreground pt-4 border-t border-slate-100">
                    <span>Total payé</span>
                    <span className="text-primary">{order.total_amount.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Customer Info & Logistics (1/3 width on lg) */}
              <div className="p-8 md:p-10 bg-slate-50/20 space-y-8">
                
                {/* Logistics */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Livraison</h3>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex gap-3">
                      <User className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Client</p>
                        <p className="font-bold text-foreground">{order.customer_name}</p>
                      </div>
                    </div>

                    {order.customer_phone && (
                      <div className="flex gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Téléphone</p>
                          <p className="font-bold text-foreground">{order.customer_phone}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Adresse</p>
                        <p className="font-bold text-foreground">
                          {order.shipping_address}
                          {order.shipping_area && <span className="block text-xs font-semibold text-primary mt-0.5">{order.shipping_area}</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment & Logistics Note */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Paiement</h3>
                  
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 text-xs text-muted-foreground space-y-2 font-medium">
                    <div className="flex justify-between">
                      <span>Mode :</span>
                      <span className="font-bold text-foreground">
                        {order.payment_method === "online" ? "En ligne (CinetPay)" : "À la livraison"}
                      </span>
                    </div>
                    {order.payment_id && (
                      <div className="flex justify-between truncate gap-2">
                        <span>Transaction :</span>
                        <span className="font-mono text-[10px] font-bold text-foreground">{order.payment_id}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50 text-xs text-orange-800 space-y-1.5 font-medium">
                    <p className="font-black uppercase tracking-wider text-[10px] text-orange-600">Note de Livraison</p>
                    <p>Les frais de livraison ne sont pas inclus dans cette facture. Ils seront à régler directement au livreur lors de la réception de votre colis.</p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
