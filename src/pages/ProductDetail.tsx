import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingCart, Minus, Plus, ArrowLeft, Heart, Loader2, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (slug) {
      fetchProductData();
    }
  }, [slug]);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setProduct(data);

      if (data) {
        const { data: similarData } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .limit(4);
        setSimilar(similarData || []);
      }
    } catch (error: any) {
      console.error("Error fetching product detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium italic">Chargement de votre morceau...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1 container py-20 text-center">
          <h1 className="text-3xl mb-4">Produit introuvable</h1>
          <Link to="/" className="text-primary hover:underline font-bold">Retour à l'accueil</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/5">
      <TopBar />
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-6">
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span>/</span>
            <Link to="/#produits" className="hover:text-primary transition-colors">Boutique</Link>
            <span>/</span>
            <span className="text-foreground">{product.title}</span>
          </div>
        </div>

        {/* Product section */}
        <section className="container pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
            {/* Gallery */}
            <div className="space-y-6">
              <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border/50 shadow-xl relative group">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground opacity-20">
                    <Package className="w-20 h-20 mb-4" />
                    <span className="text-xs uppercase font-black tracking-[0.2em]">Image non disponible</span>
                  </div>
                )}
                {product.original_price > product.price && (
                  <span className="absolute top-6 left-6 bg-red-600 text-white text-xs font-black px-4 py-1.5 rounded shadow-2xl">
                    PROMOTION -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-8 flex flex-col justify-center">
              <div>
                <span className="text-xs text-primary font-black uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded inline-block mb-4">
                  {product.categories?.name || 'Général'}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground font-sans font-black leading-tight tracking-tighter">
                  {product.title}
                </h1>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl md:text-5xl font-black text-foreground">
                    {product.price.toLocaleString()} <span className="text-xl">FCFA</span>
                  </span>
                  {product.original_price > product.price && (
                    <span className="text-xl text-muted-foreground line-through decoration-red-500/40">
                      {product.original_price.toLocaleString()} FCFA
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-2 italic">Prix au Kilogramme (kg) • Fraîcheur Garantie</p>
              </div>

              <div className="prose prose-sm text-foreground/70 leading-relaxed max-w-xl font-medium italic">
                {product.description || "Aucune description détaillée disponible pour ce produit pour le moment. Mais rassurez-vous, c'est l'un de nos meilleurs morceaux !"}
              </div>

              <div className="h-px bg-border/50 w-full" />

              {/* Quantity + Add to cart */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center bg-card border border-border/50 rounded-xl shadow-inner p-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-secondary rounded-lg transition-colors text-primary"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 text-xl font-black text-center min-w-[4rem]">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-secondary rounded-lg transition-colors text-primary"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => { 
                    addItem({
                      id: product.id,
                      name: product.title,
                      price: product.price,
                      image: product.image_url || '',
                      images: [product.image_url || ''],
                      unit: 'kg',
                      slug: product.slug,
                      category: product.categories?.name || 'Général',
                      description: product.description || ''
                    }, qty); 
                    setQty(1); 
                    toast.success(`${product.title} ajouté au panier`);
                  }}
                  className="flex-1 h-14 flex items-center justify-center gap-3 bg-foreground text-card rounded-xl font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300 shadow-xl transform hover:-translate-y-1"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Ajouter au panier
                </button>
                <button className="w-14 h-14 bg-card border border-border/50 rounded-xl flex items-center justify-center hover:text-red-500 hover:border-red-500/30 transition-all duration-300 group shadow-md">
                  <Heart className="w-6 h-6 group-hover:fill-red-500" />
                </button>
              </div>

              {/* Badges Info */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <Package className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Statut</p>
                    <p className="text-xs font-bold">En Stock</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border/50">
                  <div className="w-5 h-5 rounded-full bg-green-500" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Livraison</p>
                    <p className="text-xs font-bold">Moins de 24h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Similar products */}
        {similar.length > 0 && (
          <section className="container pb-20 pt-10 border-t border-border/30">
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-10 tracking-tight">Découvrez aussi...</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {similar.map((p) => (
                <Link key={p.id} to={`/produit/${p.slug}`} className="group flex flex-col">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/20 border border-border/30 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center opacity-10">
                         <Package className="w-8 h-8" />
                      </div>
                    )}
                    {p.original_price > p.price && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded shadow">
                        PROMO
                      </span>
                    )}
                  </div>
                  <div className="mt-4 px-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{p.categories?.name || 'Général'}</span>
                    <h3 className="font-bold text-base text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-1">{p.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-base font-black text-foreground">{p.price.toLocaleString()} FCFA</span>
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
