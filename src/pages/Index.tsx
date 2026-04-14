import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import TabbedProducts from "@/components/TabbedProducts";
import PromoBanners from "@/components/PromoBanners";
import CountdownDeal from "@/components/CountdownDeal";
import PromoDealBanner from "@/components/PromoDealBanner";
import ProductGrid from "@/components/ProductGrid";
import ServicesCTA from "@/components/ServicesCTA";
import DeliveryBanner from "@/components/DeliveryBanner";
import BlogSection from "@/components/BlogSection";
import TrustBar from "@/components/TrustBar";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <HeroSlider />
      <CategoryGrid />
      <TabbedProducts />
      <PromoBanners />
      <CountdownDeal />

      <PromoDealBanner />

      <div className="relative">
        <ProductGrid limit={8} />
        <div className="container pb-16 flex justify-center mt-[-2rem]">
          <Link 
            to="/boutique" 
            className="group flex items-center gap-2 bg-foreground text-card px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl hover:-translate-y-1"
          >
            Voir toute la boutique
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
      <ServicesCTA />
      <DeliveryBanner />
      <BlogSection />
    </main>
    <TrustBar />
    <Footer />
  </div>
);

export default Index;
