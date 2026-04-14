import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import heroSlide1 from "@/assets/hero-slide-1.png";
import heroSlide2 from "@/assets/hero-slide-2.png";
import heroSlide3 from "@/assets/hero-slide-3.png";

const fallbackImages = [heroSlide1, heroSlide2, heroSlide3];
const fallbackGradients = [
  "from-emerald-900/80 to-emerald-800/40",
  "from-orange-900/80 to-orange-800/40",
  "from-rose-900/80 to-rose-800/40",
];

const PromoBanners = () => {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      const { data } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .limit(3);
      
      if (data && data.length > 0) {
        console.log('PromoBanners: Fetched', data.length, 'active promotions');
        setPromos(data);
      } else {
        console.warn('PromoBanners: No active promotions found. If this is unexpected, check Supabase RLS policies for the "promotions" table.');
      }
      setLoading(false);
    };
    fetchPromos();
  }, []);

  if (loading || promos.length === 0) return null;

  return (
    <section className="container py-6 md:py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {promos.map((promo, i) => {
          const discount = promo.discount_percent 
            ? `-${promo.discount_percent}%` 
            : promo.discount_amount 
            ? `-${promo.discount_amount.toLocaleString()} FCFA` 
            : "Promo";

          return (
            <a
              key={promo.id}
              href="/boutique"
              className="promo-shine group relative rounded-2xl overflow-hidden h-52 md:h-56 block"
            >
              <img
                src={fallbackImages[i % fallbackImages.length]}
                alt={promo.code}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${fallbackGradients[i % fallbackGradients.length]}`}
              />
              <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit">
                  {discount}
                </span>
                <h3 className="text-xl md:text-2xl text-white font-bold leading-tight uppercase font-sans">
                  Code : {promo.code}
                </h3>
                <p className="text-white/70 text-sm font-sans mt-1 line-clamp-2">
                  {promo.description || "Offre spéciale temporaire !"}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default PromoBanners;
