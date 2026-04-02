import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
      <div>
        <h3 className="text-xl mb-4">Porcivoir</h3>
        <p className="text-primary-foreground/70 text-sm leading-relaxed">
          Votre boucherie de porc de confiance en Côte d'Ivoire. Viande fraîche et de qualité, directement de nos fermes.
        </p>
      </div>
      <div>
        <h4 className="font-sans font-bold text-sm uppercase tracking-wider mb-4">Liens Rapides</h4>
        <ul className="space-y-2 text-sm text-primary-foreground/70">
          <li><a href="#" className="hover:text-primary-foreground transition-colors">Accueil</a></li>
          <li><a href="#produits" className="hover:text-primary-foreground transition-colors">Boutique</a></li>
          <li><a href="#" className="hover:text-primary-foreground transition-colors">Nos Services</a></li>
          <li><a href="#" className="hover:text-primary-foreground transition-colors">Devenir Partenaire</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-sans font-bold text-sm uppercase tracking-wider mb-4">Catégories</h4>
        <ul className="space-y-2 text-sm text-primary-foreground/70">
          <li><a href="#" className="hover:text-primary-foreground transition-colors">Porc Frais</a></li>
          <li><a href="#" className="hover:text-primary-foreground transition-colors">Porc Fumé</a></li>
          <li><a href="#" className="hover:text-primary-foreground transition-colors">Charcuterie</a></li>
          <li><a href="#" className="hover:text-primary-foreground transition-colors">Grillades</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-sans font-bold text-sm uppercase tracking-wider mb-4">Contact</h4>
        <ul className="space-y-3 text-sm text-primary-foreground/70">
          <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +225 07 87 295 734</li>
          <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@porcivoir.com</li>
          <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5" /> Abidjan, Côte d'Ivoire</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-primary-foreground/20">
      <div className="container py-4 text-center text-sm text-primary-foreground/50">
        © 2026 Porcivoir. Tous droits réservés.
      </div>
    </div>
  </footer>
);

export default Footer;
