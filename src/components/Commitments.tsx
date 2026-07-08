import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight } from "lucide-react";

const commitments = [
  {
    id: "fermiers",
    image: "https://porcivoir.com/assets/images/capture-decran-2022-07-17-a-22.29.14-386x387.png",
    eyebrow: "Nos Producteurs",
    title: "Produit par les meilleurs éleveurs d'ici",
    description:
      "Répartis sur tout le territoire, nos 2 593 fermiers sont des passionnés de l'élevage biologique. Ils élèvent le Porc aux reflets des traditions de nos régions pour vous garantir une viande de qualité supérieure. Le Porc d'ici a une viande tendre et succulente avec un goût raffiné unique qui fait la fierté de nos territoires.",
    cta: { label: "Visitez la boutique", to: "/boutique" },
    accent: "bg-amber-50",
    badge: "2 593 Fermiers",
  },
  {
    id: "genomique",
    image: "https://porcivoir.com/assets/images/image4-1235x874.png",
    eyebrow: "Sélection Génomique",
    title: "Sélectionnés pour la performance et la qualité",
    description:
      "Sélectionnés en utilisant la génomique et une large palette de critères, nos verrats et truies ont vocation à allier la performance, la qualité et la facilité de conduite. Certains couples garantissent une portée de 24 porcelets en moyenne par an et un rendement carcasse de 83 % dont 69 % de viande maigre.",
    cta: { label: "En savoir plus", to: "/boutique" },
    accent: "bg-green-50",
    badge: "83% Rendement carcasse",
  },
  {
    id: "alimentation",
    image: "https://porcivoir.com/assets/images/postee-1168x765.png",
    eyebrow: "Alimentation Naturelle",
    title: "Nourris à base de céréales et protéines végétales",
    description:
      "Sans hormones de croissance, nos porcs sont nourris à base de céréales et de protéines végétales pour vous garantir le meilleur du porc de nos territoires. Une alimentation saine et naturelle, tracée de l'élevage à votre assiette.",
    cta: { label: "Découvrir nos produits", to: "/boutique" },
    accent: "bg-emerald-50",
    badge: "Sans hormones",
  },
  {
    id: "equitable",
    image: "https://porcivoir.com/assets/images/about-img3-2-606x606.png",
    eyebrow: "Commerce Équitable",
    title: "Votre achat rémunère justement nos fermiers",
    description:
      "En choisissant Porc'Ivoire, vous participez directement à la rémunération équitable de nos fermiers qui vous garantissent les meilleures produits de nos terroirs. Une prime qualité est reversée chaque mois aux éleveurs et une prime de traçabilité aux abattoirs partenaires.",
    cta: { label: "Acheter maintenant", to: "/boutique" },
    accent: "bg-orange-50",
    badge: "Prime qualité mensuelle",
  },
];

export default function Commitments() {
  return (
    <section className="py-20 bg-secondary/10">
      <div className="container">

        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-3">
            Nos engagements
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            De la ferme à votre table,{" "}
            <span className="text-primary">l'excellence ivoirienne</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Chaque découpe Porc'Ivoire est le fruit d'un savoir-faire artisanal, d'une
            alimentation naturelle et d'une traçabilité garantie.
          </p>
        </div>

        {/* Commitments Grid - alternating layout */}
        <div className="space-y-16">
          {commitments.map((item, index) => {
            const isReversed = index % 2 === 1;
            return (
              <div
                key={item.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                  isReversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Image */}
                <div className={`relative ${isReversed ? "lg:order-2" : "lg:order-1"}`}>
                  <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  {/* Badge */}
                  <div className="absolute -bottom-4 -right-4 bg-primary text-white rounded-2xl px-4 py-3 shadow-lg hidden md:block">
                    <p className="text-xs font-black">{item.badge}</p>
                  </div>
                </div>

                {/* Text */}
                <div className={`${isReversed ? "lg:order-1" : "lg:order-2"}`}>
                  <div className={`inline-block ${item.accent} rounded-full px-3 py-1 mb-4`}>
                    <p className="text-xs font-black uppercase tracking-widest text-primary">
                      {item.eyebrow}
                    </p>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-foreground mb-4 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                  <Link
                    to={item.cta.to}
                    className="inline-flex items-center gap-2 bg-foreground text-card font-bold px-5 py-3 rounded-xl text-sm hover:bg-primary hover:text-white transition-all group"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {item.cta.label}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-20 bg-gradient-to-br from-primary to-green-700 rounded-3xl p-10 md:p-14 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-70 mb-3">
              Ils nous font confiance
            </p>
            <h3 className="text-2xl md:text-3xl font-black mb-4">
              Rejoignez la famille Porc'Ivoire
            </h3>
            <p className="opacity-80 text-sm mb-7 max-w-md mx-auto leading-relaxed">
              2 593 fermiers, des centaines de clients satisfaits, et des découpes de porc
              d'exception — tout cela pour vous, chaque jour.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/boutique"
                className="bg-white text-primary font-black px-7 py-3 rounded-xl hover:bg-white/90 transition-colors text-sm"
              >
                Commander en ligne
              </Link>
              <Link
                to="/partenaire"
                className="border-2 border-white/40 text-white font-bold px-7 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
              >
                Devenir partenaire
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
