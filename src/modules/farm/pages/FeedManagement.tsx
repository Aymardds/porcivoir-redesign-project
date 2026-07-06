import { useEffect, useState } from "react";
import { farmService } from "@/services/farmService";
import { Farm, FeedInventory, FeedConsumption } from "@/types/farm";
import { Loader2, Plus, Wheat } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function FeedManagement({ farm }: { farm: Farm }) {
  const [inventory, setInventory] = useState<FeedInventory[]>([]);
  const [consumptions, setConsumptions] = useState<FeedConsumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false);

  // New Stock State
  const [newType, setNewType] = useState("Croissance");
  const [newQty, setNewQty] = useState("");

  // Consume State
  const [selectedInvId, setSelectedInvId] = useState("");
  const [consumeQty, setConsumeQty] = useState("");

  useEffect(() => {
    loadData();
  }, [farm.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, consData] = await Promise.all([
        farmService.getFeedInventory(farm.id),
        farmService.getFeedConsumptions(farm.id)
      ]);
      setInventory(invData);
      setConsumptions(consData);
      if (invData.length > 0) setSelectedInvId(invData[0].id);
    } catch (err: any) {
      toast.error(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAddingStock(true);
      // Check if type exists
      const existing = inventory.find(i => i.feed_type.toLowerCase() === newType.toLowerCase());
      if (existing) {
        const updated = await farmService.updateFeedInventory(existing.id, {
          quantity_kg: existing.quantity_kg + parseFloat(newQty),
          last_restock_date: new Date().toISOString()
        });
        setInventory(inventory.map(i => i.id === existing.id ? updated : i));
      } else {
        const added = await farmService.addFeedInventory({
          farm_id: farm.id,
          feed_type: newType,
          quantity_kg: parseFloat(newQty),
          last_restock_date: new Date().toISOString()
        });
        setInventory([added, ...inventory]);
        if (!selectedInvId) setSelectedInvId(added.id);
      }
      toast.success("Stock ajouté");
      setNewQty("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAddingStock(false);
    }
  };

  const handleConsume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvId) return;
    try {
      setIsConsuming(true);
      await farmService.addFeedConsumption({
        farm_id: farm.id,
        feed_inventory_id: selectedInvId,
        quantity_kg: parseFloat(consumeQty),
        consumption_date: new Date().toISOString(),
      });
      // reload inventory to get updated values
      await loadData();
      toast.success("Consommation enregistrée");
      setConsumeQty("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsConsuming(false);
    }
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" /></div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Wheat className="text-amber-600" />
        <h3 className="text-xl font-black">Gestion d'Aliment</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Approvisionnement */}
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
          <h4 className="font-bold text-emerald-800 mb-4">Approvisionner (Ajouter au stock)</h4>
          <form onSubmit={handleAddStock} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-emerald-800">Type d'aliment</label>
              <select className="w-full p-2.5 rounded-xl border border-emerald-200" value={newType} onChange={e => setNewType(e.target.value)}>
                <option value="Maternité">Maternité (Truies au lait)</option>
                <option value="Croissance">Croissance (Porcelets/Charcutiers)</option>
                <option value="Reproduction">Reproduction (Gestation/Verrats)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-emerald-800">Quantité (kg)</label>
              <input type="number" step="0.5" className="w-full p-2.5 rounded-xl border border-emerald-200" placeholder="Ex: 100" value={newQty} onChange={e => setNewQty(e.target.value)} required />
            </div>
            <button disabled={isAddingStock} className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-emerald-700 mt-2">
              {isAddingStock ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Ajouter au Stock
            </button>
          </form>
        </div>

        {/* Consommation */}
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl">
          <h4 className="font-bold text-amber-800 mb-4">Enregistrer une Consommation</h4>
          <form onSubmit={handleConsume} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-amber-800">Aliment consommé</label>
              <select className="w-full p-2.5 rounded-xl border border-amber-200" value={selectedInvId} onChange={e => setSelectedInvId(e.target.value)} required>
                {inventory.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.feed_type} (Reste: {inv.quantity_kg}kg)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-amber-800">Quantité consommée (kg)</label>
              <input type="number" step="0.5" max={inventory.find(i => i.id === selectedInvId)?.quantity_kg} className="w-full p-2.5 rounded-xl border border-amber-200" placeholder="Ex: 25" value={consumeQty} onChange={e => setConsumeQty(e.target.value)} required />
            </div>
            <button disabled={isConsuming || inventory.length === 0} className="w-full py-2.5 bg-amber-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-amber-700 mt-2">
              {isConsuming ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Soustraire du Stock
            </button>
          </form>
        </div>
      </div>

      <h4 className="font-bold mb-4">État des Stocks & Consommation</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {inventory.map(inv => {
          const totalConsumed = consumptions
            .filter(c => c.feed_inventory_id === inv.id)
            .reduce((sum, c) => sum + Number(c.quantity_kg), 0);

          return (
            <div key={inv.id} className="border border-border p-4 rounded-xl flex flex-col items-center text-center">
              <Wheat className="w-8 h-8 text-amber-600 mb-2 opacity-50" />
              <p className="font-bold text-lg">{inv.feed_type}</p>
              
              <div className="w-full flex justify-between items-center mt-3 mb-1 px-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Reste</p>
                  <p className="text-xl font-black text-amber-800">{inv.quantity_kg} <span className="text-[10px]">kg</span></p>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Consommé</p>
                  <p className="text-xl font-black text-rose-600">{totalConsumed} <span className="text-[10px]">kg</span></p>
                </div>
              </div>
              
              {inv.last_restock_date && (
                <p className="text-xs text-muted-foreground mt-3 bg-secondary px-3 py-1 rounded-full">
                  Dernier réappro: {format(new Date(inv.last_restock_date), "dd MMM yyyy", { locale: fr })}
                </p>
              )}
            </div>
          );
        })}
        {inventory.length === 0 && (
          <div className="col-span-3 text-center text-muted-foreground py-4 border border-dashed border-border rounded-xl">
            Aucun stock d'aliment enregistré.
          </div>
        )}
      </div>
    </div>
  );
}
