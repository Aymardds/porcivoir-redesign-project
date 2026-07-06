import { useEffect, useState } from "react";
import { farmService } from "@/services/farmService";
import { Farm, Animal, FeedInventory } from "@/types/farm";
import { Loader2, Plus, Beef, Activity, Wheat, Coins } from "lucide-react";
import { toast } from "sonner";
import HerdManagement from "./HerdManagement";
import FeedManagement from "./FeedManagement";
import VeterinaryCare from "./VeterinaryCare";
import LivestockSales from "./LivestockSales";

export default function CustomerFarmDashboard() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarm, setActiveFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard Sub-tabs
  const [farmTab, setFarmTab] = useState<"overview" | "herd" | "feed" | "vet" | "sales">("overview");

  // Farm Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newFarmName, setNewFarmName] = useState("");
  const [newFarmLocation, setNewFarmLocation] = useState("");

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const userFarms = await farmService.getMyFarms();
      setFarms(userFarms);
      if (userFarms.length > 0) {
        setActiveFarm(userFarms[0]);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de chargement des fermes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName) return;
    try {
      setIsCreating(true);
      const created = await farmService.createFarm({
        name: newFarmName,
        location: newFarmLocation,
      });
      toast.success("Ferme créée avec succès !");
      setFarms([created, ...farms]);
      setActiveFarm(created);
      setNewFarmName("");
      setNewFarmLocation("");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Si pas de ferme, afficher le composant de création
  if (farms.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Beef className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-black mb-2">Bienvenue dans votre espace Élevage</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Créez votre première ferme pour commencer à gérer votre troupeau, vos stocks d'aliments et le suivi vétérinaire.
        </p>

        <form onSubmit={handleCreateFarm} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-semibold mb-1">Nom de la ferme</label>
            <input 
              type="text" 
              className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Ex: Ferme Porcivoire 1"
              value={newFarmName}
              onChange={(e) => setNewFarmName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Localisation</label>
            <input 
              type="text" 
              className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Ex: Abidjan, Anyama"
              value={newFarmLocation}
              onChange={(e) => setNewFarmLocation(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={isCreating || !newFarmName}
            className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-700 disabled:opacity-50"
          >
            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Créer ma ferme
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Farm Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-500 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Beef className="w-6 h-6" /> {activeFarm?.name}
          </h2>
          {activeFarm?.location && (
            <p className="text-amber-100 mt-1 flex items-center gap-1 text-sm">
              📍 {activeFarm.location}
            </p>
          )}
        </div>
        
        {/* Farm selector if multiple */}
        {farms.length > 1 && (
          <select 
            className="bg-white/20 border border-white/30 text-white rounded-xl p-2 outline-none"
            value={activeFarm?.id}
            onChange={(e) => setActiveFarm(farms.find(f => f.id === e.target.value) || null)}
          >
            {farms.map(f => (
              <option key={f.id} value={f.id} className="text-black">{f.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Farm Navigation */}
      <div className="flex overflow-x-auto gap-2 bg-card border border-border p-2 rounded-2xl">
        {[
          { id: "overview", label: "Vue d'ensemble", icon: Activity },
          { id: "herd", label: "Troupeau", icon: Beef },
          { id: "feed", label: "Alimentation", icon: Wheat },
          { id: "vet", label: "Santé", icon: Plus },
          { id: "sales", label: "Ventes", icon: Coins },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setFarmTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                farmTab === t.id ? "bg-amber-100 text-amber-800" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        {farmTab === "overview" && <FarmOverview farm={activeFarm!} />}
        {farmTab === "herd" && <HerdManagement farm={activeFarm!} />}
        {farmTab === "feed" && <FeedManagement farm={activeFarm!} />}
        {farmTab === "vet" && <VeterinaryCare farm={activeFarm!} />}
        {farmTab === "sales" && <LivestockSales farm={activeFarm!} />}
      </div>
    </div>
  );
}

// ─── Overview Subcomponent ───
function FarmOverview({ farm }: { farm: Farm }) {
  const [stats, setStats] = useState({ total: 0, truies: 0, verrats: 0, porcelets: 0, charcutiers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [farm.id]);

  const loadStats = async () => {
    try {
      const animals = await farmService.getFarmAnimals(farm.id);
      const alive = animals.filter(a => a.status !== 'vendu' && a.status !== 'decede');
      
      setStats({
        total: alive.length,
        truies: alive.filter(a => a.type === 'truie').length,
        verrats: alive.filter(a => a.type === 'verrat').length,
        porcelets: alive.filter(a => a.type === 'porcelet').length,
        charcutiers: alive.filter(a => a.type === 'porc_charcutier').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" /></div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black mb-4">Statistiques du Cheptel Actif</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
          <p className="text-xs text-amber-600 font-bold uppercase mb-1">Total</p>
          <p className="text-3xl font-black text-amber-800">{stats.total}</p>
        </div>
        <div className="bg-secondary/20 p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Truies</p>
          <p className="text-2xl font-black text-foreground">{stats.truies}</p>
        </div>
        <div className="bg-secondary/20 p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Verrats</p>
          <p className="text-2xl font-black text-foreground">{stats.verrats}</p>
        </div>
        <div className="bg-secondary/20 p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Porcelets</p>
          <p className="text-2xl font-black text-foreground">{stats.porcelets}</p>
        </div>
        <div className="bg-secondary/20 p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Charcutiers</p>
          <p className="text-2xl font-black text-foreground">{stats.charcutiers}</p>
        </div>
      </div>
    </div>
  );
}
