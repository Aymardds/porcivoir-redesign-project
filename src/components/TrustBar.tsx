import { Truck, ShieldCheck, Headphones, CreditCard } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Livraison Rapide",
    desc: "Livraison dans tout Abidjan",
  },
  {
    icon: ShieldCheck,
    title: "Qualité Garantie",
    desc: "Viande fraîche et contrôlée",
  },
  {
    icon: Headphones,
    title: "SAV Réactif",
    desc: "Contactez-nous à tout moment",
  },
  {
    icon: CreditCard,
    title: "Paiements Sécurisés",
    desc: "Mobile Money & Carte bancaire",
  },
];

const TrustBar = () => (
  <section className="bg-primary text-primary-foreground">
    <div className="container py-8 md:py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {features.map((f, i) => (
          <div
            key={f.title}
            className={`flex items-center gap-4 ${
              i < features.length - 1
                ? "md:border-r md:border-primary-foreground/15 md:pr-8"
                : ""
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex-shrink-0 flex items-center justify-center">
              <f.icon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-primary-foreground">
                {f.title}
              </h4>
              <p className="text-xs text-primary-foreground/60 font-sans mt-0.5">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBar;
