import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  User, Package, CalendarDays, ShoppingBag,
  GraduationCap, CheckCircle, Clock, FileText,
  MapPin, ChevronRight, Beef, ArrowRight, XCircle, Loader2
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Link as RouterLink } from "react-router-dom";

// ─── Types ───────────────────────────────────────────────
interface Order { id: string; created_at: string; status: string; total_amount: number; }

const orderStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-800" },
  processing: { label: "En préparation", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "Expédiée", color: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Livrée", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800" },
};

const quoteStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-800" },
  reviewed: { label: "En cours d'étude", color: "bg-blue-100 text-blue-800" },
  approved: { label: "Approuvé", color: "bg-green-100 text-green-800" },
  rejected: { label: "Refusé", color: "bg-red-100 text-red-800" },
};

// ─── Tab definition ───────────────────────────────────────
const TABS = [
  { id: "boutique", label: "Boutique", icon: ShoppingBag, color: "text-primary" },
  { id: "devis", label: "Mes Devis", icon: FileText, color: "text-primary" },
  { id: "formations", label: "Formations", icon: GraduationCap, color: "text-primary" },
  { id: "troupeau", label: "Troupeau", icon: Beef, color: "text-amber-600" },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Component ───────────────────────────────────────────
export default function CustomerDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("boutique");

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [quotes, setQuotes] = useState<any[]>([]);
  const [instantQuotes, setInstantQuotes] = useState<any[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
    fetchQuotes();
    fetchSubscriptions();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, status, total_amount")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch { toast.error("Erreur chargement commandes"); }
    finally { setLoadingOrders(false); }
  };

  const fetchQuotes = async () => {
    try {
      const { data: qData, error: qError } = await supabase
        .from("quote_requests")
        .select(`*, quote_items(*, services(*))`)
        .eq("client_email", user?.email)
        .order("created_at", { ascending: false });
      if (qError) throw qError;
      setQuotes(qData || []);

      const { data: iqData, error: iqError } = await supabase
        .from("instant_quotes")
        .select(`*, quote_templates(name)`)
        .eq("user_id", user?.id)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false });
      if (iqError) throw iqError;
      setInstantQuotes(iqData || []);
      
    } catch { /* silent */ }
    finally { setLoadingQuotes(false); }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("training_subscriptions")
        .select(`*, trainings(title, start_date, end_date, expert_trainer, cover_image)`)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSubscriptions(data || []);
    } catch { /* silent */ }
    finally { setLoadingSubs(false); }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  const paidSubs = subscriptions.filter(s => s.payment_status === "paid");

  return (
    <div className="min-h-screen bg-secondary/10 flex flex-col">
      <Header />

      <main className="container flex-1 py-10 px-4">
        <div className="max-w-6xl mx-auto">

          {/* ── Profile Header ── */}
          <div className="bg-gradient-to-br from-primary to-green-700 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-white/5 rounded-full" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black flex-shrink-0 border-2 border-white/30">
                {profile?.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-grow">
                <h1 className="text-2xl md:text-3xl font-black mb-1">
                  Bonjour, {profile?.first_name || "Client"} {profile?.last_name} 👋
                </h1>
                <p className="text-white/70 font-medium">{user.email}</p>
              </div>
              {/* Quick stats */}
              <div className="flex gap-4 flex-shrink-0 mt-2 sm:mt-0">
                <div className="text-center bg-white/15 rounded-xl px-4 py-3">
                  <p className="text-xl font-black">{orders.length}</p>
                  <p className="text-[11px] text-white/70 font-semibold">Commandes</p>
                </div>
                <div className="text-center bg-white/15 rounded-xl px-4 py-3">
                  <p className="text-xl font-black">{quotes.length + instantQuotes.length}</p>
                  <p className="text-[11px] text-white/70 font-semibold">Devis</p>
                </div>
                <div className="text-center bg-white/15 rounded-xl px-4 py-3">
                  <p className="text-xl font-black">{paidSubs.length}</p>
                  <p className="text-[11px] text-white/70 font-semibold">Formations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* ── Sidebar navigation ── */}
            <aside className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-3 space-y-1 sticky top-24">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Mes services</p>
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`} />
                      {tab.label}
                    </button>
                  );
                })}

                <div className="pt-3 px-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Mon profil</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Nom</p>
                      <p className="font-semibold text-foreground">{profile?.first_name} {profile?.last_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-semibold text-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Main content ── */}
            <div className="lg:col-span-3 space-y-6">

              {/* ─ BOUTIQUE ─ */}
              {activeTab === "boutique" && (
                <ServicePanel
                  title="Mes Commandes"
                  icon={ShoppingBag}
                  loading={loadingOrders}
                  empty={orders.length === 0}
                  emptyIcon={Package}
                  emptyText="Vous n'avez pas encore passé de commande."
                  emptyAction={{ label: "Découvrir la boutique", to: "/boutique" }}
                >
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/5 hover:bg-secondary/15 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black font-mono text-sm">#{order.id.split("-")[0].toUpperCase()}</span>
                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${orderStatusMap[order.status]?.color}`}>
                              {orderStatusMap[order.status]?.label || order.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {format(new Date(order.created_at), "d MMMM yyyy", { locale: fr })}
                          </p>
                        </div>
                        <p className="font-black text-primary text-lg">{order.total_amount.toLocaleString("fr-FR")} FCFA</p>
                      </div>
                    ))}
                  </div>
                </ServicePanel>
              )}

              {/* ─ DEVIS ─ */}
              {activeTab === "devis" && (
                <ServicePanel
                  title="Mes Demandes de Devis"
                  icon={FileText}
                  loading={loadingQuotes}
                  empty={quotes.length === 0 && instantQuotes.length === 0}
                  emptyIcon={FileText}
                  emptyText="Vous n'avez encore soumis aucune demande de devis."
                  emptyAction={{ label: "Demander un devis", to: "/devis" }}
                >
                  <div className="space-y-4">
                    {/* Instant Quotes */}
                    {instantQuotes.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase text-muted-foreground mb-2">Devis Instantanés</h4>
                        {instantQuotes.map((q) => (
                          <div key={q.id} className="border-l-4 border-l-primary border-y border-y-border border-r border-r-border rounded-xl p-5 bg-secondary/5 hover:bg-secondary/15 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                              <div>
                                <p className="font-black font-sans text-foreground">
                                  {q.quote_templates?.name || "Modèle"} - {q.input_quantity} m²
                                </p>
                                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                                  <CalendarDays className="w-3 h-3" />
                                  Généré le {format(new Date(q.created_at), "d MMMM yyyy", { locale: fr })}
                                </p>
                              </div>
                              <div className="flex flex-col items-start sm:items-end gap-1">
                                <Link to={`/mes-devis/resultat/${q.id}`} className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                                  Voir PDF Détaillé
                                </Link>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                              <p className="text-xs text-muted-foreground font-semibold">Total Estimatif TTC</p>
                              <p className="font-black text-foreground">{q.total_ttc?.toLocaleString("fr-FR")} FCFA</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Manual Quotes */}
                    {quotes.length > 0 && (
                      <div className="space-y-3 mt-6">
                        <h4 className="text-xs font-black uppercase text-muted-foreground mb-2">Demandes de Devis (Sur-mesure)</h4>
                        {quotes.map((q) => (
                          <div key={q.id} className="border border-border rounded-xl p-5 bg-secondary/5 hover:bg-secondary/15 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                              <div>
                                <p className="font-black font-sans text-foreground">
                                  Requête #{q.id.slice(0, 8).toUpperCase()}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                                  <CalendarDays className="w-3 h-3" />
                                  {format(new Date(q.created_at), "d MMMM yyyy", { locale: fr })}
                                </p>
                              </div>
                              <div className="flex flex-col items-start sm:items-end gap-1">
                                <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full ${quoteStatusMap[q.status]?.color || "bg-gray-100 text-gray-600"}`}>
                                  {quoteStatusMap[q.status]?.label || q.status || "Soumis"}
                                </span>
                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${q.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                  Paiement Frais : {q.payment_status === "paid" ? "Effectué" : "En attente"}
                                </span>
                              </div>
                            </div>
                            {q.quote_items && q.quote_items.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                                {q.quote_items.map((item: any) => (
                                  <span key={item.id} className="bg-primary/10 text-primary text-[11px] font-bold px-2 py-0.5 rounded-full">
                                    {item.services?.name || "Service"}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                              <p className="text-xs text-muted-foreground font-semibold">Validation Finale</p>
                              <p className="font-black text-muted-foreground">En cours d'étude par l'équipe</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </ServicePanel>
              )}

              {/* ─ FORMATIONS ─ */}
              {activeTab === "formations" && (
                <ServicePanel
                  title="Mes Formations"
                  icon={GraduationCap}
                  loading={loadingSubs}
                  empty={subscriptions.length === 0}
                  emptyIcon={GraduationCap}
                  emptyText="Vous n'êtes inscrit à aucune formation pour l'instant."
                  emptyAction={{ label: "Voir le catalogue", to: "/formations" }}
                >
                  <div className="space-y-3">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="border border-border rounded-xl p-4 flex items-center gap-4 bg-secondary/5 hover:bg-secondary/15 transition-colors">
                        {sub.trainings?.cover_image && (
                          <img src={sub.trainings.cover_image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                        )}
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-foreground truncate">{sub.trainings?.title}</p>
                          {sub.trainings?.start_date && (
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1">
                              <CalendarDays className="w-3 h-3 text-primary/70" />
                              Du {new Date(sub.trainings.start_date).toLocaleDateString("fr-FR")} au {new Date(sub.trainings.end_date).toLocaleDateString("fr-FR")}
                            </p>
                          )}
                          {sub.trainings?.expert_trainer && (
                            <p className="text-xs text-muted-foreground mt-0.5">Expert : {sub.trainings.expert_trainer}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {sub.payment_status === "paid" ? (
                            <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Confirmé
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              <Clock className="w-3 h-3" /> En attente
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ServicePanel>
              )}

              {/* ─ TROUPEAU ─ */}
              {activeTab === "troupeau" && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  {/* Amber banner */}
                  <div className="bg-gradient-to-br from-amber-600 to-yellow-500 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Beef className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-black">Gestion de Troupeaux</h2>
                    </div>
                    <p className="text-white/80 text-sm">
                      Confiez le suivi de votre exploitation porcine à nos experts.
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Info card */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 font-medium">
                      Ce service est géré directement par notre équipe d'experts.
                      Soumettez une demande de devis pour démarrer votre accompagnement.
                    </div>

                    {/* Service list */}
                    {[
                      { title: "Santé animale", desc: "Suivi vétérinaire, vaccinations, prévention des maladies" },
                      { title: "Nutrition", desc: "Optimisation des rations alimentaires et croissance" },
                      { title: "Reproduction", desc: "Gestion du cycle, sélection génétique" },
                      { title: "Performance & Reporting", desc: "Tableaux de bord et suivi mensuel dédié" },
                    ].map((s) => (
                      <div key={s.title} className="flex items-center gap-3 border border-border rounded-xl p-4">
                        <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-foreground text-sm">{s.title}</p>
                          <p className="text-xs text-muted-foreground">{s.desc}</p>
                        </div>
                      </div>
                    ))}

                    {/* CTA */}
                    <RouterLink
                      to="/devis"
                      className="flex items-center justify-center gap-2 w-full bg-amber-600 text-white font-black py-4 rounded-xl hover:bg-amber-500 transition-colors shadow-sm mt-2"
                    >
                      Demander un accompagnement <ArrowRight className="w-5 h-5" />
                    </RouterLink>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─── Reusable Service Panel ───────────────────────────────
function ServicePanel({
  title, icon: Icon, loading, empty, emptyIcon: EmptyIcon, emptyText, emptyAction, children
}: {
  title: string;
  icon: React.ElementType;
  loading: boolean;
  empty: boolean;
  emptyIcon: React.ElementType;
  emptyText: string;
  emptyAction: { label: string; to: string };
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-black text-foreground">{title}</h2>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary opacity-30" />
            Chargement...
          </div>
        ) : empty ? (
          <div className="py-12 text-center flex flex-col items-center">
            <EmptyIcon className="w-14 h-14 text-muted-foreground/25 mb-4" />
            <p className="font-semibold text-muted-foreground mb-4">{emptyText}</p>
            <Link
              to={emptyAction.to}
              className="inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors"
            >
              {emptyAction.label} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : children}
      </div>
    </div>
  );
}
