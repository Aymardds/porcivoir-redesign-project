import { Truck, ShieldCheck, Headphones, CreditCard } from "lucide-react";

const features = [
  { icon: Truck, title: "Livraison Rapide", desc: "Livraison dans tout Abidjan" },
  { icon: ShieldCheck, title: "Qualité Garantie", desc: "Viande fraîche et contrôlée" },
  { icon: Headphones, title: "SAV Réactif", desc: "Contactez-nous à tout moment" },
  { icon: CreditCard, title: "Paiements Sécurisés", desc: "Mobile Money & Carte bancaire" },
];

const FeatureBar = () => (
  <section className="container py-12">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {features.map((f) => (
        <div key={f.title} className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <f.icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground">{f.title}</h3>
          <p className="text-sm text-muted-foreground">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default FeatureBar;
