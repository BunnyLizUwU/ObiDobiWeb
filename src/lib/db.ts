import { supabase, isSupabaseConfigured } from './supabase';
import { Category, Product, Material, QuoteSettings, Quote, QuoteStatus } from './types';

// ==========================================
// MOCK FALLBACK DATA
// ==========================================

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Invitaciones Digitales', slug: 'invitaciones-digitales', description: 'Invitaciones interactivas para bodas, XV años, cumpleaños y eventos corporativos con RSVP, GPS y cuenta regresiva.' },
  { id: 'cat-2', name: 'Totebags Sublimadas', slug: 'tote-bags', description: 'Bolsas de tela canvas ecológicas y duraderas con diseños personalizados y sublimación premium.' },
  { id: 'cat-3', name: 'Stickers Personalizados', slug: 'stickers', description: 'Pegatinas de alta calidad con cortes precisos en diferentes acabados: brillante, mate y holográfico.' },
  { id: 'cat-4', name: 'Llaveros de Resina', slug: 'llaveros-resina', description: 'Accesorios de resina epóxica hechos a mano, personalizados con flores secas, glitter y letras de colores.' }
];

const mockProducts: Product[] = [
  { id: 'prod-1', category_id: 'cat-1', title: 'Invitación Digital Interactiva Premium', description: 'Invitación interactiva para dispositivos móviles. Incluye cuenta regresiva, confirmación automática de asistencia por WhatsApp, ubicación con Google Maps, enlaces a mesa de regalos y galería de fotos.', images: ['/placeholder_invitacion.png'], is_digital: true, estimated_minutes: 180 },
  { id: 'prod-2', category_id: 'cat-2', title: 'Tote Bag Canvas Personalizada', description: 'Bolsa de tela de algodón (canvas) resistente con impresión de alta calidad mediante técnica de sublimación. Medidas estándar 35x40cm.', images: ['/placeholder_totebag.png'], is_digital: false, estimated_minutes: 45 },
  { id: 'prod-3', category_id: 'cat-3', title: 'Planilla de Stickers Custom (A4)', description: 'Planilla tamaño A4 de stickers personalizados troquelados con la forma de tu diseño. Ideales para termos, laptops, packaging o decoración.', images: ['/placeholder_stickers.png'], is_digital: false, estimated_minutes: 30 },
  { id: 'prod-4', category_id: 'cat-4', title: 'Llavero de Letra de Resina Floral', description: 'Llavero en forma de inicial hecho de resina epóxica transparente con incrustaciones de flores secas naturales, hoja de oro/plata y herraje de alta calidad.', images: ['/placeholder_llavero.png'], is_digital: false, estimated_minutes: 60 }
];

const mockMaterials: Material[] = [
  { id: 'mat-1', name: 'Resina Epóxica A+B', unit_measure: 'g', unit_cost: 0.45, waste_percentage: 5.00 },
  { id: 'mat-2', name: 'Molde y Herraje de Llavero', unit_measure: 'pza', unit_cost: 15.00, waste_percentage: 2.00 },
  { id: 'mat-3', name: 'Glitter y Decoraciones', unit_measure: 'g', unit_cost: 1.20, waste_percentage: 10.00 },
  { id: 'mat-4', name: 'Bolsa Tote Bag Canvas Lisa', unit_measure: 'pza', unit_cost: 32.00, waste_percentage: 0.00 },
  { id: 'mat-5', name: 'Hoja de Transfer / Sublimación A4', unit_measure: 'pza', unit_cost: 8.50, waste_percentage: 10.00 },
  { id: 'mat-6', name: 'Vinilo Adhesivo Holográfico A4', unit_measure: 'pza', unit_cost: 18.00, waste_percentage: 15.00 },
  { id: 'mat-7', name: 'Papel Fotográfico Autoadhesivo A4', unit_measure: 'pza', unit_cost: 6.00, waste_percentage: 8.00 },
  { id: 'mat-8', name: 'Hospedaje Digital Invitación (por año)', unit_measure: 'pza', unit_cost: 50.00, waste_percentage: 0.00 }
];

