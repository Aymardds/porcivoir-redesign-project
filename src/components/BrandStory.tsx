import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  {
    id: "histoire",
    title: "Notre Histoire",
    content:
      "Née en 2012 à l'initiative de la Grainothèque, la marque collective et indication géographique PORCIVOIRE vise à guider les consommateurs vers des produits de Côte d'Ivoire à l'origine garantie, qui participent à la sauvegarde de la filière porcine ivoirienne. Viandes fraîches, salaisons, pâtés… porteurs de la marque sont produits avec de la viande de qualité supérieure issue d'élevages familiaux, dans le respect des savoir-faire artisanaux, des méthodes naturelles de fabrication et de la tradition d'innovation de PORCIVOIRE.",
  },
  {
    id: "vision",
    title: "Notre Vision",
    content:
      "Promouvoir une filière porcine qualité qui rémunère justement les fermiers. Pour chaque viande de porc vendue, une plus-value qualité est mise dans une caisse commune et reversée tous les mois sous forme de prime qualité aux éleveurs et de prime de traçabilité aux abattoirs.",
  },
  {
    id: "fermiers",
    title: "Nos Fermiers",
    content:
      "Nos fermiers sont des passionnés de l'élevage biologique. Ils garantissent que leurs animaux sont nourris avec au minimum 55 % de matière première de Côte d'Ivoire. Ils produisent avec amour pour vous garantir les meilleures découpes de nos territoires.",
  },
  {
    id: "batiments",
    title: "Nos Bâtiments",
    content:
      "Nos bâtiments respectent les règles de la Charte des bâtiments d'élevage de Porc lors de la construction de bâtiments neufs ou d'agrandissements : insertion paysagère, gestion et préservation des ressources, santé des animaux et des travailleurs, impact environnemental. Les animaux sont nés en Côte d'Ivoire et élevés dans nos exploitations certifiées.",
  },
];

export default function BrandStory() {
  const [open, setOpen] = useState<string | null>("histoire");

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* --- LEFT: Accordéon texte --- */}
          <div>
            {/* Eyebrow */}
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-3">
              Notre identité
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3 leading-tight">
              Nous avons fait de notre{" "}
              <span className="text-primary">expertise un art.</span>
            </h2>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              Premier label collectif et équitable qui bénéficie de l'appellation «&nbsp;PORCIVOIRE&nbsp;»,
              garante de l'originalité ivoirienne de la viande de Porc.
            </p>

            {/* Accordion */}
            <div className="space-y-3">
              {items.map((item) => {
                const isOpen = open === item.id;
                return (
                  <div
                    key={item.id}
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? "border-primary/30 shadow-md shadow-primary/10"
                        : "border-border hover:border-primary/20"
                    }`}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : item.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <span
                        className={`font-bold text-sm ${
                          isOpen ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {item.title}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
                          isOpen
                            ? "rotate-180 text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              to="/boutique"
              className="mt-8 inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-primary/90 transition-colors group"
            >
              Visitez notre boutique
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* --- RIGHT: Image illustrée --- */}
          <div className="relative">
            {/* Main image from old site */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://porcivoir.com/assets/images/bgporcivoire1-copie-992x707.png"
                alt="Élevage Porc'Ivoire - Savoir-faire ivoirien"
                className="w-full h-[460px] object-cover"
                loading="lazy"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {/* Badge */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🐷</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Fondé en</p>
                    <p className="text-lg font-black text-foreground">2012</p>
                  </div>
                  <div className="border-l border-border/50 pl-4 ml-auto">
                    <p className="text-xs text-muted-foreground font-semibold">Fermiers partenaires</p>
                    <p className="text-lg font-black text-foreground">2 593</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative floating card */}
            <div className="absolute -top-5 -right-5 bg-primary text-white rounded-2xl px-5 py-4 shadow-xl hidden md:block">
              <p className="text-xs font-semibold opacity-80">Origine</p>
              <p className="text-base font-black">100% Ivoirien</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
