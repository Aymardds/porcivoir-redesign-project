import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react";
import logo from "@/assets/logo-porcivoir.png";

const Footer = () => (
  <footer>
    {/* Support banner */}
    <div className="bg-primary">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <Phone className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-sans text-primary-foreground font-bold text-base">
              Support 24/7 — Nous sommes là pour vous
            </h3>
            <p className="text-primary-foreground/60 text-sm font-sans">
              Contactez-nous à tout moment pour vos commandes
            </p>
          </div>
        </div>
        <a
          href="tel:+2250787295734"
          className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-3 rounded-lg text-sm hover:bg-accent/90 transition-colors"
        >
          <Phone className="w-4 h-4" />
          +225 07 87 295 734
        </a>
      </div>
    </div>

    {/* Main footer */}
    <div className="bg-foreground text-primary-foreground">
      <div className="container py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <img src={logo} alt="Porcivoir" className="h-16 md:h-20 w-auto mb-4 object-contain" />
          <p className="text-primary-foreground/50 text-sm leading-relaxed font-sans">
            Votre boucherie de porc de confiance en Côte d'Ivoire. Viande
            fraîche et de qualité, directement de nos fermes.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-sans font-bold text-sm uppercase tracking-wider mb-5 text-primary-foreground">
            Liens Rapides
          </h4>
          <ul className="space-y-2.5 text-sm text-primary-foreground/50 font-sans">
            <li>
              <a href="#" className="hover:text-accent transition-colors">
                Accueil
              </a>
            </li>
            <li>
              <a
                href="#produits"
                className="hover:text-accent transition-colors"
              >
                Boutique
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-accent transition-colors">
                Nos Services
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-accent transition-colors">
                Devenir Partenaire
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-accent transition-colors">
                Blog
              </a>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-sans font-bold text-sm uppercase tracking-wider mb-5 text-primary-foreground">
            Catégories
          </h4>
          <ul className="space-y-2.5 text-sm text-primary-foreground/50 font-sans">
            <li>
              <a href="#" className="hover:text-accent transition-colors">
                Porc Frais
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-accent transition-colors">
                Porc Fumé
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-accent transition-colors">
                Charcuterie
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-accent transition-colors">
                Grillades
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-accent transition-colors">
                Abats
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-sans font-bold text-sm uppercase tracking-wider mb-5 text-primary-foreground">
            Contact
          </h4>
          <ul className="space-y-3.5 text-sm text-primary-foreground/50 font-sans">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-3.5 h-3.5 text-accent" />
              </div>
              +225 07 87 295 734
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-3.5 h-3.5 text-accent" />
              </div>
              info@porcivoir.com
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-accent" />
              </div>
              Abidjan, Côte d'Ivoire
            </li>
          </ul>
          {/* Newsletter */}
          <div className="mt-5">
            <p className="text-xs text-primary-foreground/40 font-sans mb-2">
              Inscrivez-vous à notre newsletter
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 bg-primary-foreground/10 border-0 rounded-l-lg px-3 py-2 text-xs font-sans text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button className="bg-accent text-accent-foreground px-4 py-2 rounded-r-lg text-xs font-bold hover:bg-accent/90 transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/30 font-sans">
          <span>© 2026 Porc'Ivoire. Tous droits réservés.</span>
          <span>
            Produit par les meilleures fermes de Côte d'Ivoire
          </span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
