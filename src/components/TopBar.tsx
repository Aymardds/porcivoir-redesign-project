import { Truck, ShieldCheck, Headphones, CreditCard, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const items = [
  { icon: Truck, text: "Livraison dans tout Abidjan !" },
  { icon: ShieldCheck, text: "100% Qualité Garantie !" },
  { icon: Headphones, text: "SAV : +225 07 87 295 734" },
  { icon: CreditCard, text: "Paiements Sécurisés" },
];

const TopBar = () => {
  const [promos, setPromos] = useState<any[]>([]);

  useEffect(() => {
    const fetchPromos = async () => {
      const { data } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .limit(2);
      if (data) setPromos(data);
    };
    fetchPromos();
  }, []);

  const promoItems = promos.map(p => ({
    icon: Star,
    text: `PROMO : -${p.discount_percent ? p.discount_percent + '%' : p.discount_amount + ' FCFA'} avec le code ${p.code} !`
  }));

  const allItems = [...promoItems, ...items];

  return (
    <div className="bg-topbar overflow-hidden py-2">
      <div className="scrolling-banner flex whitespace-nowrap">
        {[...allItems, ...allItems, ...allItems].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-8 text-topbar-foreground text-sm font-medium">
            <item.icon className="w-4 h-4 text-accent" />
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TopBar;
