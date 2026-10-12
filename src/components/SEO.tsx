import { useEffect } from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, any>;
}

export const DEFAULT_SEO = {
  title: "Porc'Ivoire — Viande de Porc Fraîche & Élevage en Côte d'Ivoire",
  description:
    "Commandez votre viande de porc fraîche en ligne en Côte d'Ivoire. Découpes de porc de qualité supérieure, porcs sur pied, conseils d'élevage et livraison rapide à Abidjan et environs.",
  image: "https://www.porcivoir.com/og-image.png",
  url: "https://www.porcivoir.com/",
  keywords:
    "porcivoire, viande de porc abidjan, boucherie porcine cote d'ivoire, porc frais abidjan, elevage porcin abidjan, porcelet cote d'ivoire, cote de porc, poitrine de porc, livraison viande abidjan",
};

export default function SEO({
  title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  image = DEFAULT_SEO.image,
  url,
  type = "website",
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    // Title
    const fullTitle = title
      ? title.includes("Porc'Ivoire")
        ? title
        : `${title} | Porc'Ivoire`
      : DEFAULT_SEO.title;
    document.title = fullTitle;

    // Helper for meta tags
    const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, nameOrProperty);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Descriptions & Keywords
    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);

    // Canonical link
    const currentUrl =
      url || (typeof window !== "undefined" ? window.location.href : DEFAULT_SEO.url);
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", currentUrl);

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:image", image, true);
    setMeta("og:url", currentUrl, true);
    setMeta("og:type", type, true);

    // Twitter Card
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);

    // JSON-LD injection
    const scriptId = "dynamic-seo-jsonld";
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.id = scriptId;
        scriptEl.type = "application/ld+json";
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, keywords, image, url, type, jsonLd]);

  return null;
}
