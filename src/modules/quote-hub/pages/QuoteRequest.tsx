import React, { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import {
  User,
  ShoppingCart,
  Eye,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Plus,
  Minus,
  Calculator,
  Loader2,
  FileDown
} from 'lucide-react';
import { generateQuotePDF, generateReceiptPDF } from '@/utils/pdfGenerator';

interface QuoteFormData {
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  client_location: string;
}

interface SelectedService {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

// Ensure CinetPay is declared on window object
declare global {
  interface Window {
    CinetPay: any;
  }
}

const QuoteRequest = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteFormData>({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    client_location: '',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [fixedFee, setFixedFee] = useState(5000);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Porc\'Ivoire Agri',
    email: 'contact@porcivoire.ci',
    phone: '+225 07 00 00 00 00'
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchData();
    injectCinetPayWrapper();
  }, []);

  const injectCinetPayWrapper = () => {
    // Si déjà injecté dans l'index.html, on ne l'injecte pas une 2e fois. 
    // Mais on vérifie au cas où.
    if (!document.getElementById('cinetpay-script')) {
      const script = document.createElement('script');
      script.id = 'cinetpay-script';
      script.src = 'https://cdn.cinetpay.com/seamless/main.js';
      script.async = true;
      document.body.appendChild(script);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch services with categories
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          service_categories (
            name,
            icon
          )
        `)
        .eq('is_active', true)
        .order('title');
      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch all app settings
      const { data: settings, error: settingError } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value');

      if (!settingError && settings) {
        const fee = settings.find(s => s.setting_key === 'quote_fixed_fee')?.setting_value;
        const cName = settings.find(s => s.setting_key === 'company_name')?.setting_value;
        const cEmail = settings.find(s => s.setting_key === 'company_email')?.setting_value;
        const cPhone = settings.find(s => s.setting_key === 'company_phone')?.setting_value;

        if (fee) setFixedFee(parseFloat(fee));
        setCompanyInfo({
          name: cName || companyInfo.name,
          email: cEmail || companyInfo.email,
          phone: cPhone || companyInfo.phone
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Impossible de charger les données. Vérifiez que la base de données SQL a bien été mise à jour.');
    } finally {
      setPageLoading(false);
    }
  };

  const handleInputChange = (field: keyof QuoteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addService = (service: any) => {
    const existing = selectedServices.find(s => s.id === service.id);
    if (existing) {
      setSelectedServices(prev =>
        prev.map(s =>
          s.id === service.id
            ? { ...s, quantity: s.quantity + 1 }
            : s
        )
      );
    } else {
      setSelectedServices(prev => [
        ...prev,
        {
          id: service.id,
          title: service.title,
          price: service.price,
          quantity: 1,
        },
      ]);
    }
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeService(serviceId);
      return;
    }
    setSelectedServices(prev =>
      prev.map(s =>
        s.id === serviceId ? { ...s, quantity } : s
      )
    );
  };

  const getSubtotal = () => {
    return selectedServices.reduce(
      (sum, service) => sum + service.price * service.quantity,
      0
    );
  };

  const calculateTotal = () => {
    return getSubtotal() + fixedFee;
  };

  const getPayableAmount = () => {
    return fixedFee;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.client_name || !formData.client_email || !formData.client_phone || !formData.client_address || !formData.client_location) {
        toast.error('Veuillez remplir tous les champs obligatoires.');
        return;
      }
    }

    if (currentStep === 2) {
      if (selectedServices.length === 0) {
        toast.error('Veuillez sélectionner au moins un service.');
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const initCinetPayPayment = (quoteData: any, finalTotal: number) => {
    return new Promise((resolve, reject) => {
      const CP = window.CinetPay;
      if (!CP) {
        toast.error('CinetPay SDK non chargé');
        reject(new Error('SDK missing'));
        return;
      }

      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const notifyUrl = isLocalhost
        ? 'https://porcivoire.vercel.app/api/cinetpay-notify'
        : `${window.location.origin}/api/cinetpay-notify`;

      CP.setConfig({
        apikey: import.meta.env.VITE_CINETPAY_API_KEY,
        site_id: import.meta.env.VITE_CINETPAY_SITE_ID,
        notify_url: notifyUrl,
        mode: 'PRODUCTION',
      });

      const payload = {
        transaction_id: `QT${Date.now()}${Math.floor(Math.random() * 1000)}`,
        amount: Math.floor(finalTotal),
        currency: 'XOF',
        channels: 'ALL',
        description: `Devis #${quoteData.id.slice(0, 8)} - PorcIvoire`,
        customer_name: (formData.client_name.split(' ')[1] || 'Client').substring(0, 50),
        customer_surname: (formData.client_name.split(' ')[0] || formData.client_name).substring(0, 50),
        customer_phone_number: formData.client_phone.replace(/\D/g, ''),
        customer_email: formData.client_email || 'client@porcivoire.ci',
        customer_address: formData.client_address.substring(0, 50),
        customer_city: formData.client_location.substring(0, 50),
        customer_country: 'CI',
        customer_state: 'CI',
        customer_zip_code: '00225',
      };

      CP.getCheckout(payload);

      CP.waitResponse((data: any) => {
        if (data.status === 'ACCEPTED') {
          resolve(data);
        } else {
          reject(data);
        }
      });

      CP.onError((data: any) => {
        console.error('CinetPay onError:', data);
        reject(data);
      });
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const subtotal = getSubtotal();
      const total = subtotal + fixedFee;

      // Create quote request using supabaseAdmin to allow returning the ID via .select()
      const { data: quoteData, error: quoteError } = await supabaseAdmin
        .from('quote_requests')
        .insert({
          client_name: formData.client_name,
          client_email: formData.client_email,
          client_phone: formData.client_phone,
          client_address: formData.client_address,
          client_location: formData.client_location,
          fixed_rate: 0, // Obsolete, keeping for schema compatibility
          total_amount: total,
          currency: 'FCFA',
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create quote items
      const quoteItems = selectedServices.map(service => ({
        quote_request_id: quoteData.id,
        service_id: service.id,
        quantity: service.quantity,
        unit_price: service.price,
        total_price: service.price * service.quantity,
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('quote_items')
        .insert(quoteItems);

      if (itemsError) throw itemsError;

      // Invoke pop-up CinetPay for ONLY the fixed fee
      const payableAmount = getPayableAmount();
      try {
        await initCinetPayPayment(quoteData, payableAmount);

        toast.success("Paiement réussi ! Votre devis est confirmé.");

        // Update payment_status status to paid
        await supabaseAdmin
          .from('quote_requests')
          .update({ payment_status: 'paid' })
          .eq('id', quoteData.id);

        // Generate and Download PDFs
        const pdfData = {
          company: companyInfo,
          client: {
            name: formData.client_name,
            email: formData.client_email,
            phone: formData.client_phone,
            address: `${formData.client_location}, ${formData.client_address}`
          },
          quote: {
            id: quoteData.id,
            date: new Date().toLocaleDateString('fr-FR'),
            status: 'Payé',
            fixed_fee: fixedFee,
            subtotal: subtotal,
            total: total,
            items: selectedServices
          }
        };

        generateQuotePDF(pdfData);
        generateReceiptPDF(pdfData);

        // Reset form
        setCurrentStep(1);
        setFormData({
          client_name: '', client_email: '', client_phone: '', client_address: '', client_location: ''
        });
        setSelectedServices([]);

      } catch (paymentError) {
        console.error('Paiement échoué ou annulé', paymentError);
        toast.error("Le processus de paiement n'a pas pu aboutir.");
      }

    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error("Impossible de créer le devis. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-10 mt-8 relative z-10 before:absolute before:inset-0 before:h-1 border-gray-100 before:-z-10 before:top-1/2 before:-translate-y-1/2 max-w-lg mx-auto">
      <div className="absolute top-1/2 -mt-0.5 left-0 right-0 h-1 bg-secondary/80 -z-10 rounded-full" />
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex flex-1 items-center justify-center relative">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-sm ${step <= currentStep
                ? 'bg-primary text-white scale-110 shadow-primary/30 border-4 border-white'
                : 'bg-secondary text-muted-foreground border-4 border-white'
              }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`absolute left-1/2 w-full h-1 top-1/2 -mt-0.5 -z-10 transition-colors duration-500 ${step < currentStep ? 'bg-primary' : 'bg-transparent'
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary flex flex-col">


      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
        {/* Background gradient blur */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-foreground font-sans tracking-tight mb-4 text-orange-gradient">
              Démarer un devis
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
              Bénéficiez de nos services traiteurs et agropastoraux. Processus simple en 4 étapes pour obtenir votre devis personnalisé.
            </p>
          </div>

          {renderStepIndicator()}

          {pageLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="mb-10 min-h-[400px]">

              {/* ÉTAPE 1: Informations client */}
              {currentStep === 1 && (
                <Card className="shadow-lg border-border/50 overflow-hidden ring-1 ring-black/5 rounded-2xl animate-fade-in">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold font-sans">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      Informations de base
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="client_name" className="text-sm font-semibold">Nom complet <span className="text-destructive">*</span></Label>
                        <Input id="client_name" value={formData.client_name} onChange={(e) => handleInputChange('client_name', e.target.value)} placeholder="Jean Dupont" className="bg-secondary/50 h-12" />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="client_email" className="text-sm font-semibold">Email <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input id="client_email" type="email" value={formData.client_email} onChange={(e) => handleInputChange('client_email', e.target.value)} placeholder="votre@email.com" className="pl-11 bg-secondary/50 h-12" />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="client_phone" className="text-sm font-semibold">Téléphone <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input id="client_phone" type="tel" value={formData.client_phone} onChange={(e) => handleInputChange('client_phone', e.target.value)} placeholder="07 00 00 00 00" className="pl-11 bg-secondary/50 h-12" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="client_location" className="text-sm font-semibold">Maison/Région <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input id="client_location" value={formData.client_location} onChange={(e) => handleInputChange('client_location', e.target.value)} placeholder="Abidjan, Cocody" className="pl-11 bg-secondary/50 h-12" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label htmlFor="client_address" className="text-sm font-semibold">Indication d'adresse <span className="text-destructive">*</span></Label>
                      <Textarea id="client_address" value={formData.client_address} onChange={(e) => handleInputChange('client_address', e.target.value)} placeholder="Précisez votre lieu exact..." rows={3} className="bg-secondary/50 resize-none" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ÉTAPE 2: Choix des services */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <Card className="shadow-lg border-border/50 rounded-2xl overflow-hidden ring-1 ring-black/5">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50">
                      <CardTitle className="flex items-center gap-3 text-2xl font-bold font-sans">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <ShoppingCart className="w-6 h-6 text-primary" />
                        </div>
                        Sélectionnez les Services
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  {categories.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
                      Aucun service n'est disponible pour le moment.
                    </div>
                  )}

                  {categories.map((category) => {
                    const categoryServices = services.filter(s => s.category_id === category.id);
                    if (categoryServices.length === 0) return null;
                    return (
                      <Card key={category.id} className="shadow-sm border-border rounded-xl">
                        <CardHeader className="pb-3 px-6">
                          <CardTitle className="flex items-center gap-3">
                            {category.icon && <span className="text-3xl">{category.icon}</span>}
                            <div>
                              <h3 className="text-xl font-bold font-sans">{category.name}</h3>
                              <p className="text-sm text-muted-foreground font-normal mt-1">{category.description}</p>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                          <div className="grid gap-4 mt-2">
                            {categoryServices.map((service) => {
                              const isSelected = selectedServices.find(s => s.id === service.id);
                              return (
                                <div key={service.id} className={`p-5 rounded-xl border transition-all duration-200 ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}`}>
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                    <div className="flex-1">
                                      <h4 className="font-bold text-foreground text-lg mb-1">{service.title}</h4>
                                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                                      <div className="text-xl font-bold font-sans text-primary">
                                        {formatCurrency(service.price)}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-center">
                                      {isSelected ? (
                                        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-border shadow-sm">
                                          <Button size="icon" variant="ghost" onClick={() => updateQuantity(service.id, isSelected.quantity - 1)} className="h-8 w-8 text-foreground hover:text-destructive">
                                            <Minus className="w-4 h-4" />
                                          </Button>
                                          <span className="w-6 text-center font-bold text-lg">{isSelected.quantity}</span>
                                          <Button size="icon" variant="ghost" onClick={() => updateQuantity(service.id, isSelected.quantity + 1)} className="h-8 w-8 text-foreground hover:text-primary">
                                            <Plus className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <Button onClick={() => addService(service)} className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 rounded-lg whitespace-nowrap">
                                          <Plus className="w-4 h-4 mr-2" />
                                          Ajouter
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* ÉTAPE 3: Résumé */}
              {currentStep === 3 && (
                <Card className="shadow-lg border-border/50 rounded-2xl overflow-hidden ring-1 ring-black/5 animate-fade-in">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold font-sans">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Eye className="w-6 h-6 text-primary" />
                      </div>
                      Aperçu de la commande
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-8">
                    <div className="p-5 bg-secondary/80 rounded-xl border border-border/50">
                      <h4 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2"><User className="w-5 h-5 opacity-50" /> Mes Informations</h4>
                      <div className="grid md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                        <div className="flex items-center gap-2"><span className="text-muted-foreground w-20">Nom :</span> <span className="font-semibold">{formData.client_name}</span></div>
                        <div className="flex items-center gap-2"><span className="text-muted-foreground w-20">Email :</span> <span className="font-semibold">{formData.client_email}</span></div>
                        <div className="flex items-center gap-2"><span className="text-muted-foreground w-20">Téléphone :</span> <span className="font-semibold">{formData.client_phone}</span></div>
                        <div className="flex items-center gap-2"><span className="text-muted-foreground w-20">Lieu :</span> <span className="font-semibold">{formData.client_location}</span></div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2"><ShoppingCart className="w-5 h-5 opacity-50" /> Prestations choisis</h4>
                      <div className="space-y-3">
                        {selectedServices.map((service) => (
                          <div key={service.id} className="flex justify-between items-center p-4 bg-card border border-border rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">{service.quantity}x</div>
                              <div>
                                <h5 className="font-bold">{service.title}</h5>
                                <p className="text-sm text-muted-foreground">{formatCurrency(service.price)} l'unité</p>
                              </div>
                            </div>
                            <div className="font-black text-lg text-primary">
                              {formatCurrency(service.price * service.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-900 text-white rounded-xl p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Prestations :</span>
                          <span className="font-semibold">{formatCurrency(getSubtotal())}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-400">
                          <span>Frais de dossier (Fixe) :</span>
                          <span>{formatCurrency(fixedFee)}</span>
                        </div>
                        <div className="border-t border-gray-700 mt-4 pt-4 flex justify-between items-end">
                          <span className="font-semibold text-lg text-gray-300">Estimation totale :</span>
                          <span className="text-3xl font-black text-white">{formatCurrency(calculateTotal())}</span>
                        </div>
                        <div className="mt-2 text-right">
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            À régler maintenant : {formatCurrency(getPayableAmount())}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ÉTAPE 4: Paiement */}
              {currentStep === 4 && (
                <Card className="shadow-lg border-border/50 rounded-2xl overflow-hidden ring-1 ring-black/5 animate-fade-in">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold font-sans">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      Finalisation & Paiement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-10 pb-10">
                    <div className="text-center p-8 bg-card rounded-2xl border border-dashed border-primary/30 max-w-lg mx-auto">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calculator className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-medium text-muted-foreground mb-2">Montant des frais de dossier</h3>
                      <div className="text-4xl md:text-5xl font-black font-sans text-primary tracking-tight mb-4">
                        {formatCurrency(getPayableAmount())}
                      </div>
                      <p className="text-sm text-muted-foreground mb-8">
                        Le solde estimé de {formatCurrency(getSubtotal())} sera discuté lors de la consultation.
                      </p>

                      <div className="flex flex-wrap gap-2 justify-center mb-8">
                        <Badge variant="outline" className="px-4 py-1.5 text-sm">Paiement Mobile</Badge>
                        <Badge variant="outline" className="px-4 py-1.5 text-sm">Carte VISA</Badge>
                        <Badge variant="outline" className="px-4 py-1.5 text-sm text-primary border-primary">Sécurisé</Badge>
                      </div>

                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg h-14 rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-1"
                      >
                        {loading && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
                        {loading ? 'Connexion à CinetPay...' : 'Valider & Payer en ligne'}
                      </Button>

                      <p className="text-sm mt-6 text-muted-foreground leading-relaxed">
                        En cliquant sur ce bouton, notre interface de paiement certifiée (CinetPay)
                        s'ouvrira en toute sécurité.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          )}

          {/* Navigation Bar */}
          {!pageLoading && (
            <div className="flex justify-between items-center mt-10">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                disabled={currentStep === 1 || loading}
                className={`font-semibold bg-white border-2 border-border/60 shadow-sm ${currentStep === 1 ? 'opacity-0' : 'opacity-100'}`}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Étape précédente
              </Button>

              {currentStep < 4 && (
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="bg-foreground text-background font-bold shadow-md hover:scale-105 transition-transform"
                >
                  Continuer
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              )}
            </div>
          )}
        </div>
      </main>


    </div>
  );
};

export default QuoteRequest;
