import { ShoppingCart, Heart, Eye } from "lucide-react";

type Product = {
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  unit: string;
  badge?: string;
};

const products: Product[] = [
  {
    name: "Porc entier",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/entier_cracasse_produitporcivoir-270x300.jpg",
    price: 2350,
    oldPrice: 2550,
    discount: 8,
    unit: "kg",
  },
  {
    name: "Longe",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/longe_produitporcivoir-270x300.jpg",
    price: 2450,
    oldPrice: 2550,
    discount: 4,
    unit: "kg",
  },
  {
    name: "Jarret",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/jarret_produitporcivoir-270x300.jpg",
    price: 2550,
    oldPrice: 2950,
    discount: 14,
    unit: "kg",
    badge: "Promo",
  },
  {
    name: "Échine de porc",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2020/06/echine_produitporcivoir-270x300.jpg",
    price: 3500,
    oldPrice: 3800,
    discount: 8,
    unit: "kg",
  },
  {
    name: "Carré",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2020/06/carre_produitporcivoir-270x300.jpg",
    price: 3000,
    oldPrice: 3500,
    discount: 14,
    unit: "kg",
  },
  {
    name: "Côtes",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/cotes_produitporcivoir-270x300.jpg",
    price: 3000,
    oldPrice: 3500,
    discount: 14,
    unit: "kg",
  },
  {
    name: "Épaule",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/epaule_produitporcivoir-270x300.jpg",
    price: 2850,
    oldPrice: 3000,
    discount: 5,
    unit: "kg",
  },
  {
    name: "Pattes",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/pates_produitporcivoir-270x300.jpg",
    price: 1250,
    oldPrice: 1500,
    discount: 17,
    unit: "kg",
    badge: "Promo",
  },
];

const categories = ["Tout", "Porc Frais", "Porc Fumé", "Charcuterie", "Abats"];

const ProductGrid = () => (
  <section id="produits" className="container py-16">
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
      <div>
        <h2 className="text-3xl md:text-4xl text-foreground">Les Meilleures Découpes</h2>
        <p className="text-muted-foreground mt-2">Viande de porc fraîche, directement de nos fermes</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat, i) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              i === 0
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.name}
          className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="relative aspect-square overflow-hidden bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.discount && (
              <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                -{product.discount}%
              </span>
            )}
            {product.badge && (
              <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                {product.badge}
              </span>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow hover:bg-primary hover:text-primary-foreground transition-colors">
                <Heart className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow hover:bg-primary hover:text-primary-foreground transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground text-base">{product.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-accent font-bold text-lg">
                {product.price.toLocaleString()} CFA
              </span>
              <span className="text-xs text-muted-foreground">/{product.unit}</span>
            </div>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {product.oldPrice.toLocaleString()} CFA
              </span>
            )}
            <button className="mt-3 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">
              <ShoppingCart className="w-4 h-4" />
              Ajouter au panier
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ProductGrid;
