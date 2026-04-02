import { Truck, ShieldCheck, Headphones, CreditCard } from "lucide-react";

const items = [
  { icon: Truck, text: "Livraison dans tout Abidjan !" },
  { icon: ShieldCheck, text: "100% Qualité Garantie !" },
  { icon: Headphones, text: "SAV : +225 07 87 295 734" },
  { icon: CreditCard, text: "Paiements Sécurisés" },
];

const TopBar = () => (
  <div className="bg-topbar overflow-hidden py-2">
    <div className="scrolling-banner flex whitespace-nowrap">
      {[...items, ...items, ...items].map((item, i) => (
        <span key={i} className="inline-flex items-center gap-2 px-8 text-topbar-foreground text-sm font-medium">
          <item.icon className="w-4 h-4" />
          {item.text}
        </span>
      ))}
    </div>
  </div>
);

export default TopBar;
