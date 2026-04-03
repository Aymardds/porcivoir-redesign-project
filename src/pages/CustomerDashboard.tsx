import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User, Package, CalendarDays, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-800" },
  processing: { label: "En préparation", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "Expédiée", color: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Livrée", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800" },
};

export default function CustomerDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, status, total_amount")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Impossible de charger l'historique de vos commandes.");
    } finally {
      setLoadingOrders(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Protect route
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-secondary/10 flex flex-col">
      <Header />
      
      <main className="container flex-1 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">
                Mon Espace Client
              </h1>
              <p className="text-muted-foreground font-medium">
                Bonjour, {profile?.first_name || user.email} !
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profil Info */}
            <div className="md:col-span-1 border border-border bg-card rounded-2xl p-6 shadow-sm h-fit">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border pb-3">
                <User className="w-5 h-5 text-primary" />
                Mes Informations
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nom</p>
                  <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Commandes */}
            <div className="md:col-span-2 border border-border bg-card rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-border pb-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Historique de Commandes
              </h2>

              {loadingOrders ? (
                <div className="py-8 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  Chargement de vos commandes...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="font-medium text-lg">Aucune commande pour le moment.</p>
                  <p className="text-muted-foreground mb-6">Découvrez notre viande de porc fraîche !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/5 hover:bg-secondary/20 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black font-mono text-sm">#{order.id.split('-')[0].toUpperCase()}</span>
                          <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full ${statusMap[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                            {statusMap[order.status]?.label || order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {format(new Date(order.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total</p>
                        <p className="font-black text-primary text-lg">{order.total_amount.toLocaleString("fr-FR")} FCFA</p>
                      </div>
                    </div>
                  ))}
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
