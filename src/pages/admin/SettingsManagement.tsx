import { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { Settings, Save, Building, Mail, Phone, Calculator, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SettingsManagement() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('app_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des paramètres');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => {
      const exists = prev.find(s => s.setting_key === key);
      if (exists) {
        return prev.map(s => s.setting_key === key ? { ...s, setting_value: value } : s);
      }
      return [...prev, { setting_key: key, setting_value: value }];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert each setting
      const promises = settings.map(s => 
        supabaseAdmin
          .from('app_settings')
          .upsert({ 
            setting_key: s.setting_key, 
            setting_value: s.setting_value 
          }, { onConflict: 'setting_key' })
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) throw errors[0].error;

      toast.success('Paramètres enregistrés avec succès');
    } catch (err: any) {
      toast.error('Erreur lors de l\'enregistrement');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getSetting = (key: string) => settings.find(s => s.setting_key === key)?.setting_value || '';

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement des paramètres...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Paramètres Généraux
          </h1>
          <p className="text-muted-foreground mt-1">
            Configurez les informations de l'entreprise et les frais de service.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white font-bold">
          {saving ? 'Enregistrement...' : <> <Save className="w-4 h-4 mr-2" /> Enregistrer les modifications </>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company Settings */}
        <Card className="shadow-lg border-border/50">
          <CardHeader className="bg-secondary/20">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="w-5 h-5 text-primary" />
              Informations de l'Entreprise
            </CardTitle>
            <CardDescription>Détails affichés sur les devis et reçus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nom de l'entreprise</Label>
              <Input 
                id="company_name" 
                value={getSetting('company_name')} 
                onChange={(e) => updateSetting('company_name', e.target.value)}
                placeholder="Porc'Ivoire Agri"
                className="bg-secondary/30 border-transparent focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_email">Email professionnel</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="company_email" 
                  value={getSetting('company_email')} 
                  onChange={(e) => updateSetting('company_email', e.target.value)}
                  placeholder="contact@porcivoire.ci"
                  className="pl-9 bg-secondary/30 border-transparent focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_phone">Téléphone client</Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="company_phone" 
                  value={getSetting('company_phone')} 
                  onChange={(e) => updateSetting('company_phone', e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  className="pl-9 bg-secondary/30 border-transparent focus:border-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Settings */}
        <Card className="shadow-lg border-border/50">
          <CardHeader className="bg-secondary/20">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5 text-primary" />
              Politique Tarifaire des Devis
            </CardTitle>
            <CardDescription>Gestion des frais administratifs fixes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
             <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary rounded-lg text-white">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Montant Fixe du Devis</h3>
                    <p className="text-xs text-muted-foreground leading-tight">
                      Frais forfaitaires appliqués à chaque demande de devis, payables avant consultation.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="quote_fixed_fee" className="text-primary font-black uppercase text-xs tracking-wider">Frais de dossier (FCFA)</Label>
                  <Input 
                    id="quote_fixed_fee" 
                    type="number"
                    value={getSetting('quote_fixed_fee')} 
                    onChange={(e) => updateSetting('quote_fixed_fee', e.target.value)}
                    className="text-2xl font-black h-14 bg-white border-primary shadow-sm focus-visible:ring-primary"
                  />
                </div>
             </div>

             <div className="space-y-2 opacity-50 pointer-events-none">
                <Label htmlFor="fixed_rate_percentage">Ancien Taux (%) - Obsolète</Label>
                <Input 
                  id="fixed_rate_percentage" 
                  value={getSetting('fixed_rate_percentage')} 
                  onChange={(e) => updateSetting('fixed_rate_percentage', e.target.value)}
                  className="bg-secondary/30"
                />
             </div>
          </CardContent>
        </Card>

        {/* Security / System Info */}
        <Card className="shadow-lg border-border/50 lg:col-span-2">
           <CardContent className="py-4 px-6 flex items-center justify-between bg-primary/5 border-t-2 border-primary">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <p className="text-sm text-foreground">
                  Les modifications sont appliquées instantanément aux futurs devis générés sur le site.
                </p>
              </div>
              <p className="text-xs font-mono text-muted-foreground uppercase">ID Système: AGRI_V3_SECURE</p>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
