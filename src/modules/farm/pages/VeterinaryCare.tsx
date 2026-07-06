import { useEffect, useState } from "react";
import { farmService } from "@/services/farmService";
import { Farm, VeterinaryRecord, Animal } from "@/types/farm";
import { Loader2, Plus, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function VeterinaryCare({ farm }: { farm: Farm }) {
  const [records, setRecords] = useState<VeterinaryRecord[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState("Vaccination");
  const [desc, setDesc] = useState("");
  const [animalId, setAnimalId] = useState("");
  const [cost, setCost] = useState("");

  useEffect(() => {
    loadData();
  }, [farm.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recData, animData] = await Promise.all([
        farmService.getVeterinaryRecords(farm.id),
        farmService.getFarmAnimals(farm.id)
      ]);
      setRecords(recData);
      setAnimals(animData);
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
      const added = await farmService.addVeterinaryRecord({
        farm_id: farm.id,
        treatment_date: date,
        treatment_type: type,
        description: desc || undefined,
        animal_id: animalId || undefined,
        cost: cost ? parseFloat(cost) : undefined,
      });
      setRecords([added, ...records]);
      toast.success("Soin enregistré");
      setDesc("");
      setCost("");
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
        <Stethoscope className="text-amber-600" />
        <h3 className="text-xl font-black">Soins Vétérinaires</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="bg-secondary/20 p-5 rounded-2xl border border-border h-fit">
          <h4 className="font-bold mb-4">Enregistrer une intervention</h4>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Date</label>
              <input type="date" className="w-full p-2.5 rounded-xl border border-border" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Type d'intervention</label>
              <select className="w-full p-2.5 rounded-xl border border-border bg-white" value={type} onChange={e => setType(e.target.value)}>
                <option value="Vaccination">Vaccination</option>
                <option value="Déparasitage">Déparasitage</option>
                <option value="Traitement Maladie">Traitement Maladie</option>
                <option value="Soin Blessure">Soin Blessure</option>
                <option value="Visite de Routine">Visite de Routine (Groupe)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Animal concerné (Optionnel)</label>
              <select className="w-full p-2.5 rounded-xl border border-border bg-white" value={animalId} onChange={e => setAnimalId(e.target.value)}>
                <option value="">Tout le troupeau / Lot</option>
                {animals.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.identifier ? `Tag: ${a.identifier}` : `Animal: ${a.type}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Coût (FCFA)</label>
              <input type="number" className="w-full p-2.5 rounded-xl border border-border" placeholder="Ex: 5000" value={cost} onChange={e => setCost(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Notes / Description</label>
              <textarea className="w-full p-2.5 rounded-xl border border-border text-sm" rows={2} value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <button disabled={isAdding} className="w-full py-2.5 bg-amber-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-amber-700">
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Enregistrer
            </button>
          </form>
        </div>

        {/* Historique */}
        <div className="md:col-span-2">
          <h4 className="font-bold mb-4">Historique des soins</h4>
          <div className="space-y-3">
            {records.map(rec => {
              const animal = animals.find(a => a.id === rec.animal_id);
              return (
                <div key={rec.id} className="border border-border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-sm">{rec.treatment_type}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase">
                        {animal ? (animal.identifier || animal.type) : "Troupeau entier"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {format(new Date(rec.treatment_date), "d MMMM yyyy", { locale: fr })}
                    </p>
                    {rec.description && <p className="text-sm">{rec.description}</p>}
                  </div>
                  {rec.cost ? (
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-primary">{rec.cost.toLocaleString("fr-FR")} FCFA</p>
                    </div>
                  ) : null}
                </div>
              )
            })}
            {records.length === 0 && (
              <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-xl">
                Aucun soin enregistré pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
