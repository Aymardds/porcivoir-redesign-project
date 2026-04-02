import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import HeroBanners from "@/components/HeroBanners";
import FeatureBar from "@/components/FeatureBar";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen flex flex-col">
    <TopBar />
    <Header />
    <main className="flex-1">
      <HeroBanners />
      <FeatureBar />
      <ProductGrid />
    </main>
    <Footer />
  </div>
);

export default Index;
