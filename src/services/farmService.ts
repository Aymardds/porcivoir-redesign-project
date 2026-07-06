import { supabase } from '@/lib/supabase';
import { Farm, Animal, FeedInventory, FeedConsumption, VeterinaryRecord, LivestockSale } from '@/types/farm';

export const farmService = {
  // Farms
  async getMyFarms(): Promise<Farm[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createFarm(farmData: Partial<Farm>): Promise<Farm> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('farms')
      .insert([{ ...farmData, owner_id: session.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Animals
  async getFarmAnimals(farmId: string): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addAnimal(animalData: Partial<Animal>): Promise<Animal> {
    const { data, error } = await supabase
      .from('animals')
      .insert([animalData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAnimal(id: string, updates: Partial<Animal>): Promise<Animal> {
    const { data, error } = await supabase
      .from('animals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Feed Inventory
  async getFeedInventory(farmId: string): Promise<FeedInventory[]> {
    const { data, error } = await supabase
      .from('feed_inventory')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addFeedInventory(feedData: Partial<FeedInventory>): Promise<FeedInventory> {
    const { data, error } = await supabase
      .from('feed_inventory')
      .insert([feedData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFeedInventory(id: string, updates: Partial<FeedInventory>): Promise<FeedInventory> {
    const { data, error } = await supabase
      .from('feed_inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFeedConsumptions(farmId: string): Promise<FeedConsumption[]> {
    const { data, error } = await supabase
      .from('feed_consumptions')
      .select('*')
      .eq('farm_id', farmId);

    if (error) throw error;
    return data || [];
  },

  async addFeedConsumption(consumptionData: Partial<FeedConsumption>): Promise<FeedConsumption> {
    // We should do this in a transaction or update inventory separately
    const { data, error } = await supabase
      .from('feed_consumptions')
      .insert([consumptionData])
      .select()
      .single();

    if (error) throw error;

    // Deduct from inventory
    if (consumptionData.feed_inventory_id && consumptionData.quantity_kg) {
      // get current stock
      const { data: inv } = await supabase.from('feed_inventory').select('quantity_kg').eq('id', consumptionData.feed_inventory_id).single();
      if (inv) {
        await supabase.from('feed_inventory').update({ quantity_kg: inv.quantity_kg - consumptionData.quantity_kg }).eq('id', consumptionData.feed_inventory_id);
      }
    }

    return data;
  },

  // Veterinary Records
  async getVeterinaryRecords(farmId: string): Promise<VeterinaryRecord[]> {
    const { data, error } = await supabase
      .from('veterinary_records')
      .select('*')
      .eq('farm_id', farmId)
      .order('treatment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addVeterinaryRecord(recordData: Partial<VeterinaryRecord>): Promise<VeterinaryRecord> {
    const { data, error } = await supabase
      .from('veterinary_records')
      .insert([recordData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Livestock Sales
  async getLivestockSales(farmId: string): Promise<LivestockSale[]> {
    const { data, error } = await supabase
      .from('livestock_sales')
      .select(`
        *,
        animal:animals(identifier, type)
      `)
      .eq('farm_id', farmId)
      .order('sale_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addLivestockSale(saleData: Partial<LivestockSale>): Promise<LivestockSale> {
    const { data, error } = await supabase
      .from('livestock_sales')
      .insert([saleData])
      .select()
      .single();

    if (error) throw error;

    // Automatically mark the animal as sold
    if (saleData.animal_id) {
      await supabase.from('animals').update({ status: 'vendu' }).eq('id', saleData.animal_id);
    }

    return data;
  },
  
  // Admin functions
  async getAllFarms(): Promise<(Farm & { owner: { first_name: string, last_name: string } })[]> {
    const { data, error } = await supabase
      .from('farms')
      .select(`
        *,
        owner:profiles(first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
