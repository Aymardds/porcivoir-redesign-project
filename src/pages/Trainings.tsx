import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import {
    Calendar, User, ArrowRight, Loader2, BookOpen, CheckCircle,
    Award, Users, Clock, Star, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const features = [
    {
        icon: Award,
        title: "Experts reconnus",
        description: "Chaque formation est animée par des professionnels agropastoraux certifiés avec des années de terrain.",
    },
    {
        icon: Users,
        title: "Petits groupes",
        description: "Des sessions à effectifs limités pour garantir un suivi personnalisé et un apprentissage de qualité.",
    },
    {
        icon: CheckCircle,
        title: "Certificat remis",
        description: "À l'issue de votre formation, recevez un certificat officiel reconnu par les filières agricoles.",
    },
    {
        icon: Star,
        title: "Pratique & terrain",
        description: "50% de pratique sur site pour maîtriser les gestes techniques et optimiser votre exploitation.",
    },
];

const steps = [
    { num: "01", label: "Choisissez une formation" },
    { num: "02", label: "Inscrivez-vous en ligne" },
    { num: "03", label: "Payez et confirmez" },
    { num: "04", label: "Participez à la session" },
];

export default function Trainings() {
    const [trainings, setTrainings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrainings = async () => {
            try {
                const { data, error } = await supabase
                    .from("trainings")
                    .select("*")
                    .eq("is_active", true)
                    .gte("end_date", new Date().toISOString())
                    .order("start_date", { ascending: true });

                if (error) throw error;
                setTrainings(data || []);
            } catch (err) {
                console.error("Erreur chargement formations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrainings();
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* ── HERO ───────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-yellow-300 to-amber-300 text-black">
                {/* Decorative blobs */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-black/5" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-black/5" />
                <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-black/5" />

                <div className="container relative z-10 py-24 lg:py-32 px-4 text-center">
                    <span className="inline-block bg-black/10 backdrop-blur text-black text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-black/15">
                        Formations Expertes
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black font-sans leading-tight mb-6 max-w-4xl mx-auto">
                        Développez vos compétences <span className="text-yellow-900">agricoles</span>
                    </h1>
                    <p className="text-black/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-sans leading-relaxed">
                        Des formations pratiques animées par des experts reconnus pour vous aider
                        à optimiser votre exploitation et rentabiliser votre activité.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="#catalogue"
                            className="inline-flex items-center gap-2 bg-black text-white font-black px-8 py-4 rounded-xl text-base hover:bg-black/85 transition-all shadow-xl hover:-translate-y-0.5"
                        >
                            Voir les formations <ArrowRight className="w-5 h-5" />
                        </a>
                        <a
                            href="#comment-ca-marche"
                            className="inline-flex items-center gap-2 bg-black/15 border border-black/25 text-black font-bold px-8 py-4 rounded-xl text-base hover:bg-black/25 transition-all"
                        >
                            Comment ça marche ?
                        </a>
                    </div>

                    {/* Quick stats */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                        {[
                            { value: "100%", label: "Pratique terrain" },
                            { value: "Expert", label: "Formateurs certifiés" },
                            { value: "Certifié", label: "Attestation finale" },
                            { value: "24h", label: "Support post-session" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-black/10 rounded-2xl p-4 text-center border border-black/15">
                                <p className="text-2xl font-black text-yellow-900 mb-1">{stat.value}</p>
                                <p className="text-xs text-black/60 font-semibold">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ───────────────────────────────────────────── */}
            <section className="bg-secondary py-16 lg:py-24">
                <div className="container px-4">
                    <div className="text-center mb-12">
                        <p className="text-xs font-black uppercase tracking-widest text-yellow-600 mb-2">Pourquoi nous choisir</p>
                        <h2 className="text-3xl md:text-4xl font-black text-foreground">
                            Une formation de qualité professionnelle
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div key={f.title} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                                        <Icon className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── COMMENT CA MARCHE ──────────────────────────────────── */}
            <section id="comment-ca-marche" className="bg-background py-16 lg:py-24 border-t border-border">
                <div className="container px-4">
                    <div className="text-center mb-12">
                        <p className="text-xs font-black uppercase tracking-widest text-yellow-600 mb-2">Simple & Rapide</p>
                        <h2 className="text-3xl md:text-4xl font-black text-foreground">Comment ça marche ?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-yellow-300 -z-0" />
                        {steps.map((s, i) => (
                            <div key={s.num} className="flex flex-col items-center text-center relative">
                                <div className="w-16 h-16 rounded-full bg-yellow-400 text-black flex items-center justify-center font-black text-lg shadow-lg mb-4 z-10">
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

            {/* ── CATALOGUE ──────────────────────────────────────────── */}
            <section id="catalogue" className="bg-secondary py-16 lg:py-24 border-t border-border">
                <div className="container px-4">
                    <div className="text-center mb-12">
                        <p className="text-xs font-black uppercase tracking-widest text-yellow-600 mb-2">Disponibles maintenant</p>
                        <h2 className="text-3xl md:text-4xl font-black text-foreground">Nos formations du moment</h2>
                        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                            Des sessions planifiées tout au long de l'année. Inscrivez-vous dès aujourd'hui pour garantir votre place.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary opacity-50" />
                            <p>Chargement des formations disponibles...</p>
                        </div>
                    ) : trainings.length === 0 ? (
                        <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm max-w-2xl mx-auto">
                            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold font-sans text-foreground mb-2">Aucune formation en cours</h3>
                            <p className="text-muted-foreground">Nous préparons le prochain programme. Revenez bientôt !</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {trainings.map((training) => (
                                <Link
                                    key={training.id}
                                    to={`/formations/${training.id}`}
                                    className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col ring-1 ring-transparent hover:ring-primary/25"
                                >
                                    {/* Image or placeholder */}
                                    {training.cover_image ? (
                                        <div className="h-52 overflow-hidden relative">
                                            <img
                                                src={training.cover_image}
                                                alt={training.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            <div className="absolute bottom-4 left-4">
                                                <span className="bg-yellow-400 text-black text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                                    Inscriptions ouvertes
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-52 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                                            <BookOpen className="w-20 h-20 text-primary/20" />
                                            <div className="absolute bottom-4 left-4">
                                                <span className="bg-yellow-400 text-black text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                                    Inscriptions ouvertes
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-lg font-black font-sans text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                            {training.title}
                                        </h3>

                                        <div className="flex flex-col gap-2 mb-6">
                                            <div className="flex items-center text-sm text-muted-foreground font-medium gap-2">
                                                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                                <span>
                                                    Du {new Date(training.start_date).toLocaleDateString('fr-FR')} au {new Date(training.end_date).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                            {training.expert_trainer && (
                                                <div className="flex items-center text-sm text-muted-foreground font-medium gap-2">
                                                    <User className="w-4 h-4 text-primary flex-shrink-0" />
                                                    <span>Avec {training.expert_trainer}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center text-sm text-muted-foreground font-medium gap-2">
                                                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                                                <span>
                                                    {Math.ceil((new Date(training.end_date).getTime() - new Date(training.start_date).getTime()) / (1000 * 60 * 60 * 24))} jours de formation
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-5 border-t border-border flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Frais d'inscription</p>
                                                <p className="text-2xl font-black text-primary tracking-tight">
                                                    {training.price.toLocaleString("fr-FR")} <span className="text-sm font-bold">FCFA</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-primary text-white font-bold text-sm px-4 py-2.5 rounded-xl group-hover:bg-primary/90 transition-colors shadow-sm">
                                                S'inscrire <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── CTA BOTTOM ─────────────────────────────────────────── */}
            <section className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-amber-300 text-black py-16 lg:py-20">
                <div className="container px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-4">Prêt à franchir le cap ?</h2>
                    <p className="text-black/70 max-w-xl mx-auto mb-8 text-lg">
                        Rejoignez les centaines d'éleveurs et entrepreneurs qui ont développé leurs compétences avec Porc'Ivoire.
                    </p>
                    <a href="#catalogue" className="inline-flex items-center gap-2 bg-black text-white font-black px-8 py-4 rounded-xl text-base hover:bg-black/85 transition-all shadow-xl hover:-translate-y-0.5">
                        Choisir ma formation <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
}
