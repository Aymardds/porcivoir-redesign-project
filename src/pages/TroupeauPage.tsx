import { Link } from "react-router-dom";
import {
    ArrowRight, ChevronRight, HeartPulse, BarChart3,
    Wheat, Stethoscope, ShieldCheck, Clock
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const services = [
    {
        icon: HeartPulse,
        title: "Santé animale",
        description: "Suivi vétérinaire régulier, prévention des maladies et protocoles de vaccination adaptés à votre cheptel.",
    },
    {
        icon: Wheat,
        title: "Nutrition & Alimentation",
        description: "Optimisation des rations alimentaires pour maximiser la croissance et la qualité de vos animaux.",
    },
    {
        icon: BarChart3,
        title: "Gestion & Performance",
        description: "Tableaux de bord de suivi, indicateurs de productivité et conseils pour rentabiliser votre exploitation.",
    },
    {
        icon: Stethoscope,
        title: "Reproduction",
        description: "Gestion du cycle de reproduction, sélection génétique et optimisation du taux de fécondité.",
    },
];

const advantages = [
    { icon: ShieldCheck, text: "Experts certifiés en élevage porcin" },
    { icon: Clock, text: "Intervention rapide sur toute la Côte d'Ivoire" },
    { icon: BarChart3, text: "Rapports de suivi mensuels détaillés" },
    { icon: HeartPulse, text: "Disponibilité 7j/7 pour les urgences" },
];

const steps = [
    { num: "01", label: "Contactez-nous" },
    { num: "02", label: "Diagnostic de votre ferme" },
    { num: "03", label: "Plan de gestion personnalisé" },
    { num: "04", label: "Suivi continu & reporting" },
];

export default function TroupeauPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* ── HERO ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-amber-700 via-amber-600 to-yellow-600 text-white">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5" />
                <div className="absolute top-1/3 left-1/2 w-48 h-48 rounded-full bg-white/5" />

                <div className="container relative z-10 py-24 lg:py-32 px-4 text-center">
                    <span className="inline-block bg-white/15 backdrop-blur text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-white/20">
                        Élevage & Gestion
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black font-sans leading-tight mb-6 max-w-4xl mx-auto">
                        Confiez la gestion de votre <span className="text-yellow-200">troupeau</span> à nos experts
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-sans leading-relaxed">
                        Santé animale, nutrition, reproduction et performance — nos spécialistes
                        prennent en charge le suivi complet de votre exploitation porcine.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/quote"
                            className="inline-flex items-center gap-2 bg-white text-amber-800 font-black px-8 py-4 rounded-xl text-base hover:bg-white/90 transition-all shadow-xl hover:-translate-y-0.5"
                        >
                            Demander un accompagnement <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a
                            href="#services"
                            className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-white/25 transition-all"
                        >
                            Nos services
                        </a>
                    </div>

                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                        {[
                            { value: "+500", label: "Exploitations suivies" },
                            { value: "15 ans", label: "D'expertise terrain" },
                            { value: "7j/7", label: "Disponibilité" },
                            { value: "CI", label: "Côte d'Ivoire entière" },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/10 rounded-2xl p-4 text-center border border-white/15">
                                <p className="text-2xl font-black text-yellow-200 mb-1">{s.value}</p>
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
                        <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-2">Nos expertises</p>
                        <h2 className="text-3xl md:text-4xl font-black text-foreground">Ce que nous gérons pour vous</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.title} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                                        <Icon className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── AVANTAGES ── */}
            <section className="bg-background py-16 border-t border-border">
                <div className="container px-4 max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-2">Pourquoi nous</p>
                        <h2 className="text-3xl md:text-4xl font-black text-foreground">Nos engagements</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {advantages.map((a) => {
                            const Icon = a.icon;
                            return (
                                <div key={a.text} className="flex items-center gap-4 bg-amber-50 border border-amber-100 rounded-2xl p-5">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <p className="font-semibold text-foreground">{a.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── COMMENT CA MARCHE ── */}
            <section className="bg-secondary py-16 border-t border-border">
                <div className="container px-4">
                    <div className="text-center mb-12">
                        <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-2">Notre approche</p>
                        <h2 className="text-3xl md:text-4xl font-black text-foreground">Comment ça marche ?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto relative">
                        <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-amber-200" />
                        {steps.map((s, i) => (
                            <div key={s.num} className="flex flex-col items-center text-center relative">
                                <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-lg shadow-lg mb-4 z-10">
                                    {s.num}
                                </div>
                                <p className="font-bold text-foreground text-sm">{s.label}</p>
                                {i < steps.length - 1 && (
                                    <ChevronRight className="w-5 h-5 text-amber-400 md:hidden mt-2" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA BOTTOM ── */}
            <section className="bg-gradient-to-br from-amber-700 via-amber-600 to-yellow-600 text-white py-16 lg:py-20">
                <div className="container px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-4">Optimisez votre élevage dès aujourd'hui</h2>
                    <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
                        Contactez-nous pour un diagnostic gratuit de votre exploitation et un plan d'accompagnement personnalisé.
                    </p>
                    <Link
                        to="/quote"
                        className="inline-flex items-center gap-2 bg-white text-amber-800 font-black px-8 py-4 rounded-xl text-base hover:bg-white/90 transition-all shadow-xl hover:-translate-y-0.5"
                    >
                        Contacter un expert <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
