import { Search, User, Heart, ShoppingCart, Menu, X, Phone, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo-porcivoir.png";
import TopBar from "./TopBar";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique" },
  { label: "Devenir Partenaire", href: "/partenaire" },
  { label: "Actualités", href: "/blog" },
  { label: "Contacts", href: "/contact" },
];

const categories = [
  "Porc Frais",
  "Porc Fumé",
  "Charcuterie",
  "Grillades",
  "Abats",
  "Découpes Spéciales",
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems, setIsOpen } = useCart();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/boutique?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-50 bg-card shadow-sm">
        {/* Main header row */}
        <div className="container flex items-center justify-between gap-3 py-2 md:py-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-foreground hover:text-accent transition-colors shrink-0"
            aria-label="Ouvrir le menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Porcivoir" className="h-12 md:h-20 w-auto object-contain" />
          </Link>

          {/* Search bar — desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full bg-secondary/70 border border-border rounded-lg pl-4 pr-12 py-2.5 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-accent text-accent-foreground rounded-md flex items-center justify-center hover:bg-accent/90 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Phone — desktop only */}
            <a
              href="tel:+2250787295734"
              className="hidden lg:flex items-center gap-2 text-foreground hover:text-accent transition-colors mr-2"
            >
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-accent" />
              </div>
              <div className="text-xs font-sans">
                <span className="text-muted-foreground block">Appelez-nous</span>
                <span className="font-bold text-foreground">07 87 295 734</span>
              </div>
            </a>

            {/* Search — mobile toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2 hover:text-accent transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account — desktop */}
            {user ? (
              <div className="relative group hidden md:block">
                <button className="p-2 flex items-center gap-2 hover:text-accent transition-colors">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-bold truncate max-w-[100px] hidden lg:inline">{profile?.first_name || 'Mon Compte'}</span>
                </button>
                <div className="absolute top-full right-0 mt-3 w-56 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                  <div className="px-4 py-2 border-b border-border/50 mb-2">
                    <p className="text-xs font-bold text-foreground">Connecté en tant que</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  {profile?.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-foreground hover:bg-accent/10 hover:text-accent transition-colors">
                      Espace Administration
                    </Link>
                  )}
                  <Link to="/mon-compte" className="block px-4 py-2 text-sm text-foreground hover:bg-accent/10 hover:text-accent transition-colors">
                    Tableau de bord client
                  </Link>
                  <button onClick={() => { signOut(); navigate('/'); }} className="w-full text-left block px-4 py-2 mt-1 border-t border-border/30 text-sm text-red-600 font-bold hover:bg-red-50 transition-colors">
                    Se déconnecter
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="p-2 hover:text-accent transition-colors hidden md:flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="text-sm font-bold hidden lg:inline">Connexion</span>
              </Link>
            )}

            {/* Wishlist */}
            <button className="p-2 hover:text-accent transition-colors relative">
              <Heart className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                0
              </span>
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 hover:text-accent transition-colors relative"
              aria-label="Ouvrir le panier"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="lg:hidden border-t border-border px-4 py-3 bg-secondary/30">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                autoFocus
                className="w-full bg-card border border-border rounded-lg pl-4 pr-12 py-2.5 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-accent text-accent-foreground rounded-md flex items-center justify-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Navigation bar — desktop */}
        <div className="hidden lg:block border-t border-border bg-primary">
          <div className="container flex items-center gap-0">
            {/* Categories dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-3 font-sans font-semibold text-sm">
                <Menu className="w-4 h-4" />
                Catégories
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute top-full left-0 w-56 bg-card border border-border rounded-b-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/boutique?categorie=${encodeURIComponent(cat)}`}
                    className="block px-4 py-2.5 text-sm font-sans text-foreground hover:bg-accent/10 hover:text-accent transition-colors border-b border-border/50 last:border-b-0"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex items-center">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="px-4 py-3 text-primary-foreground/90 font-sans font-medium text-sm hover:text-accent-foreground hover:bg-primary-foreground/10 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-card shadow-lg">
            <div className="px-4 py-3 max-h-[75vh] overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center py-3 text-foreground font-semibold font-sans hover:text-accent transition-colors border-b border-border/30 last:border-b-0"
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground font-sans font-black uppercase tracking-widest mb-3">
                  Catégories
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/boutique?categorie=${encodeURIComponent(cat)}`}
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-sm text-muted-foreground hover:text-accent font-medium font-sans bg-secondary/50 rounded-lg"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              {/* AUTH Mobile */}
              <div className="mt-4 pt-4 border-t border-border">
                {user ? (
                  <>
                    <p className="text-xs text-muted-foreground font-sans font-black uppercase tracking-widest mb-3">
                      Mon Compte ({profile?.first_name || 'Client'})
                    </p>
                    {profile?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-bold text-foreground hover:text-accent border-b border-border/30">
                        Espace Administration
                      </Link>
                    )}
                    <Link to="/mon-compte" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-bold text-foreground hover:text-accent">
                      Tableau de bord client
                    </Link>
                    <button onClick={() => { signOut(); setMobileOpen(false); navigate('/'); }} className="w-full text-left py-3 mt-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg px-4 flex justify-center">
                      Me déconnecter
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full py-3 text-center text-sm font-bold bg-primary text-white rounded-lg">
                    Se connecter / S'inscrire
                  </Link>
                )}
              </div>

              {/* Mobile contact */}
              <a
                href="tel:+2250787295734"
                className="mt-6 flex items-center justify-center gap-3 py-4 bg-secondary/30 rounded-xl text-foreground hover:text-accent transition-colors"
              >
                <Phone className="w-4 h-4 text-accent" />
                <span className="font-bold text-sm">Besoin d'aide ? 07 87 295 734</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
