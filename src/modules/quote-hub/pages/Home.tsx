import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, FileText, Calculator, CreditCard, Shield, CheckCircle } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: FileText,
      title: 'Devis personnalisés',
      description: 'Obtenez des devis détaillés adaptés à vos projets agricoles spécifiques.',
    },
    {
      icon: Calculator,
      title: 'Calcul automatique',
      description: 'Prix calculés automatiquement avec application du taux fixe.',
    },
    {
      icon: CreditCard,
      title: 'Paiement sécurisé',
      description: 'Paiements en ligne via CinetPay en EUR, USD et FCFA.',
    },
    {
      icon: Shield,
      title: 'Suivi en temps réel',
      description: 'Suivez l\'état de vos demandes en temps réel.',
    },
  ];

  const services = [
    {
      icon: '🐷',
      title: 'Ferme porcine',
      description: 'Études de faisabilité et plans d\'aménagement pour élevage porcin.',
    },
    {
      icon: '🐔',
      title: 'Volaille',
      description: 'Solutions complètes pour l\'aviculture moderne.',
    },
    {
      icon: '🌱',
      title: 'Production végétale',
      description: 'Conseil technique pour optimiser vos rendements agricoles.',
    },
    {
      icon: '📊',
      title: 'Plans d\'affaires',
      description: 'Business plans détaillés pour vos projets agricoles.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Sprout className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Devis Agricoles
              <br />
              <span className="text-primary-light">Professionnels</span>
            </h1>
            
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Obtenez des devis personnalisés pour vos projets agricoles en Côte d'Ivoire. 
              Fermes porcines, aviculture, production végétale et plans d'affaires.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Link to="/quote">
                  Demander un devis
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="#services">
                  Nos services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pourquoi choisir AgriQuote Pro ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une plateforme moderne et sécurisée pour tous vos besoins en devis agricoles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-card hover:shadow-hover transition-all duration-300 bg-gradient-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nos domaines d'expertise
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des solutions complètes pour tous vos projets agricoles en Côte d'Ivoire.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="border-0 shadow-card hover:shadow-hover transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild className="bg-gradient-primary border-0">
              <Link to="/quote">
                Commencer votre devis
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un processus simple en 4 étapes pour obtenir votre devis personnalisé.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Vos informations',
                description: 'Renseignez vos coordonnées et localisation.',
              },
              {
                step: '02',
                title: 'Choix des services',
                description: 'Sélectionnez les services qui vous intéressent.',
              },
              {
                step: '03',
                title: 'Aperçu du devis',
                description: 'Vérifiez le résumé et le montant total.',
              },
              {
                step: '04',
                title: 'Paiement sécurisé',
                description: 'Payez en ligne et recevez votre devis détaillé.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-primary to-transparent -translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Prêt à développer votre projet agricole ?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Obtenez un devis personnalisé en quelques minutes et donnez vie à vos ambitions agricoles.
          </p>
          <Button 
            size="lg" 
            asChild
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link to="/quote">
              Commencer maintenant
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;