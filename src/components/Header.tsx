import { Search, User, Heart, ShoppingCart, Menu } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-porcivoir.png";

const navItems = [
  { label: "Accueil", href: "#" },
  { label: "Nos services", href: "#services" },
  { label: "Boutique", href: "#produits" },
  { label: "Devenir Partenaire", href: "#partenaire" },
  { label: "Articles", href: "#articles" },
  { label: "Contacts", href: "#contact" },
];

const categories = [
  "Porc Frais", "Porc Fumé", "Charcuterie", "Grillades", "Abats", "Découpes Spéciales",
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      {/* Top nav */}
      <div className="container flex items-center justify-between py-2 text-sm text-muted-foreground">
        <div className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="hover:text-primary transition-colors font-medium">
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-primary transition-colors"><Search className="w-5 h-5" /></button>
          <button className="hover:text-primary transition-colors"><User className="w-5 h-5" /></button>
          <button className="hover:text-primary transition-colors relative">
            <Heart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </button>
          <button className="hover:text-primary transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </button>
        </div>
      </div>

      {/* Category bar */}
      <div className="border-t border-border">
        <div className="container flex items-center gap-8 py-3">
          <a href="#" className="flex-shrink-0">
            <img src={logo} alt="Porcivoir" className="h-12 w-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-6">
            {categories.map((cat) => (
              <a key={cat} href="#produits" className="text-foreground font-semibold text-sm hover:text-accent transition-colors">
                {cat}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="block py-2 text-foreground font-medium hover:text-primary">
              {item.label}
            </a>
          ))}
          <div className="border-t border-border mt-2 pt-2">
            {categories.map((cat) => (
              <a key={cat} href="#produits" className="block py-1 text-sm text-muted-foreground hover:text-accent">
                {cat}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
