import { useState, useEffect } from "react";
import { ShoppingCart, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const CountdownDeal = () => {
  const { addItem } = useCart();
  const [promo, setPromo] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    fetchFeaturedDeal();
  }, []);

  const fetchFeaturedDeal = async () => {
    setLoading(true);
    try {
      // 1. Get featured promo OR soonest expiring
      const { data: promoData, error: promoError } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .not('valid_until', 'is', null) // Must have an expiry for countdown
        .order('is_featured', { ascending: false }) // Featured first
        .order('valid_until', { ascending: true }) // Then soonest expiry
        .limit(1)
        .maybeSingle();

      if (promoError) throw promoError;
      if (!promoData) {
        setLoading(false);
        return;
      }

      setPromo(promoData);

      // 2. Get linked products
      const { data: links } = await supabase
        .from('promotion_products')
        .select('product_id')
        .eq('promotion_id', promoData.id)
        .limit(1)
        .maybeSingle();

      let targetProduct = null;

      if (links) {
        const { data: prodData } = await supabase
          .from('products')
          .select('*')
          .eq('id', links.product_id)
          .maybeSingle();
        if (prodData) targetProduct = prodData;
      }
      
      // FALLBACK: If still no product, pick any active product
      if (!targetProduct) {
        const { data: fallbackProd } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();
        if (fallbackProd) targetProduct = fallbackProd;
      }

      setProduct(targetProduct);
    } catch (err) {
      console.error('Error fetching deal:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fallback promo if none in DB — always show the countdown on the site
  const defaultPromo = {
    id: 'default',
    description: "🥩 Commandes Groupées — Contactez-nous pour vos tarifs spéciaux !",
    discount_percent: 15,
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    code: 'GROUPE15',
  };

  const displayPromo = promo || defaultPromo;

  useEffect(() => {
    if (!displayPromo?.valid_until) return;

    const targetDate = new Date(displayPromo.valid_until).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, targetDate - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [displayPromo?.valid_until]);

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  // Don't render if we have absolutely no products at all
  if (!product) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <section className="bg-primary/5 py-12 md:py-16">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <Link
              to={`/produit/${product.slug}`}
              className="block relative group"
            >
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-accent/20 shadow-2xl shadow-accent/10">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold text-lg w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg countdown-pulse">
                <span className="text-[10px] leading-none uppercase">Offre</span>
                <span className="text-xl leading-none">-{displayPromo.discount_percent ? displayPromo.discount_percent + '%' : '🔥'}</span>
              </span>
            </Link>
          </div>

          {/* Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
              <Clock className="w-5 h-5 text-accent" />
              <span className="text-accent font-bold font-sans text-sm uppercase tracking-wider">
                {displayPromo.description || "Offre du moment — Fin dans :"}
              </span>
            </div>

            {/* Countdown */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              {[
                { value: timeLeft.days, label: "Jours" },
                { value: timeLeft.hours, label: "Heures" },
                { value: timeLeft.minutes, label: "Min" },
                { value: timeLeft.seconds, label: "Sec" },
              ].map((unit, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold shadow-lg">
                    {pad(unit.value)}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1.5 font-sans font-medium">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            <Link to={`/produit/${product.slug}`}>
              <h2 className="text-2xl md:text-3xl text-foreground hover:text-accent transition-colors font-bold">
                {product.title}
              </h2>
            </Link>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto lg:mx-0 font-sans line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center justify-center lg:justify-start gap-3 mt-4">
              <span className="text-3xl font-bold text-accent">
                {product.price.toLocaleString()} CFA
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-muted-foreground line-through">
                  {product.original_price.toLocaleString()} CFA
                </span>
              )}
            </div>

            <button
              onClick={() => {
                addItem(product);
                toast.success(`${product.title} ajouté au panier !`);
              }}
              className="mt-6 inline-flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-8 py-3.5 rounded-lg text-sm hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 uppercase tracking-widest"
            >
              <ShoppingCart className="w-4 h-4" />
              Profiter de l'offre
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountdownDeal;
