import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ShoppingCart, Minus, Plus, ArrowLeft, Heart } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1 container py-20 text-center">
          <h1 className="text-3xl mb-4">Produit introuvable</h1>
          <Link to="/" className="text-accent hover:underline">Retour à l'accueil</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const similar = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-accent transition-colors">Accueil</Link>
            <span>/</span>
            <Link to="/#produits" className="hover:text-accent transition-colors">Boutique</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </div>
        </div>

        {/* Product section */}
        <section className="container pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                        i === selectedImage ? "border-accent" : "border-border hover:border-accent/50"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-2">{product.category}</p>
                <h1 className="text-3xl md:text-4xl text-foreground">{product.name}</h1>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-accent">
                  {product.price.toLocaleString()} CFA
                </span>
                <span className="text-muted-foreground">/{product.unit}</span>
                {product.oldPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {product.oldPrice.toLocaleString()} CFA
                  </span>
                )}
                {product.discount && (
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                    -{product.discount}%
                  </span>
                )}
              </div>

              {product.weight && (
                <p className="text-sm text-muted-foreground">Poids moyen : {product.weight}</p>
              )}

              <p className="text-foreground/80 leading-relaxed">{product.description}</p>

              {/* Quantity + Add to cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-border rounded-md">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 font-semibold text-center min-w-[3rem]">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="px-4 py-3 hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => { addItem(product, qty); setQty(1); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Ajouter au panier
                </button>
                <button className="w-12 h-12 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors flex-shrink-0">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* Details */}
              <div className="border-t border-border pt-6 space-y-3 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Catégorie :</span>
                  <span className="text-foreground font-medium">{product.category}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Disponibilité :</span>
                  <span className="text-primary font-medium">En stock</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Similar products */}
        {similar.length > 0 && (
          <section className="container pb-16">
            <h2 className="text-2xl md:text-3xl text-foreground mb-8">Produits Similaires</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similar.map((p) => (
                <Link key={p.id} to={`/produit/${p.slug}`} className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {p.discount && (
                      <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                        -{p.discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-accent font-bold">{p.price.toLocaleString()} CFA</span>
                      <span className="text-xs text-muted-foreground">/{p.unit}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
