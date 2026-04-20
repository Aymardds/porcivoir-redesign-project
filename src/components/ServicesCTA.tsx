import { ArrowRight, FileText, Beef, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    id: "devis",
    icon: FileText,
    badge: "Service Pro",
    title: "Demande de Devis",
    subtitle: "Obtenez votre offre personnalisée",
    description:
      "Bénéficiez de nos services agropastoraux. Recevez un devis sur mesure adapté à vos besoins : Amménagement complexe agro-pastorale, approvisionnement, etc.",
    cta: "Demander un devis",
    gradient: "from-primary via-primary/90 to-green-700",
    accentLight: "bg-white/15",
    badgeColor: "bg-white/20 text-white",
    href: "/devis",
    isExternal: false,
    darkText: false,
    decorCircle1: "bg-white/10",
    decorCircle2: "bg-white/5",
  },
  {
    id: "troupeau",
    icon: Beef,
    badge: "Élevage",
    title: "Gestion de Troupeaux",
    subtitle: "Optimisez votre exploitation porcine",
    description:
      "Confiez la gestion et le suivi de vos troupeaux à nos experts. Santé animale, alimentation, reproduction et optimisation de la productivité de votre ferme.",
    cta: "Gérer mon troupeau",
    gradient: "from-amber-700 via-accent to-amber-500",
    accentLight: "bg-white/15",
    badgeColor: "bg-white/20 text-white",
    href: "/troupeau",
    isExternal: false,
    darkText: false,
    decorCircle1: "bg-white/10",
    decorCircle2: "bg-white/5",
  },
  {
    id: "formation",
    icon: GraduationCap,
    badge: "Apprentissage",
    title: "Formations Expertes",
    subtitle: "Développez vos compétences",
    description:
      "Inscrivez-vous à nos sessions de formation animées par des experts. Théorie, pratique, gestion d'exploitation et accompagnement personnalisé.",
    cta: "Voir les formations",
    gradient: "from-yellow-400 via-yellow-300 to-amber-300",
    accentLight: "bg-black/10",
    badgeColor: "bg-black/15 text-black/80",
    href: "/formations",
    isExternal: false,
    darkText: true,
    decorCircle1: "bg-black/5",
    decorCircle2: "bg-black/5",
  },
];

const ServicesCTA = () => (
  <section className="container py-12 md:py-20">
    {/* Section header */}
    <div className="text-center mb-10">
      <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">
        Nos Services
      </p>
      <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">
        Des solutions pour votre activité
      </h2>
      <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm md:text-base font-sans">
        Porc'Ivoire vous accompagne de la ferme à la table. Découvrez nos
        services spécialisés pour les professionnels et les éleveurs.
      </p>
    </div>

    {/* Cards grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {services.map((service) => {
        const Icon = service.icon;
        const tc = service.darkText;

        const cardContent = (
          <div
            key={service.id}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${service.gradient} p-8 md:p-10 group h-full flex flex-col`}
          >
            {/* Decorative blobs */}
            <div
              className={`absolute -top-12 -right-12 w-48 h-48 rounded-full ${service.decorCircle1} transition-transform duration-700 group-hover:scale-110`}
            />
            <div
              className={`absolute -bottom-8 -left-8 w-32 h-32 rounded-full ${service.decorCircle2}`}
            />
            <div className={`absolute top-1/2 right-8 w-20 h-20 rounded-full ${tc ? 'bg-black/5' : 'bg-white/5'}`} />

            {/* Content */}
            <div className="relative z-10 flex flex-col flex-grow">
              {/* Badge + icon row */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${service.badgeColor}`}
                >
                  {service.badge}
                </span>
                <div className={`w-14 h-14 rounded-2xl ${service.accentLight} flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${tc ? 'text-black/70' : 'text-white'}`} />
                </div>
              </div>

              {/* Text */}
              <p className={`${tc ? 'text-black/60' : 'text-white/70'} text-sm font-semibold mb-1 font-sans`}>
                {service.subtitle}
              </p>
              <h3 className={`text-2xl md:text-3xl font-black ${tc ? 'text-black' : 'text-white'} mb-4 leading-tight`}>
                {service.title}
              </h3>
              <p className={`${tc ? 'text-black/70' : 'text-white/80'} text-sm font-sans leading-relaxed mb-8 flex-grow`}>
                {service.description}
              </p>

              {/* CTA Button */}
              <div
                className={`inline-flex mt-auto self-start items-center gap-3 ${tc ? 'bg-black text-white hover:bg-black/85' : 'bg-white text-foreground hover:bg-white/90'} font-black px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-xl hover:-translate-y-0.5 hover:shadow-2xl group/btn cursor-pointer`}
              >
                {service.cta}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </div>
            </div>
          </div>
        );

        return service.isExternal ? (
          <a
            key={service.id}
            href={service.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full outline-none"
          >
            {cardContent}
          </a>
        ) : (
          <Link
            key={service.id}
            to={service.href}
            className="block h-full outline-none"
          >
            {cardContent}
          </Link>
        );
      })}
    </div>
  </section>
);

export default ServicesCTA;
