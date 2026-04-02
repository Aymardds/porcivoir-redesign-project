import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Search, Filter, Loader2, Package, X, ChevronRight, SlidersHorizontal } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("categorie") || "Tout";
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
    window.scrollTo(0, 0);
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    } catch (error) {
      console.error(error);
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

  return (
    <div className="min-h-screen flex flex-col bg-secondary/5">
      <Header />
      
      {/* Page Header */}
      <div className="bg-primary pt-12 pb-20 mt-[-1px]">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-primary-foreground">
              <h1 className="text-4xl md:text-5xl font-black font-sans uppercase tracking-tighter">La Boutique</h1>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mt-4 opacity-70">
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
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden bg-white text-primary hover:bg-white/90"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container flex-1 py-12">
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
          </aside>

          {/* Mobile Categories - Overlay */}
          {showFilters && (
            <div className="fixed inset-0 z-[100] bg-black/60 lg:hidden flex justify-end">
              <div className="w-[80%] bg-card h-full p-6 animate-slide-in-right">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Filtres</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-6">
                   <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Catégories</p>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleCategoryChange("Tout")} className={`px-4 py-3 rounded-xl text-left font-bold ${categoryParam === "Tout" ? "bg-primary text-white" : "bg-secondary"}`}>Tout</button>
                      {categories.map(cat => (
                        <button key={cat.id} onClick={() => handleCategoryChange(cat.name)} className={`px-4 py-3 rounded-xl text-left font-bold ${categoryParam === cat.name ? "bg-primary text-white" : "bg-secondary"}`}>{cat.name}</button>
                      ))}
                    </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Listing */}
          <div className="flex-1">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
               <div className="w-full sm:max-w-md relative">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                 <Input 
                   placeholder="Que cherchez-vous aujourd'hui ?" 
                   className="pl-10 h-12 bg-white border-border/50 rounded-xl focus:ring-primary/20"
                 />
               </div>
               <div className="flex items-center gap-2 self-end">
                 <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Trier par :</span>
                 <select className="bg-transparent text-xs font-bold font-sans outline-none cursor-pointer text-primary border-b border-primary/20 pb-1">
                   <option>Plus récents</option>
                   <option>Prix croissant</option>
                   <option>Prix décroissant</option>
                 </select>
               </div>
             </div>

             <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-border/30">
               <ProductGrid initialCategory={categoryParam} />
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
