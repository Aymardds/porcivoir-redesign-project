import { Beef, Flame, Drumstick, Utensils, Heart, Scissors } from "lucide-react";

const categories = [
  {
    name: "Porc Frais",
    icon: Beef,
    count: 5,
    color: "from-emerald-500/10 to-emerald-600/5",
    iconColor: "text-emerald-600",
  },
  {
    name: "Porc Fumé",
    icon: Flame,
    count: 3,
    color: "from-orange-500/10 to-orange-600/5",
    iconColor: "text-orange-600",
  },
  {
    name: "Charcuterie",
    icon: Drumstick,
    count: 4,
    color: "from-rose-500/10 to-rose-600/5",
    iconColor: "text-rose-600",
  },
  {
    name: "Grillades",
    icon: Utensils,
    count: 3,
    color: "from-amber-500/10 to-amber-600/5",
    iconColor: "text-amber-600",
  },
  {
    name: "Abats",
    icon: Heart,
    count: 2,
    color: "from-red-500/10 to-red-600/5",
    iconColor: "text-red-600",
  },
  {
    name: "Découpes Spéciales",
    icon: Scissors,
    count: 4,
    color: "from-teal-500/10 to-teal-600/5",
    iconColor: "text-teal-600",
  },
];

const CategoryGrid = () => (
  <section className="container py-12 md:py-16">
    <div className="text-center mb-10">
      <h2 className="text-3xl md:text-4xl text-foreground">Nos Catégories</h2>
      <p className="text-muted-foreground mt-2 font-sans">
        Parcourez notre sélection de viande de porc de qualité
      </p>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
      {categories.map((cat) => (
        <a
          key={cat.name}
          href="#produits"
          className="category-lift group flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-accent/30 cursor-pointer"
        >
          <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
          >
            <cat.icon className={`w-7 h-7 md:w-8 md:h-8 ${cat.iconColor}`} />
          </div>
          <h3 className="font-sans font-semibold text-sm md:text-base text-foreground group-hover:text-accent transition-colors">
            {cat.name}
          </h3>
          <span className="text-xs text-muted-foreground mt-1 font-sans">
            {cat.count} produits
          </span>
        </a>
      ))}
    </div>
  </section>
);

export default CategoryGrid;