// Mapeo de insumos
const mockProductMaterialsRecord: Record<string, { materialId: string; quantity: number }[]> = {
  'prod-1': [{ materialId: 'mat-8', quantity: 1 }],
  'prod-2': [{ materialId: 'mat-4', quantity: 1 }, { materialId: 'mat-5', quantity: 1 }],
  'prod-3': [{ materialId: 'mat-7', quantity: 1 }],
  'prod-4': [{ materialId: 'mat-1', quantity: 30 }, { materialId: 'mat-2', quantity: 1 }, { materialId: 'mat-3', quantity: 2 }]
};

const mockSettings: QuoteSettings = {
  hourly_rate: 120.00,
  indirect_cost_percentage: 15.00,
  default_profit_margin: 40.00,
  included_revisions: 2,
  extra_revision_fee: 50.00,
  express_surcharge: 25.00,
  urgent_surcharge: 50.00,
  local_delivery_fee: 40.00,
  national_shipping_fee: 180.00
};

// ==========================================
// DB SERVICE METHODS WITH LOCAL FALLBACK
// ==========================================

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('categories').select('*');
    if (!error && data) return data as Category[];
    console.warn('Error fetching categories from Supabase, using mock:', error);
  }
  return mockCategories;
}

export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) return data as Product[];
    console.warn('Error fetching products from Supabase, using mock:', error);
  }
  return mockProducts;
}

export async function getMaterials(): Promise<Material[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('materials').select('*');
    if (!error && data) return data as Material[];
    console.warn('Error fetching materials from Supabase, using mock:', error);
  }
  return mockMaterials;
}

export async function getProductMaterials(productId: string): Promise<{ material: Material; quantityUsed: number }[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('product_materials')
      .select('quantity, materials (*)')
      .eq('product_id', productId);

    if (!error && data) {
      return data.map((item: any) => ({
        material: item.materials as Material,
        quantityUsed: Number(item.quantity)
      }));
    }
    console.warn('Error fetching product materials from Supabase, using mock:', error);
  }

  // Fallback
  const relations = mockProductMaterialsRecord[productId] || [];
  return relations.map(rel => {
    const mat = mockMaterials.find(m => m.id === rel.materialId)!;
    return { material: mat, quantityUsed: rel.quantity };
  });
}

export async function getQuoteSettings(): Promise<QuoteSettings> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('quote_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (!error && data) return data as QuoteSettings;
    console.warn('Error fetching quote settings from Supabase, using mock:', error);
  }
  return mockSettings;
}

// Helpers para LocalStorage (Quotes)
const LOCAL_QUOTES_KEY = 'obidobi_local_quotes';

function getLocalQuotes(): Quote[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_QUOTES_KEY);
  if (!stored) {
    // Si está vacío, sembramos algunas cotizaciones demo para la bandeja del admin
    const initialQuotes: Quote[] = [
      {
        id: 'q-demo-1',
        folio: 1001,
        client_name: 'María Alejandra Hernández',
        client_phone: '4171234567',
        event_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 días en el futuro
        delivery_type: 'local',
        urgency_level: 'normal',
        payment_method: 'transferencia',
        total_amount: 320.00,
        deposit_amount: 160.00,
        status: 'pendiente',
        included_revisions: 2,
        extra_revisions_count: 0,
        extra_revisions_cost: 0,
        notes: 'Desea diseño de flores silvestres amarillas y lilas.',
        created_at: new Date().toISOString(),
        product_title: 'Llavero de Letra de Resina Floral',
        quantity: 5
      },
      {
        id: 'q-demo-2',
        folio: 1002,
        client_name: 'Juan Carlos Pérez',
        client_phone: '4179876543',
        event_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
        delivery_type: 'taller',
        urgency_level: 'urgente',
        payment_method: 'efectivo',
        total_amount: 650.00,
        deposit_amount: 325.00,
        status: 'anticipo_recibido',
        included_revisions: 2,
        extra_revisions_count: 1,
        extra_revisions_cost: 50,
        notes: 'ENTREGA URGENTE. Sublimado con logotipo de su empresa.',
        created_at: new Date().toISOString(),
        product_title: 'Tote Bag Canvas Personalizada',
        quantity: 10
      },
      {
        id: 'q-demo-3',
        folio: 1003,
        client_name: 'Debanhi Silva',
        client_phone: '4171112233',
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        delivery_type: 'nacional',
        urgency_level: 'normal',
        payment_method: 'tarjeta',
        total_amount: 1250.00,
        deposit_amount: 625.00,
        status: 'listo_entrega',
        included_revisions: 2,
        extra_revisions_count: 0,
        extra_revisions_cost: 0,
        notes: 'Invitación de bodas, requiere hospedaje premium.',
        created_at: new Date().toISOString(),
        product_title: 'Invitación Digital Interactiva Premium',
        quantity: 1
      }
    ];
    localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify(initialQuotes));
    return initialQuotes;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalQuotes(quotes: Quote[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify(quotes));
  }
}

