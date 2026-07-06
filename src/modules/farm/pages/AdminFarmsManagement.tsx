import { useEffect, useState } from "react";
import { farmService } from "@/services/farmService";
import { Loader2, Beef, Users, MapPin } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminFarmsManagement() {
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllFarms();
  }, []);

  const loadAllFarms = async () => {
    try {
      setLoading(true);
      const data = await farmService.getAllFarms();
      setFarms(data);
    } catch (err: any) {
      toast.error("Erreur chargement des fermes : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-foreground">Gestion des Fermes (Clients)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Supervisez l'ensemble des cheptels gérés par vos clients éleveurs.
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-black text-sm">
          {farms.length} Fermes enregistrées
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => (
          <div key={farm.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Beef className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                {format(new Date(farm.created_at), "MMM yyyy", { locale: fr })}
              </span>
            </div>

            <h3 className="text-lg font-black text-foreground mb-1">{farm.name}</h3>
            
            <div className="space-y-2 mt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">
                  {farm.owner?.first_name} {farm.owner?.last_name}
                </span>
              </div>
              
              {farm.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{farm.location}</span>
                </div>
              )}
            </div>
            
            <div className="mt-5 pt-4 border-t border-border flex justify-between items-center">
              <button 
                className="text-xs font-bold text-primary hover:underline"
                onClick={() => toast.info("Cette fonctionnalité de vue détaillée arrivera bientôt !")}
              >
                Voir les détails du cheptel
              </button>
            </div>
          </div>
        ))}

        {farms.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded-2xl bg-secondary/5">
            <Beef className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Aucune ferme cliente n'est enregistrée pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
