import heroPork from "@/assets/hero-pork-cuts.jpg";
import heroRoast from "@/assets/hero-roast.jpg";
import { ArrowRight } from "lucide-react";

const HeroBanners = () => (
  <section className="container py-6">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Main banner */}
      <div className="md:col-span-3 relative rounded-xl overflow-hidden min-h-[360px] group">
        <img
          src={heroPork}
          alt="Découpes de porc frais"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          width={1280}
          height={640}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
        <div className="relative z-10 p-8 md:p-12 flex flex-col justify-end h-full">
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-card max-w-md leading-tight">
            Découpes de Porc Fraîches
          </h1>
          <p className="text-card/80 mt-3 text-lg max-w-sm font-sans">
            Découvrez nos meilleures offres de la semaine !
          </p>
          <a
            href="#produits"
            className="mt-6 inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors w-fit"
          >
            Commander
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Side banner */}
      <div className="md:col-span-2 relative rounded-xl overflow-hidden min-h-[300px] md:min-h-[360px] group">
        <img
          src={heroRoast}
          alt="Porc rôti"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          width={640}
          height={640}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
        <div className="relative z-10 p-8 flex flex-col justify-end h-full">
          <h2 className="text-2xl md:text-3xl text-card max-w-xs leading-tight">
            Porc Fumé & Grillades
          </h2>
          <p className="text-card/80 mt-2 font-sans">
            Saveurs authentiques d'Afrique
          </p>
          <a
            href="#produits"
            className="mt-4 inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors w-fit"
          >
            Voir la boutique
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default HeroBanners;
