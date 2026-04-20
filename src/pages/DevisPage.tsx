import { Link } from "react-router-dom";
import {
    ArrowRight, FileText, ChevronRight, CheckCircle,
    Clock, MapPin, Wrench, Layers, Phone
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const services = [
    {
        id: "infrastructures",
        icon: Wrench,
        title: "Infrastructures et Équipements",
        description: "Devis instantané pour la conception et réalisation d'espaces d'élevage : porcheries, enclos, équipements.",
        link: "/devis/generateur/bbbbbbbb-8888-4444-aaaa-111111111111"
    },
    {
        icon: Layers,
        title: "Approvisionnement",
        description: "Sourcing de matières premières agricoles, aliments pour animaux et équipements spécialisés au meilleur prix.",
    },
    {
        icon: MapPin,
        title: "Études & Conseils",
        description: "Études de faisabilité, diagnostic de votre exploitation et plan d'action personnalisé par nos experts.",
    },
    {
        icon: Phone,
        title: "Suivi & Accompagnement",
        description: "Un interlocuteur dédié après la remise de votre devis pour vous accompagner dans la réalisation du projet.",
    },
];

const steps = [
    { num: "01", label: "Décrivez votre projet" },
    { num: "02", label: "Payez les frais de dossier" },
    { num: "03", label: "Notre équipe vous contacte" },
    { num: "04", label: "Recevez votre devis détaillé" },
];

const faqs = [
    {
        q: "Quel est le délai pour recevoir mon devis ?",
        a: "Après paiement des frais de dossier, notre équipe vous contacte sous 48h pour recueillir vos besoins et élaborer votre offre.",
    },
    {
        q: "Les frais de dossier sont-ils remboursables ?",
        a: "Les frais de dossier couvrent le travail d'analyse et de conception de votre offre. Ils sont déductibles si vous signez le devis final.",
    },
    {
        q: "Puis-je demander un devis pour plusieurs services ?",
        a: "Oui, notre formulaire vous permet de sélectionner plusieurs prestations pour un devis global.",
    },
];

export default function DevisPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* ── HERO ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-green-800 text-white">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5" />
                <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-white/5" />

                <div className="container relative z-10 py-24 lg:py-32 px-4 text-center">
                    <span className="inline-block bg-white/15 backdrop-blur text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-white/20">
                        Service Professionnel
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black font-sans leading-tight mb-6 max-w-4xl mx-auto">
                        Obtenez votre devis <span className="text-yellow-300">agro-pastoral</span> sur mesure
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-sans leading-relaxed">
                        Aménagement, approvisionnement, études de faisabilité — recevez une offre
                        personnalisée élaborée par nos experts en 48h.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 bg-yellow-400 text-black font-black px-8 py-4 rounded-xl text-base hover:bg-yellow-300 transition-all shadow-xl hover:-translate-y-0.5"
                        >
                            Demander mon devis <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a
                            href="#services"
                            className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-white/25 transition-all"
                        >
                            Nos prestations
                        </a>
                    </div>

                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                        {[
                            { value: "48h", label: "Délai de réponse" },
                            { value: "Sur mesure", label: "Offre personnalisée" },
                            { value: "Expert", label: "Interlocuteur dédié" },
                            { value: "100%", label: "Satisfait ou remboursé" },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/10 rounded-2xl p-4 text-center border border-white/15">
                                <p className="text-2xl font-black text-yellow-300 mb-1">{s.value}</p>
                                <p className="text-xs text-white/70 font-semibold">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SERVICES ── */}
            <section id="services" className="bg-secondary py-16 lg:py-24">
                <div className="container px-4">
                    <div className="text-center mb-12">
                        <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Ce que nous proposons</p>
                        <h2 className="text-3xl md:text-4xl font-black text-foreground">Nos prestations</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.title} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{s.description}</p>
                                    
                                    {s.link ? (
                                        <Link to={s.link} className="inline-flex items-center text-sm font-bold text-primary hover:underline mt-auto">
                                            Générer le devis <ArrowRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    ) : (
                                        <Link to="/contact" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mt-auto">
                                            Faire une demande <ArrowRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── COMMENT CA MARCHE ── */}
            <section className="bg-background py-16 lg:py-24 border-t border-border">
                <div className="container px-4">
                    <div className="text-center mb-12">
                        <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Simple & Rapide</p>
                        <h2 className="text-3xl md:text-4xl font-black text-foreground">Comment ça marche ?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto relative">
                        <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-primary/20" />
                        {steps.map((s, i) => (
                            <div key={s.num} className="flex flex-col items-center text-center relative">
                                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg mb-4 z-10">
                                    {s.num}
                                </div>
                                <p className="font-bold text-foreground text-sm">{s.label}</p>
                                {i < steps.length - 1 && (
                                    <ChevronRight className="w-5 h-5 text-primary/40 md:hidden mt-2" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="bg-secondary py-16 border-t border-border">
                <div className="container px-4 max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Questions fréquentes</p>
                        <h2 className="text-3xl font-black text-foreground">FAQ</h2>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <div key={faq.q} className="bg-card border border-border rounded-2xl p-6">
                                <h3 className="font-bold text-foreground mb-2 flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    {faq.q}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed pl-8">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA BOTTOM ── */}
            <section className="bg-gradient-to-br from-primary via-primary/90 to-green-800 text-white py-16 lg:py-20">
                <div className="container px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-4">Prêt à lancer votre projet ?</h2>
                    <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
                        Remplissez notre formulaire en ligne et recevez une offre personnalisée dans les 48h.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 bg-yellow-400 text-black font-black px-8 py-4 rounded-xl text-base hover:bg-yellow-300 transition-all shadow-xl hover:-translate-y-0.5"
                    >
                        Demander mon devis maintenant <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
