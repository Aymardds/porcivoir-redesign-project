import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroSlide1 from "@/assets/hero-slide-1.png";
import heroSlide2 from "@/assets/hero-slide-2.png";
import heroSlide3 from "@/assets/hero-slide-3.png";

const slides = [
  {
    image: heroSlide1,
    badge: "Nouvelles Découpes",
    title: "Porc Frais\nde Qualité Premium",
    subtitle: "Élevé dans nos fermes en Côte d'Ivoire, sans OGM",
    cta: "Commander maintenant",
    link: "#produits",
    discount: "-15%",
  },
  {
    image: heroSlide2,
    badge: "Spécial Grillades",
    title: "Porc Fumé &\nGrillades Authentiques",
    subtitle: "Saveurs d'Afrique, qualité garantie",
    cta: "Voir les offres",
    link: "#produits",
    discount: "-20%",
  },
  {
    image: heroSlide3,
    badge: "Charcuterie Fine",
    title: "Découvrez Notre\nCharcuterie Artisanale",
    subtitle: "Sélection premium pour vos événements",
    cta: "Explorer",
    link: "#produits",
    discount: "Nouveau",
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(idx);
      setTimeout(() => setIsAnimating(false), 700);
    },
    [isAnimating]
  );

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(
    () => goTo((current - 1 + slides.length) % slides.length),
    [current, goTo]
  );

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section id="hero" className="relative w-full overflow-hidden bg-foreground">
      {/* Slides */}
      <div className="relative h-[420px] md:h-[520px] lg:h-[600px]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover ${
                i === current ? "hero-slide-enter" : ""
              }`}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

            {/* Content */}
            <div className="relative z-10 container h-full flex flex-col justify-center">
              <div className="max-w-xl">
                {/* Badge */}
                <span className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-bold px-4 py-1.5 rounded-full mb-4">
                  {slide.discount && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {slide.discount}
                    </span>
                  )}
                  {slide.badge}
                </span>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl text-white leading-tight whitespace-pre-line mb-4">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-white/80 text-base md:text-lg max-w-md mb-8 font-sans">
                  {slide.subtitle}
                </p>

                {/* CTA */}
                <a
                  href={slide.link}
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-3.5 rounded-lg text-sm transition-all duration-300 hover:translate-x-1 shadow-lg shadow-accent/20"
                >
                  {slide.cta}
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "w-8 bg-accent"
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
