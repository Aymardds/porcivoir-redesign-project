import { Truck, ArrowRight } from "lucide-react";

const DeliveryBanner = () => (
  <section className="container py-6 md:py-10">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent via-orange-500 to-amber-500 p-8 md:p-12">
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 float-animation" />
      <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl text-white">
              Livraison Gratuite dans Abidjan !
            </h2>
            <p className="text-white/80 mt-1 font-sans text-sm md:text-base">
              Pour toute commande à partir de <strong>25 000 CFA</strong>
            </p>
          </div>
        </div>
        <a
          href="#produits"
          className="inline-flex items-center gap-2 bg-white text-accent font-bold px-8 py-3.5 rounded-lg text-sm hover:bg-white/90 transition-colors shadow-lg flex-shrink-0"
        >
          Commander
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  </section>
);

export default DeliveryBanner;
