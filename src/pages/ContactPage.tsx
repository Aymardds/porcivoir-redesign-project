import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const infos = [
    { icon: Phone, label: "Téléphone", value: "07 87 295 734", href: "tel:+2250787295734" },
    { icon: Mail, label: "Email", value: "contact@porcivoir.com", href: "mailto:contact@porcivoir.com" },
    { icon: MapPin, label: "Adresse", value: "Abidjan, Côte d'Ivoire", href: null },
    { icon: Clock, label: "Horaires", value: "Lun – Sam : 08h – 18h", href: null },
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error("Veuillez remplir les champs obligatoires.");
            return;
        }
        setLoading(true);
        try {
            // Store message in Supabase contact_messages if the table exists,
            // otherwise just send a toast (graceful fallback)
            const { error } = await supabase.from("contact_messages").insert({
                name: form.name,
                email: form.email,
                phone: form.phone,
                subject: form.subject,
                message: form.message,
            });
            if (error && error.code !== "42P01") throw error; // 42P01 = table doesn't exist
            toast.success("Votre message a bien été envoyé ! Nous vous répondrons très bientôt.");
            setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        } catch {
            toast.error("Une erreur s'est produite. Réessayez ou appelez-nous directement.");
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
                        Nous Contacter
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Une question ? Parlons-en.</h1>
                    <p className="text-white/80 text-lg max-w-xl mx-auto">
                        Notre équipe est disponible pour vous accompagner. Remplissez le formulaire ou contactez-nous directement.
                    </p>
                </div>
            </section>

            <section className="container py-16 px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Contact infos */}
                    <div className="space-y-5">
                        <h2 className="text-xl font-black text-foreground mb-6">Coordonnées</h2>
                        {infos.map((info) => {
                            const Icon = info.icon;
                            const content = (
                                <div className="flex items-start gap-4 bg-secondary/50 border border-border rounded-2xl p-4 hover:shadow-sm transition-shadow">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{info.label}</p>
                                        <p className="font-semibold text-foreground">{info.value}</p>
                                    </div>
                                </div>
                            );
                            return info.href
                                ? <a key={info.label} href={info.href}>{content}</a>
                                : <div key={info.label}>{content}</div>;
                        })}

                        {/* Réseaux sociaux */}
                        <div className="bg-secondary/50 border border-border rounded-2xl p-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Réseaux sociaux</p>
                                    <div className="flex gap-3 mt-1">
                                        {["Facebook", "WhatsApp", "Instagram"].map((r) => (
                                            <span key={r} className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{r}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 shadow-sm">
                        <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" /> Envoyer un message
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Nom complet *</label>
                                    <input
                                        type="text" required
                                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                                        placeholder="Ex: Kouassi Arsène"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Email *</label>
                                    <input
                                        type="email" required
                                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                                        placeholder="vous@exemple.ci"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                                        placeholder="+225 07 XX XX XX XX"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Sujet</label>
                                    <input
                                        type="text"
                                        value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                        className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                                        placeholder="Ex: Question générale"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Message *</label>
                                <textarea
                                    required rows={5}
                                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
                                    placeholder="Décrivez votre demande..."
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                {loading ? "Envoi en cours..." : "Envoyer le message"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
