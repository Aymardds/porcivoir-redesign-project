import { useEffect, useState } from "react";
import { farmService } from "@/services/farmService";
import { Farm, Animal, AnimalType, AnimalStatus } from "@/types/farm";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function HerdManagement({ farm }: { farm: Farm }) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [newType, setNewType] = useState<AnimalType>("truie");
  const [newStatus, setNewStatus] = useState<AnimalStatus>("croissance");
  const [newIdentifier, setNewIdentifier] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    loadAnimals();
  }, [farm.id]);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const data = await farmService.getFarmAnimals(farm.id);
      setAnimals(data);
    } catch (err: any) {
      toast.error(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAdding(true);
      const added = await farmService.addAnimal({
        farm_id: farm.id,
        type: newType,
        status: newStatus,
        identifier: newIdentifier || undefined,
        weight: newWeight ? parseFloat(newWeight) : undefined,
        notes: newNotes || undefined,
      });
      setAnimals([added, ...animals]);
      toast.success("Animal ajouté au troupeau");
      setNewIdentifier("");
      setNewWeight("");
      setNewNotes("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: AnimalStatus) => {
    try {
      const updated = await farmService.updateAnimal(id, { status });
      setAnimals(animals.map(a => a.id === id ? updated : a));
      toast.success("Statut mis à jour");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black">Gestion du Troupeau</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulaire d'ajout */}
        <div className="bg-secondary/20 p-5 rounded-2xl border border-border h-fit">
          <h4 className="font-bold mb-4">Ajouter un animal / lot</h4>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Type/Genre</label>
              <select className="w-full p-2.5 rounded-xl border border-border bg-white" value={newType} onChange={e => setNewType(e.target.value as AnimalType)}>
                <option value="truie">Truie (Femelle)</option>
                <option value="verrat">Verrat (Mâle)</option>
                <option value="porcelet">Porcelet</option>
                <option value="porc_charcutier">Porc Charcutier</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Statut Physiologique</label>
              <select className="w-full p-2.5 rounded-xl border border-border bg-white" value={newStatus} onChange={e => setNewStatus(e.target.value as AnimalStatus)}>
                <option value="au_lait">Au Lait (Allaitement)</option>
                <option value="croissance">En Croissance</option>
                <option value="reproduction">Reproduction / Gestation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Identifiant (Optionnel)</label>
              <input type="text" className="w-full p-2.5 rounded-xl border border-border" placeholder="Ex: Tag 102" value={newIdentifier} onChange={e => setNewIdentifier(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Poids Actuel (kg)</label>
              <input type="number" step="0.1" className="w-full p-2.5 rounded-xl border border-border" placeholder="Ex: 45.5" value={newWeight} onChange={e => setNewWeight(e.target.value)} />
            </div>
            <button disabled={isAdding} className="w-full py-2.5 bg-amber-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-amber-700">
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Ajouter
            </button>
          </form>
        </div>

        {/* Liste */}
        <div className="md:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="pb-3 font-semibold">Identifiant</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Statut</th>
                  <th className="pb-3 font-semibold">Poids (kg)</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {animals.map(animal => (
                  <tr key={animal.id} className="border-b border-border hover:bg-secondary/10">
                    <td className="py-3 font-medium">{animal.identifier || "N/A"}</td>
                    <td className="py-3 capitalize">{animal.type.replace('_', ' ')}</td>
                    <td className="py-3">
                      <select 
                        className="p-1.5 rounded-lg border border-border bg-white text-xs"
                        value={animal.status}
                        onChange={(e) => handleUpdateStatus(animal.id, e.target.value as AnimalStatus)}
                      >
                        <option value="au_lait">Au Lait</option>
                        <option value="croissance">Croissance</option>
                        <option value="reproduction">Reproduction</option>
                        <option value="vendu">Vendu</option>
                        <option value="decede">Décédé</option>
                      </select>
                    </td>
                    <td className="py-3">{animal.weight || "-"}</td>
                    <td className="py-3">
                      <button className="text-muted-foreground hover:text-amber-600"><Edit2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {animals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">Aucun animal dans le troupeau.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
