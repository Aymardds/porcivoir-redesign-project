import { ArrowRight, Calendar } from "lucide-react";
import heroSlide1 from "@/assets/hero-slide-1.png";
import heroSlide2 from "@/assets/hero-slide-2.png";
import heroSlide3 from "@/assets/hero-slide-3.png";

const posts = [
  {
    image: heroSlide1,
    date: "28 Mars 2026",
    title: "Les Meilleures Recettes de Porc pour vos Fêtes",
    excerpt:
      "Découvrez nos idées de recettes festives à base de porc pour impressionner vos convives lors de vos célébrations.",
    link: "#",
  },
  {
    image: heroSlide2,
    date: "22 Mars 2026",
    title: "Comment Choisir la Bonne Découpe de Porc",
    excerpt:
      "Guide complet pour comprendre les différentes découpes de porc et choisir celle qui convient à votre plat.",
    link: "#",
  },
  {
    image: heroSlide3,
    date: "15 Mars 2026",
    title: "L'Art de la Charcuterie Artisanale en Côte d'Ivoire",
    excerpt:
      "De la ferme à votre assiette : les secrets de fabrication de notre charcuterie premium 100% ivoirienne.",
    link: "#",
  },
];

const BlogSection = () => (
  <section className="container py-12 md:py-16">
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
      <div>
        <h2 className="text-3xl md:text-4xl text-foreground">Notre Blog</h2>
        <p className="text-muted-foreground mt-2 font-sans">
          Conseils, recettes et actualités de Porc'Ivoire
        </p>
      </div>
      <a
        href="#"
        className="text-accent font-semibold text-sm font-sans inline-flex items-center gap-1 hover:gap-2 transition-all"
      >
        Voir tous les articles
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map((post, i) => (
        <a
          key={i}
          href={post.link}
          className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl transition-all duration-300"
        >
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          <div className="p-5 md:p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans mb-3">
              <Calendar className="w-3.5 h-3.5" />
              {post.date}
            </div>
            <h3 className="text-base md:text-lg text-foreground group-hover:text-accent transition-colors leading-snug line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 font-sans line-clamp-2">
              {post.excerpt}
            </p>
            <span className="inline-flex items-center gap-1 text-accent text-sm font-semibold font-sans mt-4 group-hover:gap-2 transition-all">
              Lire la suite
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </a>
      ))}
    </div>
  </section>
);

export default BlogSection;
