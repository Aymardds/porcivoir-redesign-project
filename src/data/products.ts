export type Product = {
  id: string;
  name: string;
  slug: string;
  image: string;
  images: string[];
  price: number;
  oldPrice?: number;
  discount?: number;
  unit: string;
  badge?: string;
  category: string;
  description: string;
  weight?: string;
};

export const products: Product[] = [
  {
    id: "porc-entier",
    name: "Porc entier",
    slug: "porc-entier",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/entier_cracasse_produitporcivoir-270x300.jpg",
    images: [
      "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/entier_cracasse_produitporcivoir-270x300.jpg",
      "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/longe_produitporcivoir-270x300.jpg",
      "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/epaule_produitporcivoir-270x300.jpg",
    ],
    price: 2350,
    oldPrice: 2550,
    discount: 8,
    unit: "kg",
    category: "Porc Frais",
    description: "Porc entier frais, élevé dans nos fermes en Côte d'Ivoire. Idéal pour les grandes occasions, fêtes et cérémonies. Viande tendre et savoureuse, nourrie sans OGM.",
    weight: "25-35 kg",
  },
  {
    id: "longe",
    name: "Longe",
    slug: "longe",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/longe_produitporcivoir-270x300.jpg",
    images: [
      "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/longe_produitporcivoir-270x300.jpg",
      "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/carre_produitporcivoir-270x300.jpg",
    ],
    price: 2450,
    oldPrice: 2550,
    discount: 4,
    unit: "kg",
    category: "Porc Frais",
    description: "La longe de porc est un morceau noble et polyvalent. Parfaite pour les rôtis, les grillades ou les sautés. Viande maigre et tendre avec juste ce qu'il faut de gras pour le goût.",
  },
  {
    id: "jarret",
    name: "Jarret",
    slug: "jarret",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/jarret_produitporcivoir-270x300.jpg",
    images: [
      "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/jarret_produitporcivoir-270x300.jpg",
    ],
    price: 2550,
    oldPrice: 2950,
    discount: 14,
    unit: "kg",
    badge: "Promo",
    category: "Porc Frais",
    description: "Le jarret de porc, idéal pour les plats mijotés et les bouillons riches. La cuisson lente révèle toute la saveur de ce morceau généreux. Parfait pour le kedjenou de porc.",
  },
  {
    id: "echine",
    name: "Échine de porc",
    slug: "echine-de-porc",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2020/06/echine_produitporcivoir-270x300.jpg",
    images: [
      "https://boutiques.porcivoir.com/wp-content/uploads/2020/06/echine_produitporcivoir-270x300.jpg",
    ],
    price: 3500,
    oldPrice: 3800,
    discount: 8,
    unit: "kg",
    category: "Porc Frais",
    description: "L'échine de porc est un morceau persillé, juteux et plein de saveur. Excellente pour les braisés, les barbecues et les plats en sauce. Un favori des amateurs de bonne viande.",
  },
  {
    id: "carre",
    name: "Carré",
    slug: "carre",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2020/06/carre_produitporcivoir-270x300.jpg",
    images: [
      "https://boutiques.porcivoir.com/wp-content/uploads/2020/06/carre_produitporcivoir-270x300.jpg",
    ],
    price: 3000,
    oldPrice: 3500,
    discount: 14,
    unit: "kg",
    category: "Porc Frais",
    description: "Le carré de porc est une pièce de choix pour les repas festifs. Présenté avec ses côtes, il est parfait rôti au four avec des épices et aromates.",
  },
  {
    id: "cotes",
    name: "Côtes",
    slug: "cotes",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/cotes_produitporcivoir-270x300.jpg",
    images: [
      "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/cotes_produitporcivoir-270x300.jpg",
    ],
    price: 3000,
    oldPrice: 3500,
    discount: 14,
    unit: "kg",
    category: "Grillades",
    description: "Nos côtes de porc sont parfaites pour le grill et le barbecue. Marinées ou nature, elles offrent une viande juteuse et savoureuse à chaque bouchée.",
  },
  {
    id: "epaule",
    name: "Épaule",
    slug: "epaule",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/epaule_produitporcivoir-270x300.jpg",
    images: [
      "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/epaule_produitporcivoir-270x300.jpg",
    ],
    price: 2850,
    oldPrice: 3000,
    discount: 5,
    unit: "kg",
    category: "Porc Frais",
    description: "L'épaule de porc est un morceau généreux et économique. Parfaite pour les ragoûts, les effilochés (pulled pork) et les plats de longue cuisson.",
  },
  {
    id: "pattes",
    name: "Pattes",
    slug: "pattes",
    image: "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/pates_produitporcivoir-270x300.jpg",
    images: [
      "https://boutiques.porcivoir.com/wp-content/uploads/2022/01/pates_produitporcivoir-270x300.jpg",
    ],
    price: 1250,
    oldPrice: 1500,
    discount: 17,
    unit: "kg",
    badge: "Promo",
    category: "Abats",
    description: "Les pattes de porc sont un incontournable de la cuisine africaine. Riches en collagène, elles donnent des bouillons savoureux et des plats mijotés incomparables.",
  },
];
