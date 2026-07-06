import { useEffect, useState } from "react";
import { farmService } from "@/services/farmService";
import { Farm, LivestockSale, Animal } from "@/types/farm";
import { Loader2, Plus, Coins } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function LivestockSales({ farm }: { farm: Farm }) {
  const [sales, setSales] = useState<LivestockSale[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]); // To list available for sale
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [animalId, setAnimalId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [buyer, setBuyer] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadData();
  }, [farm.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, animData] = await Promise.all([
        farmService.getLivestockSales(farm.id),
        farmService.getFarmAnimals(farm.id)
      ]);
      setSales(salesData);
      setAnimals(animData.filter(a => a.status !== 'vendu' && a.status !== 'decede'));
    } catch (err: any) {
      toast.error(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalId) return;
    try {
      setIsAdding(true);
      const added = await farmService.addLivestockSale({
        farm_id: farm.id,
        animal_id: animalId,
        sale_date: date,
        price: parseFloat(price),
        weight_at_sale: weight ? parseFloat(weight) : undefined,
        buyer_info: buyer || undefined,
        notes: notes || undefined,
      });
      // The animal is now marked as sold by the service
      // Reload animals to remove the sold one from the select options
      await loadData();
      toast.success("Vente enregistrée avec succès");
      
      setAnimalId("");
      setPrice("");
      setWeight("");
      setBuyer("");
      setNotes("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" /></div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Coins className="text-amber-600" />
        <h3 className="text-xl font-black">Ventes de Sujets</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 h-fit">
          <h4 className="font-bold mb-4 text-amber-900">Enregistrer une Vente</h4>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-amber-800">Sujet à vendre</label>
              <select className="w-full p-2.5 rounded-xl border border-amber-200 bg-white" value={animalId} onChange={e => setAnimalId(e.target.value)} required>
                <option value="" disabled>Sélectionner un animal...</option>
                {animals.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.type} {a.identifier ? `(${a.identifier})` : ""} - {a.weight || '?'} kg
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-amber-800">Date de vente</label>
              <input type="date" className="w-full p-2.5 rounded-xl border border-amber-200" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-amber-800">Prix (FCFA)</label>
                <input type="number" className="w-full p-2.5 rounded-xl border border-amber-200" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-amber-800">Poids (kg)</label>
                <input type="number" step="0.5" className="w-full p-2.5 rounded-xl border border-amber-200" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-amber-800">Acheteur (Optionnel)</label>
              <input type="text" className="w-full p-2.5 rounded-xl border border-amber-200" value={buyer} onChange={e => setBuyer(e.target.value)} />
            </div>
            <button disabled={isAdding || !animalId} className="w-full py-2.5 bg-amber-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-amber-700 mt-2">
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Valider la vente
            </button>
          </form>
        </div>

        {/* Historique */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold">Historique des ventes</h4>
            <div className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
              Total: {sales.reduce((acc, s) => acc + Number(s.price), 0).toLocaleString("fr-FR")} FCFA
            </div>
          </div>
          
          <div className="space-y-3">
            {sales.map((sale: any) => (
              <div key={sale.id} className="border border-border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-sm uppercase">
                      {sale.animal?.type || "Animal supprimé"}
                      {sale.animal?.identifier ? ` - ${sale.animal.identifier}` : ""}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase">Vendu</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Le {format(new Date(sale.sale_date), "d MMMM yyyy", { locale: fr })}
                    {sale.buyer_info && ` • Acheteur: ${sale.buyer_info}`}
                  </p>
                  {sale.weight_at_sale && <p className="text-xs font-semibold text-muted-foreground">Poids enregistré: {sale.weight_at_sale} kg</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-2xl text-foreground">{sale.price.toLocaleString("fr-FR")} <span className="text-sm text-muted-foreground">FCFA</span></p>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-xl">
                Aucune vente enregistrée.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
