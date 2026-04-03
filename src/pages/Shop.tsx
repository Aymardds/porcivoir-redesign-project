import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Search, Filter, Loader2, Package, X, ChevronRight, ShoppingCart } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import PromoDealBanner from "@/components/PromoDealBanner";
import MiniCountdown from "@/components/MiniCountdown";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("categorie") || "Tout";
  const searchParam = searchParams.get("q") || "";
  const { addItem } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [sortBy, setSortBy] = useState("recent");
  const [promoProducts, setPromoProducts] = useState<Set<string>>(new Set());
  const [promoDates, setPromoDates] = useState<Record<string, string>>({});

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: prods, error } = await supabase.from("products").select("*, categories(name)").eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      if (prods) setProducts(prods);

      const { data: cats } = await supabase.from("categories").select("id, name").order("name");
      if (cats) setCategories(cats);

      const { data: promos } = await supabase.from("promotion_products").select("product_id, promotions!inner(is_active, valid_until)").eq("promotions.is_active", true);
      if (promos) {
        setPromoProducts(new Set(promos.map(p => p.product_id)));
        const dates: Record<string, string> = {};
        promos.forEach((p: any) => {
          if (p.promotions?.valid_until) {
            dates[p.product_id] = p.promotions.valid_until;
          }
        });
        setPromoDates(dates);
      }
    } catch (err) {
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (catName: string) => {
    if (catName === "Tout") {
      searchParams.delete("categorie");
    } else {
      searchParams.set("categorie", catName);
    }
    setSearchParams(searchParams);
    setShowFilters(false);
  };

  // Filter + search + sort
  const filteredProducts = products
    .filter((p) => {
      const matchesCategory = categoryParam === "Tout" || p.categories?.name === categoryParam;
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen flex flex-col bg-secondary/5">
      <Header />

      {/* Page Header */}
      <div className="bg-primary pt-10 pb-16 mt-[-1px]">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-primary-foreground">
              <h1 className="text-3xl md:text-5xl font-black font-sans uppercase tracking-tighter">La Boutique</h1>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mt-3 opacity-70">
                <span>Accueil</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white">Produits</span>
                {categoryParam !== "Tout" && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white">{categoryParam}</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest self-start"
            >
              <Filter className="w-4 h-4" />
              Filtres {categoryParam !== "Tout" && `(${categoryParam})`}
            </button>
          </div>
        </div>
      </div>

      <main className="container flex-1 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 border-l-4 border-primary pl-3">Catégories</h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleCategoryChange("Tout")}
                  className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    categoryParam === "Tout"
                      ? "bg-primary text-white shadow-md translate-x-2"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  Toutes les découpes
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.name)}
                    className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      categoryParam === cat.name
                        ? "bg-primary text-white shadow-md translate-x-2"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-primary rounded-2xl text-primary-foreground relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Besoin d'aide ?</p>
                <h4 className="text-lg font-bold leading-tight mb-4 text-white">Conseils de préparation ou commande spéciale ?</h4>
                <a
                  href="https://wa.me/2250787295734"
                  target="_blank"
                  className="inline-block bg-white text-primary px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Nous contacter
                </a>
              </div>
              <Package className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
            </div>
            <PromoDealBanner compact />
          </aside>

          {/* Mobile Filters Overlay */}
          {showFilters && (
            <div className="fixed inset-0 z-[100] bg-black/60 lg:hidden flex justify-end" onClick={() => setShowFilters(false)}>
              <div className="w-[85%] max-w-sm bg-card h-full p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Filtres</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:text-destructive transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="mb-8">
                  <PromoDealBanner compact />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Catégories</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleCategoryChange("Tout")}
                      className={`px-4 py-3 rounded-xl text-left font-bold text-sm ${categoryParam === "Tout" ? "bg-primary text-white" : "bg-secondary"}`}
                    >
                      Toutes les découpes
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.name)}
                        className={`px-4 py-3 rounded-xl text-left font-bold text-sm ${categoryParam === cat.name ? "bg-primary text-white" : "bg-secondary"}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Listing */}
          <div className="flex-1 min-w-0">
            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Que cherchez-vous aujourd'hui ?"
                  className="w-full h-12 pl-10 pr-4 bg-white border border-border/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 bg-white border border-border/50 rounded-xl px-4 h-12">
                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest whitespace-nowrap">Trier par :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold font-sans outline-none cursor-pointer text-primary"
                >
                  <option value="recent">Plus récents</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-6">
              {loading ? "Chargement..." : `${filteredProducts.length} produit${filteredProducts.length !== 1 ? "s" : ""} trouvé${filteredProducts.length !== 1 ? "s" : ""}`}
              {categoryParam !== "Tout" && ` dans "${categoryParam}"`}
              {searchQuery && ` pour "${searchQuery}"`}
            </p>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium italic">Préparation de vos morceaux favoris...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 flex flex-col items-center gap-4">
                <Package className="w-16 h-16 opacity-20" />
                <p className="text-lg font-black text-foreground">Aucun produit trouvé</p>
                <p className="text-muted-foreground text-sm">Essayez un autre filtre ou mot-clé.</p>
                <button onClick={() => { handleCategoryChange("Tout"); setSearchQuery(""); }} className="mt-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                  Voir tous les produits
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group bg-white rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
                    <Link to={`/produit/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-secondary/30">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 bg-gradient-to-br from-secondary to-secondary/50">
                          <Package className="w-8 h-8 mb-2 opacity-20" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-center opacity-40">Image bientôt</span>
                        </div>
                      )}
                      {(product.original_price > product.price || promoProducts.has(product.id)) && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-md">
                          PROMO {product.original_price > product.price ? `-${Math.round(((product.original_price - product.price) / product.original_price) * 100)}%` : ''}
                        </span>
                      )}
                      {promoDates[product.id] && <MiniCountdown targetDate={promoDates[product.id]} />}
                    </Link>

                    <div className="p-4 md:p-5 flex-1 flex flex-col">
                      <div className="mb-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">
                          {product.categories?.name || "Général"}
                        </span>
                      </div>

                      <Link to={`/produit/${product.slug}`} className="block flex-1">
                        <h3 className="font-bold text-foreground text-base md:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
                          {product.title}
                        </h3>
                      </Link>

                      <div className="mt-3 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg md:text-xl font-black text-foreground">{product.price.toLocaleString()} FCFA</span>
                          {product.original_price > product.price && (
                            <span className="text-xs text-muted-foreground line-through decoration-red-500/50">
                              {product.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Le Kilogramme (kg)</span>
                      </div>

                      <button
                        onClick={() =>
                          addItem({
                            id: product.id,
                            name: product.title,
                            price: product.price,
                            image: product.image_url || "",
                            images: [product.image_url || ""],
                            unit: "kg",
                            slug: product.slug,
                            category: product.categories?.name || "Général",
                            description: product.description || "",
                          })
                        }
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-foreground text-card py-3 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-primary hover:text-white transition-all duration-300 shadow-sm active:scale-95"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Ajouter au Panier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
