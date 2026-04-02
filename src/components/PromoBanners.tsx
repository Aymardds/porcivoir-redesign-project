import heroSlide1 from "@/assets/hero-slide-1.png";
import heroSlide2 from "@/assets/hero-slide-2.png";
import heroSlide3 from "@/assets/hero-slide-3.png";

const banners = [
  {
    image: heroSlide1,
    discount: "-15%",
    title: "Découpes Fraîches",
    subtitle: "de nos Fermes",
    link: "#produits",
    gradient: "from-emerald-900/80 to-emerald-800/40",
  },
  {
    image: heroSlide2,
    discount: "-20%",
    title: "Grillades Fumées",
    subtitle: "Saveurs Authentiques",
    link: "#produits",
    gradient: "from-orange-900/80 to-orange-800/40",
  },
  {
    image: heroSlide3,
    discount: "Nouveau",
    title: "Charcuterie Fine",
    subtitle: "Sélection Premium",
    link: "#produits",
    gradient: "from-rose-900/80 to-rose-800/40",
  },
];

const PromoBanners = () => (
  <section className="container py-6 md:py-10">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
      {banners.map((banner, i) => (
        <a
          key={i}
          href={banner.link}
          className="promo-shine group relative rounded-2xl overflow-hidden h-52 md:h-56 block"
        >
          <img
            src={banner.image}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${banner.gradient}`}
          />
          <div className="relative z-10 p-6 flex flex-col justify-end h-full">
            <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit">
              {banner.discount}
            </span>
            <h3 className="text-xl md:text-2xl text-white leading-tight">
              {banner.title}
            </h3>
            <p className="text-white/70 text-sm font-sans mt-1">
              {banner.subtitle}
            </p>
          </div>
        </a>
      ))}
    </div>
  </section>
);

export default PromoBanners;