export async function createQuote(quote: Omit<Quote, 'id' | 'folio' | 'created_at'>): Promise<Quote> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('quotes')
      .insert([quote])
      .select()
      .single();

    if (!error && data) return data as Quote;
    console.error('Error inserting quote to Supabase:', error);
  }

  // Fallback a localStorage
  const quotes = getLocalQuotes();
  const nextFolio = quotes.length > 0 ? Math.max(...quotes.map(q => q.folio || 1000)) + 1 : 1001;
  const newQuote: Quote = {
    ...quote,
    id: 'q-' + Math.random().toString(36).substr(2, 9),
    folio: nextFolio,
    created_at: new Date().toISOString()
  };
  quotes.push(newQuote);
  saveLocalQuotes(quotes);
  return newQuote;
}

export async function getQuotes(): Promise<Quote[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) return data as Quote[];
    console.warn('Error fetching quotes from Supabase, using mock:', error);
  }
  return getLocalQuotes();
}

export async function updateQuoteStatus(quoteId: string, status: QuoteStatus): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', quoteId);
    if (!error) return true;
    console.error('Error updating quote status in Supabase:', error);
  }

  // Fallback
  const quotes = getLocalQuotes();
  const index = quotes.findIndex(q => q.id === quoteId);
  if (index !== -1) {
    quotes[index].status = status;
    saveLocalQuotes(quotes);
    return true;
  }
  return false;
}

export async function updateQuoteRevisions(
  quoteId: string, 
  extraRevisionsCount: number, 
  extraRevisionsCost: number,
  totalAmount: number,
  depositAmount: number
): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('quotes')
      .update({ 
        extra_revisions_count: extraRevisionsCount, 
        extra_revisions_cost: extraRevisionsCost,
        total_amount: totalAmount,
        deposit_amount: depositAmount
      })
      .eq('id', quoteId);
    if (!error) return true;
    console.error('Error updating revisions in Supabase:', error);
  }

  // Fallback
  const quotes = getLocalQuotes();
  const index = quotes.findIndex(q => q.id === quoteId);
  if (index !== -1) {
    quotes[index].extra_revisions_count = extraRevisionsCount;
    quotes[index].extra_revisions_cost = extraRevisionsCost;
    quotes[index].total_amount = totalAmount;
    quotes[index].deposit_amount = depositAmount;
    saveLocalQuotes(quotes);
    return true;
  }
  return false;
}

export async function uploadReceiptUrl(quoteId: string, paymentReceiptUrl: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('quotes')
      .update({ payment_receipt_url: paymentReceiptUrl, status: 'anticipo_recibido' })
      .eq('id', quoteId);
    if (!error) return true;
    console.error('Error updating receipt in Supabase:', error);
  }

  // Fallback
  const quotes = getLocalQuotes();
  const index = quotes.findIndex(q => q.id === quoteId);
  if (index !== -1) {
    quotes[index].payment_receipt_url = paymentReceiptUrl;
    quotes[index].status = 'anticipo_recibido';
    saveLocalQuotes(quotes);
    return true;
  }
  return false;
}
