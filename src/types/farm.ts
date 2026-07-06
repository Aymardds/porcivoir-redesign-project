export type AnimalType = 'truie' | 'verrat' | 'porcelet' | 'porc_charcutier';
export type AnimalStatus = 'au_lait' | 'croissance' | 'reproduction' | 'vendu' | 'decede';

export interface Farm {
  id: string;
  owner_id: string;
  name: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Animal {
  id: string;
  farm_id: string;
  type: AnimalType;
  status: AnimalStatus;
  identifier?: string;
  birth_date?: string;
  weight?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedInventory {
  id: string;
  farm_id: string;
  feed_type: string;
  quantity_kg: number;
  last_restock_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedConsumption {
  id: string;
  farm_id: string;
  feed_inventory_id: string;
  quantity_kg: number;
  consumption_date: string;
  notes?: string;
  created_at: string;
}

export interface VeterinaryRecord {
  id: string;
  farm_id: string;
  animal_id?: string;
  treatment_date: string;
  treatment_type: string;
  description?: string;
  cost?: number;
  veterinarian_name?: string;
  created_at: string;
}

export interface LivestockSale {
  id: string;
  farm_id: string;
  animal_id: string;
  sale_date: string;
  buyer_info?: string;
  price: number;
  weight_at_sale?: number;
  notes?: string;
  created_at: string;
}
