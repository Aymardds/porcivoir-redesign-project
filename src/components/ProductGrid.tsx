import { ShoppingCart, Heart, Eye, Loader2, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const ProductGrid = ({ limit, initialCategory = "Tout" }: { limit?: number; initialCategory?: string }) => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('name').order('name')
      ]);

      if (prodRes.error) throw prodRes.error;
      setProducts(prodRes.data || []);
      
      if (catRes.data) {
        setCategories(["Tout", ...catRes.data.map(c => c.name)]);
      }
    } catch (error: any) {
      console.error("Error fetching public products:", error);
      toast.error("Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = (selectedCategory === "Tout" 
    ? products 
    : products.filter(p => p.categories?.name === selectedCategory)).slice(0, limit);

  return (
    <section id="produits" className="container py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl text-foreground font-sans font-bold">Nos Découpes Fraîches</h2>
          <p className="text-muted-foreground mt-2 italic">Sélection de viande de porc de qualité, directement de nos fermes.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.length > 0 ? categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/20"
              }`}
            >
              {cat}
            </button>
          )) : (
            <div className="h-10 w-32 bg-secondary animate-pulse rounded-full" />
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium italic">Préparation de vos morceaux favoris...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
            >
              <Link to={`/produit/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-secondary/30">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 bg-gradient-to-br from-secondary to-secondary/50">
                    <Package className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-center opacity-40">Plus d'images bientôt</span>
                  </div>
                )}
                
                {product.original_price > product.price && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-sm shadow-md">
                    - {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                  </span>
                )}

                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 duration-300 backdrop-blur-[2px]">
                  <button
                    onClick={(e) => { e.preventDefault(); toast.info("Bientôt disponible"); }}
                    className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center shadow-xl hover:bg-primary hover:text-white transition-all transform hover:scale-110"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </Link>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">
                    {product.categories?.name || 'Général'}
                  </span>
                </div>
                
                <Link to={`/produit/${product.slug}`} className="block flex-1">
                  <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                    {product.title}
                  </h3>
                </Link>

                <div className="mt-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-foreground">
                      {product.price.toLocaleString()} FCFA
                    </span>
                    {product.original_price > product.price && (
                      <span className="text-xs text-muted-foreground line-through decoration-red-500/50">
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
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-foreground text-card py-3 rounded-lg text-xs font-black uppercase tracking-tighter hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Ajouter au Panier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
