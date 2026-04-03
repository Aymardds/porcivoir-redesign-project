import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { toast } from "sonner";
import { ChevronRight, CreditCard, Truck, ShieldCheck, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useEmailNotification } from "@/hooks/useEmailNotification";
import { useAuth } from "@/context/AuthContext";
import { generateInvoicePdfBase64 } from "@/utils/generateInvoice";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DELIVERY_AREAS = [
  { name: "Abidjan - Cocody", price: 2000 },
  { name: "Abidjan - Marcory", price: 2000 },
  { name: "Abidjan - Plateau", price: 2000 },
  { name: "Abidjan - Treichville", price: 2000 },
  { name: "Abidjan - Koumassi", price: 2000 },
  { name: "Abidjan - Yopougon", price: 3000 },
  { name: "Abidjan - Abobo", price: 3000 },
  { name: "Bingerville", price: 3000 },
  { name: "Grand-Bassam", price: 5000 },
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { sendEmail } = useEmailNotification();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    area: DELIVERY_AREAS[0].name,
  });

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  const selectedArea = DELIVERY_AREAS.find(a => a.name === formData.area);
  const deliveryFee = selectedArea ? selectedArea.price : 0;
  const finalTotal = totalPrice + deliveryFee;

  useEffect(() => {
    if (items.length === 0) {
      navigate("/boutique");
    }
    window.scrollTo(0, 0);
  }, [items, navigate]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user || profile) {
      setFormData(prev => ({
        ...prev,
        firstName: profile?.first_name || prev.firstName,
        lastName: profile?.last_name || prev.lastName,
        email: user?.email || prev.email,
        phone: prev.phone, // Default or fetch if phone exists in profile
      }));
    }
  }, [user, profile]);

  // Dynamically injects the CinetPay SDK script if not already loaded
  const loadCinetPaySDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).CinetPay) {
        resolve();
        return;
      }
      const existing = document.getElementById('cinetpay-sdk');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject('SDK load failed'));
        return;
      }
      const script = document.createElement('script');
      script.id = 'cinetpay-sdk';
      script.src = 'https://cdn.cinetpay.com/seamless/main.js';
      script.type = 'text/javascript';
      script.onload = () => resolve();
      script.onerror = () => reject('SDK load failed');
      document.head.appendChild(script);
    });
  };

  const handleCinetPay = async (orderId: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        await loadCinetPaySDK();
      } catch {
        toast.error("Le service de paiement CinetPay est inaccessible. Vérifiez votre connexion.");
        reject("SDK not loaded");
        return;
      }

      const CP = (window as any).CinetPay;
      if (!CP) {
        toast.error("Le service de paiement est indisponible.");
        reject("SDK not loaded");
        return;
      }

      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      // notify_url must be a publicly reachable HTTPS URL — update with your Vercel domain
      const notifyUrl = isLocalhost
        ? 'https://porcivoire.vercel.app/api/cinetpay-notify'
        : `${window.location.origin}/api/cinetpay-notify`;

      CP.setConfig({
        apikey: import.meta.env.VITE_CINETPAY_API_KEY,
        site_id: import.meta.env.VITE_CINETPAY_SITE_ID,
        notify_url: notifyUrl,
        mode: 'PRODUCTION', // Try removing mode or set to what dashboard shows
      });

      const payload = {
        transaction_id: `PI${Date.now()}${Math.floor(Math.random() * 1000)}`,
        amount: Math.floor(finalTotal), // Must be an integer
        currency: 'XOF',
        channels: 'ALL',
        description: `Commande PorcIvoire`,
        customer_name: (formData.lastName || 'Client').substring(0, 50),
        customer_surname: (formData.firstName || 'PorcIvoire').substring(0, 50),
        customer_phone_number: formData.phone.replace(/\D/g, ''), // Strip all non-digits
        customer_email: formData.email || 'client@porcivoire.ci',
        customer_address: (formData.address || 'Abidjan').substring(0, 50),
        customer_city: 'Abidjan',
        customer_country: 'CI',
        customer_state: 'CI',
        customer_zip_code: '00225',
      };

      console.log('CinetPay Config:', JSON.stringify({
        apikey: import.meta.env.VITE_CINETPAY_API_KEY,
        site_id: import.meta.env.VITE_CINETPAY_SITE_ID,
        notify_url: notifyUrl,
        mode: 'PRODUCTION' // Or TEST based on your account
      }, null, 2));
      
      console.log('CinetPay Payload:', JSON.stringify(payload, null, 2));

      CP.getCheckout(payload);

      CP.waitResponse((data: any) => {
        if (data.status === 'ACCEPTED') {
          resolve(data);
        } else {
          console.error('CinetPay waitResponse rejected:', JSON.stringify(data, null, 2));
          reject(data);
        }
      });

      CP.onError((data: any) => {
        console.error('CinetPay onError:', JSON.stringify(data, null, 2));
        reject(data);
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      // 1. Create the order
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          user_id: user?.id || null,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_phone: formData.phone,
          shipping_address: formData.address,
          shipping_area: formData.area,
          delivery_fee: deliveryFee,
          total_amount: finalTotal,
          payment_method: paymentMethod,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.product.name,
        product_slug: item.product.slug,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Handle Online Payment if selected
      if (paymentMethod === "online") {
        try {
          await handleCinetPay(order.id);
          // Update order status if payment successful
          await supabaseAdmin.from("orders").update({ status: 'processing' }).eq('id', order.id);
        } catch (err: any) {
          console.error("CinetPay error:", JSON.stringify(err, null, 2));
          const msg = err?.message || err?.description || err?.code || 'Paiement annulé ou échoué';
          toast.error(`Paiement non abouti : ${msg}`);
          setLoading(false);
          return;
        }
      }

      // 4. Generate Invoice and Send Email
      if (formData.email) {
        try {
          const invoiceBase64 = await generateInvoicePdfBase64(order, orderItems);
          // Only send the email, wait for it so it goes through smoothly, or don't block
          // but doing it before clearCart ensures we don't lose context if unmounted.
          const { error: sendErr } = await sendEmail({
            order: { ...order, items: orderItems },
            type: "order_confirmed",
            client_email: formData.email,
            invoice_base64: invoiceBase64
          });
          if (sendErr) throw new Error(sendErr);
        } catch (emailErr: any) {
          console.error("Failed to send email/invoice:", emailErr);
          toast.error(`La commande est validée, mais l'envoi de l'email a échoué: ${emailErr?.message || emailErr}`);
          // Let the order succeed even if email fails
        }
      }

      // 5. Clear cart and redirect
      clearCart();
      toast.success("Commande transmise avec succès !");
      navigate("/merci", { state: { orderId: order.id, total: finalTotal } });
    } catch (error: any) {
      console.error("Checkout submission failed:", error);
      if (error?.code === "PGRST204" || error?.code === "42703") {
        toast.error("Problème de configuration de la base de données. Veuillez exécuter le script SQL de migration.");
      } else {
        toast.error("Erreur lors de la validation de la commande. Veuillez vérifier vos informations.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/5">
      <Header />
      
      <main className="container flex-1 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary" />
            Finaliser ma commande
          </h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left side: Form */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-4 mb-6">
                   <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-black">1</span>
                   Vos Coordonnées
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName" 
                      required 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      placeholder="Jean" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName" 
                      required 
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      placeholder="Dupont" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone (WhatsApp de préférence)</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      required 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="07 00 00 00 00" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="client@email.com" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-4 mb-6">
                   <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-black">2</span>
                   Livraison
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Zone de livraison</Label>
                    <select 
                      id="area"
                      className="w-full h-12 bg-secondary/50 border border-border/50 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.area}
                      onChange={e => setFormData({...formData, area: e.target.value})}
                    >
                      {DELIVERY_AREAS.map(area => (
                        <option key={area.name} value={area.name}>{area.name} (+{area.price} FCFA)</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse précise (ou repères)</Label>
                    <textarea 
                      id="address" 
                      required 
                      className="w-full min-h-[100px] bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      placeholder="Ex: Riviera Palmeraie, Rue Ministre, Immeuble X, Appartement Y"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-4 mb-6">
                   <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-black">3</span>
                   Paiement
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      paymentMethod === "cod" 
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                      : "border-border hover:border-primary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <Truck className={`w-8 h-8 mb-4 ${paymentMethod === "cod" ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-black uppercase tracking-widest text-sm">Paiement à la livraison</p>
                    <p className="text-xs text-muted-foreground mt-2">Payez en espèces dès que vous recevez vos produits.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("online")}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      paymentMethod === "online" 
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                      : "border-border hover:border-primary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <CreditCard className={`w-8 h-8 mb-4 ${paymentMethod === "online" ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-black uppercase tracking-widest text-sm">Paiement en ligne</p>
                    <p className="text-xs text-muted-foreground mt-2">Mobile Money (Orange, MTN, Moov), Visa, MasterCard via CinetPay.</p>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                <ShieldCheck className="w-10 h-10 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground italic font-medium">
                  {paymentMethod === "online" 
                    ? "Transaction sécurisée par CinetPay. Vos fonds sont protégés jusqu'à la confirmation de l'expédition."
                    : "Vos données sont sécurisées. Nous vous contacterons par téléphone pour confirmer l'heure précise de livraison."}
                </p>
              </div>
            </div>

            {/* Right side: Summary */}
            <div className="lg:col-span-5">
              <div className="bg-card p-8 rounded-3xl border-2 border-primary shadow-xl sticky top-24">
                <h3 className="text-xl font-black uppercase tracking-widest mb-6 border-b border-border pb-4">Résumé de commande</h3>
                
                <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded bg-secondary flex items-center justify-center font-bold text-[10px]">{item.quantity}x</span>
                        <span className="font-bold text-foreground line-clamp-1">{item.product.name}</span>
                      </div>
                      <span className="font-bold whitespace-nowrap">{(item.product.price * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-border pt-6 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frais de livraison</span>
                    <span className="font-bold text-primary">+{deliveryFee.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-xl font-black pt-4 border-t border-dashed border-border mt-4">
                    <span>TOTAL</span>
                    <span className="text-primary">{finalTotal.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || items.length === 0}
                  className="w-full h-16 bg-primary text-white text-lg font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg group"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {paymentMethod === "online" ? "Payer ma commande" : "Confirmer ma commande"}
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </Button>

                <div className="mt-6 flex items-center justify-center gap-4 opacity-40">
                  <Truck className="w-5 h-5" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Livraison Rapide - Paiement à réception</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
