import { useLocation, Link, Navigate } from "react-router-dom";
import { CheckCircle2, ShoppingBag, ArrowRight, MessageCircle } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function OrderSuccess() {
  const location = useLocation();
  const { orderId, total } = location.state || {};

  if (!orderId) {
    return <Navigate to="/boutique" replace />;
  }

  const whatsappMessage = `Bonjour Porc'Ivoire ! Je viens de passer la commande #${orderId.split('-')[0]} d'un montant de ${total.toLocaleString()} FCFA sur votre site.`;
  const whatsappUrl = `https://wa.me/2250787295734?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen flex flex-col bg-card">
      <TopBar />
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 container">
        <div className="max-w-2xl w-full bg-white rounded-[3rem] p-10 md:p-16 text-center shadow-2xl border-4 border-primary/10 relative overflow-hidden">
          {/* Confetti decoration / bg decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/50 rounded-full blur-3xl animate-pulse" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 animate-bounce transition-transform duration-1000">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
            </div>

            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-foreground">Merci pour votre commande !</h1>
            
            <p className="text-lg text-muted-foreground font-medium mb-10 max-w-md mx-auto italic">
              Votre commande <span className="font-black text-primary">#{orderId.split('-')[0]}</span> a bien été reçue par notre équipe de bouchers.
            </p>

            <div className="w-full bg-secondary/30 rounded-3xl p-8 mb-10 space-y-4 border border-border/50">
              <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
                <span>Statut</span>
                <span className="text-primary">En préparation 🥩</span>
              </div>
              <div className="flex justify-between items-center text-xl font-black border-t border-dashed border-border/50 pt-4">
                <span>Total réglé</span>
                <span className="text-foreground">{total.toLocaleString()} FCFA</span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-60">Paiement à la livraison</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                className="flex items-center justify-center gap-2 bg-green-500 text-white h-14 rounded-2xl font-black uppercase tracking-widest hover:bg-green-600 transition-all hover:scale-105 shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                Accélérez la livraison
              </a>
              <Link to="/boutique" className="w-full">
                <Button className="w-full h-14 bg-foreground text-card hover:bg-primary hover:text-white rounded-2xl font-black uppercase tracking-widest border-none transition-all hover:scale-105 shadow-xl group">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Continuer shopping
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="mt-12 text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground opacity-40">
              Porc'Ivoire - Fraîcheur & Tradition
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
