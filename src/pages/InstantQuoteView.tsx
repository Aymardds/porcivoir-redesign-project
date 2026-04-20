import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Loader2, Download, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function InstantQuoteView() {
    const { id } = useParams();
    const [quote, setQuote] = useState<any>(null);
    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchQuote();
    }, [id]);

    const fetchQuote = async () => {
        try {
            const { data, error } = await supabase
                .from('instant_quotes')
                .select('*, quote_templates(*)')
                .eq('id', id)
                .single();

            if (error) throw error;
            
            // Check if it's paid
            if (data.payment_status !== 'paid') {
                toast.error("Ce devis n'a pas été réglé.");
            }

            setQuote(data);
            setTemplate(data.quote_templates);
        } catch (error: any) {
            toast.error("Devis introuvable.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleWhatsAppShare = () => {
        const text = `Bonjour,\nVoici mon devis estimatif d'infrastructures agro-pastorales de ${quote.input_quantity} m² édité avec Porc'Ivoire :\n\n- Total HT : ${quote.total_ht.toLocaleString()} FCFA\n- Total Estimatif TTC : ${quote.total_ttc.toLocaleString()} FCFA\n\nConsulter le devis en détail : ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    if (!quote) return (
        <div className="min-h-screen pt-32 text-center">Devis indisponible.</div>
    );

    return (
        <div className="min-h-screen bg-secondary relative">
            <style>
                {`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px;}
                    .no-print { display: none !important; }
                }
                `}
            </style>
            
            {/* NO PRINT AREA */}
            <div className="no-print">
                <Header />
            </div>

            <div className="container py-8 md:py-12 px-4 max-w-4xl mx-auto mt-16 lg:mt-24 no-print">
                 <div className="flex justify-between items-center mb-6">
                    <Link to="/mon-compte" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Mon Espace de devis
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleWhatsAppShare} className="text-[#25D366] hover:bg-[#25D366]/10 border-none">
                            <Share2 className="w-4 h-4 mr-2" /> Partager (WhatsApp)
                        </Button>
                        <Button size="sm" onClick={handlePrint} className="bg-primary text-white">
                            <Download className="w-4 h-4 mr-2" /> Imprimer / PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* PRINTABLE AREA */}
            <div ref={printRef} className="print-area container px-4 max-w-4xl mx-auto pb-20">
                <div className="bg-white rounded-none md:rounded-xl shadow-xl md:border border-border p-6 md:p-12 text-black">
                    
                    {/* Header Facture */}
                    <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                        <div>
                            {/* Fake logo for PDF if real SVG doesn't print well */}
                            <h2 className="text-3xl font-black text-green-700 font-sans tracking-tight">PORC'IVOIRE</h2>
                            <p className="text-sm font-medium text-gray-500 mt-1">L'Excellence Agro-Pastorale</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-black text-gray-800 uppercase">Devis Estimatif</h1>
                            <p className="text-sm font-bold mt-2 text-gray-600">N° : {quote.id.split('-')[0].toUpperCase()}</p>
                            <p className="text-sm text-gray-500">Date : {new Date(quote.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-xs uppercase font-bold text-gray-400 mb-1">Pour :</p>
                            <p className="font-bold text-gray-800 text-lg">{quote.client_name || 'Client Devis Automatique'}</p>
                            <p className="text-sm text-gray-600">{quote.client_email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase font-bold text-gray-400 mb-1">Détails du Projet :</p>
                            <p className="font-bold text-primary text-lg">{template?.name || "Service"}</p>
                            <p className="text-sm text-gray-600 font-bold bg-gray-100 inline-block px-2 py-1 rounded">Superficie : {quote.input_quantity} m²</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto mb-8">
                        <table className="w-full text-sm text-left border-collapse border border-gray-200">
                            <thead className="bg-gray-100 text-gray-800 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 border border-gray-200">Lot de Travaux</th>
                                    <th className="px-4 py-3 border border-gray-200">Description des Prestations</th>
                                    <th className="px-4 py-3 border border-gray-200">Unité</th>
                                    <th className="px-4 py-3 border border-gray-200 text-center">Quantité</th>
                                    <th className="px-4 py-3 border border-gray-200 text-right">P.U. (FCFA)</th>
                                    <th className="px-4 py-3 border border-gray-200 text-right min-w-[120px]">Total HT (FCFA)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quote.snapshot.map((row: any, i: number) => (
                                    <tr key={i} className="border-b border-gray-100 last:border-none">
                                        <td className="px-4 py-3 font-bold text-gray-800 border border-gray-200 whitespace-nowrap">{row.lot_name}</td>
                                        <td className="px-4 py-3 text-gray-600 border border-gray-200 text-xs">{row.description}</td>
                                        <td className="px-4 py-3 border border-gray-200">{row.unit}</td>
                                        <td className="px-4 py-3 border border-gray-200 text-center font-bold">{row.quantity}</td>
                                        <td className="px-4 py-3 border border-gray-200 text-right whitespace-nowrap">{row.unit_price.toLocaleString()}</td>
                                        <td className="px-4 py-3 border border-gray-200 text-right font-black text-gray-800">{row.total_line.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {/* Totals Rows */}
                                <tr className="bg-gray-50 border-t-2 border-gray-300">
                                    <td colSpan={5} className="px-4 py-3 text-right font-bold text-gray-600 uppercase text-xs">Total HT</td>
                                    <td className="px-4 py-3 text-right border border-gray-200 font-black">{quote.total_ht.toLocaleString()}</td>
                                </tr>
                                <tr className="bg-red-50/50">
                                    <td colSpan={5} className="px-4 py-3 text-right font-bold text-red-800 uppercase text-xs">Imprévus ({template?.imprevus_percentage}%)</td>
                                    <td className="px-4 py-3 text-right border border-gray-200 font-bold text-red-800 text-xs">+ {quote.imprevus_amount.toLocaleString()}</td>
                                </tr>
                                <tr className="bg-green-600 text-white">
                                    <td colSpan={5} className="px-4 py-4 text-right font-black uppercase text-sm border-r border-green-500">Total Estimatif TTC</td>
                                    <td className="px-4 py-4 text-right font-black text-lg border-green-500">{quote.total_ttc.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer text */}
                    <div className="text-gray-500 text-xs text-center border-t border-gray-200 pt-6">
                        <p className="font-bold mb-1">Ce devis est une estimation générée automatiquement selon les standards du marché.</p>
                        <p>Pour la validation finale et l'exécution de ces travaux, un expert Porc'Ivoire viendra confirmer les paramètres sur le terrain.</p>
                    </div>

                    
                    {quote.payment_status === 'paid' && (
                        <div className="absolute top-10 right-10 rotate-12 opacity-80 border-4 border-green-600 rounded-lg p-2 text-green-700 font-black text-2xl uppercase tracking-widest no-print">
                            PAYÉ
                        </div>
                    )}
                </div>
            </div>

            <div className="no-print">
                <Footer />
            </div>
        </div>
    );
}
