import { useState, useEffect } from "react";
import { ShoppingCart, Star, Loader2, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const tabs = [
  { id: "popular", label: "Populaires" },
  { id: "promo", label: "Promotions" },
];

const TabbedProducts = () => {
  const [activeTab, setActiveTab] = useState("popular");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .limit(10);
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching tabbed products:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayedProducts = activeTab === "promo" 
    ? products.filter(p => p.original_price > p.price).slice(0, 6)
    : products.slice(0, 6);

  return (
    <section className="container py-12 md:py-16">
      {/* Header with tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl text-foreground font-sans font-bold">
            Nos Meilleures Découpes
          </h2>
          <p className="text-muted-foreground mt-2 font-sans italic">
            Viande de porc fraîche, directement de nos fermes
          </p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-md text-sm font-bold font-sans transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product cards — large horizontal layout */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedProducts.map((product) => (
            <div
              key={product.id + activeTab}
              className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-500 flex"
            >
              {/* Image */}
              <Link
                to={`/produit/${product.slug}`}
                className="relative w-36 sm:w-44 md:w-48 flex-shrink-0 overflow-hidden bg-secondary/30"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground opacity-20">
                    <Package className="w-8 h-8" />
                  </div>
                )}
                {product.original_price > product.price && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                    PROMO
                  </span>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 p-4 md:p-5 flex flex-col justify-between min-h-[180px]">
                <div>
                  <span className="text-[10px] font-bold text-primary font-sans uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">
                    {product.categories?.name || 'Général'}
                  </span>
                  <Link to={`/produit/${product.slug}`}>
                    <h3 className="text-base md:text-lg font-bold text-foreground mt-2 hover:text-primary transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 font-sans">
                    {product.description}
                  </p>
                  {/* Rating stars */}
                  <div className="flex items-center gap-0.5 mt-2 opacity-50">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= 5
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-1 font-sans">
                      (5.0)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-foreground">
                        {product.price.toLocaleString()} FCFA
                      </span>
                      {product.original_price > product.price && (
                        <span className="text-xs text-muted-foreground line-through decoration-red-500/30">
                          {product.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Le Kilogramme (kg)</span>
                  </div>
                  <button
                    onClick={() => addItem({
                      id: product.id,
                      name: product.title,
                      price: product.price,
                      image: product.image_url || '',
                      images: [product.image_url || ''],
                      unit: 'kg',
                      slug: product.slug,
                      category: product.categories?.name || 'Général',
                      description: product.description || ''
                    })}
                    className="w-10 h-10 rounded-full bg-foreground text-white flex items-center justify-center hover:bg-primary transition-all duration-300 shadow-md transform hover:scale-110"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TabbedProducts;
