import { Search, User, Heart, ShoppingCart, Menu, X, Phone, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import logo from "@/assets/logo-porcivoir.png";
import TopBar from "./TopBar";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Demander un Devis", href: "/devis" },
  { label: "Boutique", href: "/boutique" },
  { label: "Devenir Partenaire", href: "/#partenaire" },
  { label: "Actualités", href: "/blog" },
  { label: "Contacts", href: "/#contact" },
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
  const { totalItems, setIsOpen } = useCart();

  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-50 bg-card shadow-sm">
        {/* Main header row: logo + search + icons */}
        <div className="container flex items-center justify-between gap-4 py-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-foreground hover:text-accent transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Porcivoir" className="h-16 md:h-24 w-auto object-contain" />
          </Link>

          {/* Search bar — desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full bg-secondary/70 border border-border rounded-lg pl-4 pr-12 py-2.5 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-accent text-accent-foreground rounded-md flex items-center justify-center hover:bg-accent/90 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 md:gap-3">
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

            {/* Search — mobile */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 hover:text-accent transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <button className="p-2 hover:text-accent transition-colors hidden md:block">
              <User className="w-5 h-5" />
            </button>

            <button className="p-2 hover:text-accent transition-colors relative">
              <Heart className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                0
              </span>
            </button>

            <button
              onClick={() => setIsOpen(true)}
              className="p-2 hover:text-accent transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden border-t border-border px-4 py-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full bg-secondary/70 border border-border rounded-lg pl-4 pr-12 py-2.5 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-accent text-accent-foreground rounded-md flex items-center justify-center">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation bar — desktop */}
        <div className="hidden md:block border-t border-border bg-primary">
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

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-4 py-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 text-foreground font-medium font-sans hover:text-accent transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                <p className="text-xs text-muted-foreground font-sans font-semibold uppercase tracking-wider mb-2">
                  Catégories
                </p>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/boutique?categorie=${encodeURIComponent(cat)}`}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-sm text-muted-foreground hover:text-accent font-sans"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
