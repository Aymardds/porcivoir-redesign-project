import { useState, useEffect } from "react";
import { Tag, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

interface PromoBannerProps {
  compact?: boolean;
}

const PromoDealBanner = ({ compact = false }: PromoBannerProps) => {
  const [promos, setPromos] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: { hours: number; minutes: number; seconds: number } }>({});

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .limit(3);

    if (data && data.length > 0) {
      console.log('PromoDealBanner: Fetched', data.length, 'active promotions');
      setPromos(data);
    } else {
      console.warn('PromoDealBanner: No active promotions found. If this is unexpected, check Supabase RLS policies for the "promotions" table.');
    }
  };

  useEffect(() => {
    if (promos.length === 0) return;

    const tick = () => {
      const newTimeLeft: typeof timeLeft = {};
      promos.forEach((p) => {
        if (!p.valid_until) return;
        const diff = Math.max(0, new Date(p.valid_until).getTime() - Date.now());
        newTimeLeft[p.id] = {
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        };
      });
      setTimeLeft(newTimeLeft);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [promos]);

  if (promos.length === 0) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (compact) {
    // Mini banner strip for the Shop sidebar or top of grid
    return (
      <div className="space-y-2 mb-6">
        {promos.map((promo) => {
          const tl = timeLeft[promo.id];
          return (
            <div
              key={promo.id}
              className="flex items-center gap-3 bg-primary text-primary-foreground px-4 py-3 rounded-xl"
            >
              <Tag className="w-4 h-4 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-widest">
                  Code : <span className="text-accent">{promo.code}</span>
                  {promo.discount_percent && (
                    <span className="ml-1 text-white"> — -{promo.discount_percent}%</span>
                  )}
                  {promo.discount_amount && !promo.discount_percent && (
                    <span className="ml-1 text-white"> — -{promo.discount_amount.toLocaleString()} FCFA</span>
                  )}
                </p>
                {promo.description && (
                  <p className="text-[10px] opacity-70 mt-0.5 truncate">{promo.description}</p>
                )}
              </div>
              {tl && (
                <div className="flex items-center gap-1 text-accent font-black text-xs shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{pad(tl.hours)}:{pad(tl.minutes)}:{pad(tl.seconds)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Full banner for homepage sections
  return (
    <section className="container py-10 md:py-14">
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Codes Promo</p>
          <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Offres & Promotions</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((promo) => {
          const tl = timeLeft[promo.id];
          const discount = promo.discount_percent
            ? `-${promo.discount_percent}%`
            : promo.discount_amount
            ? `-${promo.discount_amount.toLocaleString()} FCFA`
            : "";

          return (
            <div
              key={promo.id}
              className={`relative overflow-hidden rounded-2xl p-6 flex flex-col gap-3 ${
                promo.is_featured
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl"
                  : "bg-secondary border border-border"
              }`}
            >
              {promo.is_featured && (
                <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest bg-accent text-accent-foreground px-2 py-1 rounded-full">
                  ⭐ Vedette
                </span>
              )}

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Promotion</p>
                <h3 className={`text-2xl font-black ${promo.is_featured ? "text-accent" : "text-primary"}`}>
                  {discount || "Offre Spéciale"}
                </h3>
                <p className={`text-sm mt-1 font-medium ${promo.is_featured ? "text-primary-foreground/80" : "text-muted-foreground"} line-clamp-2`}>
                  {promo.description || "Profitez de cette offre exceptionnelle !"}
                </p>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm tracking-widest ${promo.is_featured ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>
                <Tag className="w-4 h-4" />
                {promo.code}
              </div>

              {tl && (
                <div className="flex items-center gap-3">
                  <Clock className="w-3.5 h-3.5 opacity-60" />
                  <div className="flex gap-2">
                    {[
                      { v: tl.hours, l: "H" },
                      { v: tl.minutes, l: "M" },
                      { v: tl.seconds, l: "S" },
                    ].map(({ v, l }) => (
                      <div key={l} className={`flex flex-col items-center px-2 py-1 rounded-lg text-center min-w-[2.5rem] ${promo.is_featured ? "bg-primary-foreground/10" : "bg-primary/10"}`}>
                        <span className="text-lg font-black leading-tight">{pad(v)}</span>
                        <span className="text-[9px] uppercase opacity-50">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link
                to="/boutique"
                className={`mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:gap-3 transition-all ${promo.is_featured ? "text-accent" : "text-primary"}`}
              >
                Voir les produits
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PromoDealBanner;
