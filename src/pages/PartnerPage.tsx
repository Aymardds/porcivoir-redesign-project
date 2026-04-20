import { useState } from "react";
import { Handshake, ArrowRight, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const SUBJECTS = [
    {
        id: "devis",
        label: "Demande de Devis",
        description: "Aménagement agro-pastoral, approvisionnement, études de faisabilité",
        color: "border-primary bg-primary/5 text-primary",
        badge: "bg-primary/10 text-primary",
    },
    {
        id: "troupeau",
        label: "Gestion de Troupeaux",
        description: "Suivi vétérinaire, nutrition, reproduction, performance d'exploitation",
        color: "border-amber-500 bg-amber-50 text-amber-700",
        badge: "bg-amber-100 text-amber-700",
    },
    {
        id: "formation",
        label: "Formations Expertes",
        description: "Sessions animées par nos experts, certification, pratique terrain",
        color: "border-yellow-400 bg-yellow-50 text-yellow-700",
        badge: "bg-yellow-100 text-yellow-800",
    },
    {
        id: "autre",
        label: "Autre / Partenariat",
        description: "Distribution, co-branding, investissement ou autre collaboration",
        color: "border-border bg-secondary/50 text-foreground",
        badge: "bg-secondary text-muted-foreground",
    },
];

export default function PartnerPage() {
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [form, setForm] = useState({
        company: "", name: "", email: "", phone: "", message: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubject) { toast.error("Veuillez sélectionner un sujet."); return; }
        if (!form.name || !form.email || !form.message) {
            toast.error("Veuillez remplir les champs obligatoires.");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.from("partner_requests").insert({
                subject: selectedSubject,
                company_name: form.company,
                contact_name: form.name,
                email: form.email,
                phone: form.phone,
                message: form.message,
                status: "pending",
            });
            if (error && error.code !== "42P01") throw error;
            toast.success("Votre demande de partenariat a bien été envoyée ! Nous reviendrons vers vous rapidement.");
            setForm({ company: "", name: "", email: "", phone: "", message: "" });
            setSelectedSubject("");
        } catch {
            toast.error("Une erreur s'est produite. Contactez-nous directement par téléphone.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-green-800 text-white py-20 lg:py-28">
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
                <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/5" />
                <div className="container relative z-10 text-center px-4">
                    <span className="inline-block bg-white/15 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-white/20">
                        Devenir Partenaire
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Collaborons ensemble</h1>
                    <p className="text-white/80 text-lg max-w-xl mx-auto">
                        Que ce soit pour un devis, la gestion de votre troupeau, une formation ou un partenariat,
                        dites-nous comment nous pouvons travailler ensemble.
                    </p>
                </div>
            </section>

            <section className="container py-16 px-4">
                <div className="max-w-3xl mx-auto">

                    {/* Subject picker */}
                    <div className="mb-10">
                        <h2 className="text-xl font-black text-foreground mb-2">Quel est le sujet de votre demande ?</h2>
                        <p className="text-muted-foreground text-sm mb-6">Sélectionnez la catégorie qui correspond le mieux à votre projet.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {SUBJECTS.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setSelectedSubject(s.id)}
                                    className={`text-left border-2 rounded-2xl p-4 transition-all duration-200 ${selectedSubject === s.id
                                            ? `${s.color} border-2 shadow-md scale-[1.02]`
                                            : "border-border bg-card hover:border-border/80 hover:shadow-sm"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${selectedSubject === s.id ? s.badge : "bg-secondary text-muted-foreground"
                                            }`}>
                                            {s.label}
                                        </span>
                                        {selectedSubject === s.id && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Partner form */}
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                        <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
                            <Handshake className="w-5 h-5 text-primary" /> Vos coordonnées
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Nom complet *</label>
                                    <input
                                        type="text" required
                                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                                        placeholder="Votre nom"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Entreprise / Structure</label>
                                    <input
                                        type="text"
                                        value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                                        className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                                        placeholder="Nom de votre société (optionnel)"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Email *</label>
                                    <input
                                        type="email" required
                                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                                        placeholder="vous@exemple.ci"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                                        placeholder="+225 07 XX XX XX XX"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Décrivez votre projet *</label>
                                <textarea
                                    required rows={5}
                                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
                                    placeholder={
                                        selectedSubject === "devis" ? "Décrivez votre projet d'aménagement, vos besoins en approvisionnement..."
                                            : selectedSubject === "troupeau" ? "Décrivez votre exploitation, la taille de votre cheptel, vos problématiques actuelles..."
                                                : selectedSubject === "formation" ? "Quel type de formation vous intéresse, combien de personnes, quelles dates..."
                                                    : "Dites-nous comment vous imaginez notre collaboration..."
                                    }
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                {loading ? "Envoi en cours..." : "Envoyer ma demande"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
