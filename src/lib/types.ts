export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export interface Product {
  id: string;
  category_id: string;
  title: string;
  description: string;
  images: string[];
  is_digital: boolean;
  estimated_minutes: number;
}

export interface Material {
  id: string;
  name: string;
  unit_measure: string;
  unit_cost: number;
  waste_percentage: number;
}

export interface ProductMaterial {
  product_id: string;
  material_id: string;
  quantity: number;
}

export interface QuoteSettings {
  hourly_rate: number;
  indirect_cost_percentage: number;
  default_profit_margin: number;
  included_revisions: number;
  extra_revision_fee: number;
  express_surcharge: number;
  urgent_surcharge: number;
  local_delivery_fee: number;
  national_shipping_fee: number;
}

export type QuoteStatus = 
  | 'pendiente'
  | 'boceto_enviado'
  | 'anticipo_recibido'
  | 'en_produccion'
  | 'listo_entrega'
  | 'cancelado';

export interface Quote {
  id: string;
  folio?: number;
  client_name: string;
  client_phone: string;
  event_date: string;
  delivery_type: 'taller' | 'local' | 'nacional';
  urgency_level: 'normal' | 'express' | 'urgente';
  payment_method: 'efectivo' | 'transferencia' | 'tarjeta';
  total_amount: number;
  deposit_amount: number;
  status: QuoteStatus;
  included_revisions: number;
  extra_revisions_count: number;
  extra_revisions_cost: number;
  notes?: string;
  payment_receipt_url?: string;
  created_at?: string;
  product_title?: string; // Título del producto cotizado (para UI y listados)
  quantity?: number; // Cantidad cotizada
}
