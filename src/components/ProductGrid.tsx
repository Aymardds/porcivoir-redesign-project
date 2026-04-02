import { ShoppingCart, Heart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";

const categories = ["Tout", "Porc Frais", "Porc Fumé", "Charcuterie", "Grillades", "Abats"];

const ProductGrid = () => {
  const { addItem } = useCart();

  return (
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
            key={product.id}
            className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <Link to={`/produit/${product.slug}`} className="block relative aspect-square overflow-hidden bg-secondary">
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
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => { e.preventDefault(); }}
                  className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Heart className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); }}
                  className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </Link>
            <div className="p-4">
              <Link to={`/produit/${product.slug}`}>
                <h3 className="font-semibold text-foreground text-base hover:text-accent transition-colors">{product.name}</h3>
              </Link>
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
              <button
                onClick={() => addItem(product)}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Ajouter au panier
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
