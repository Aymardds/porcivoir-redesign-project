import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface QuoteRequest {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  client_location: string;
  payment_reference?: string;
  total_amount: number;
  fixed_rate: number;
  quote_items?: any[];
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('quote_id');
  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuoteData = async () => {
      if (!quoteId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('quote_requests')
          .select(`
            *,
            quote_items (
              *,
              services (*)
            )
          `)
          .eq('id', quoteId)
          .single();

        if (error) {
          console.error('Error fetching quote:', error);
        } else {
          setQuote(data as QuoteRequest);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteData();
  }, [quoteId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount).replace('XOF', 'FCFA');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Paiement réussi !
          </h1>
          <p className="text-lg text-muted-foreground">
            Votre devis a été confirmé et votre paiement a été traité avec succès.
          </p>
        </div>

        {quote && (
          <Card className="shadow-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Détails de votre commande
              </CardTitle>
              <CardDescription>
                Référence de paiement: {quote.payment_reference}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Informations client</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Nom:</strong> {quote.client_name}</p>
                    <p><strong>Email:</strong> {quote.client_email}</p>
                    <p><strong>Téléphone:</strong> {quote.client_phone}</p>
                    <p><strong>Adresse:</strong> {quote.client_address}</p>
                    <p><strong>Localisation:</strong> {quote.client_location}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Résumé financier</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Taux fixe ({quote.fixed_rate}%):</span>
                      <span>{formatCurrency((quote.total_amount * quote.fixed_rate) / (100 + quote.fixed_rate))}</span>
                    </div>
                    <div className="flex justify-between font-bold text-primary border-t pt-2">
                      <span>Total payé:</span>
                      <span>{formatCurrency(quote.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {quote.quote_items && quote.quote_items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Services commandés</h3>
                  <div className="space-y-2">
                    {quote.quote_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{item.services?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantité: {item.quantity} × {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle>Prochaines étapes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Confirmation par email</h4>
                <p className="text-sm text-muted-foreground">
                  Un email de confirmation avec tous les détails vous a été envoyé.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Traitement de votre demande</h4>
                <p className="text-sm text-muted-foreground">
                  Notre équipe va maintenant traiter votre demande et vous contacter sous 24-48h.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </Button>

          <Button asChild>
            <Link to="/quote-request" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Nouvelle demande de devis
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;