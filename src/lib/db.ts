import { supabase, isSupabaseConfigured } from './supabase';
import { Category, Product, Material, QuoteSettings, Quote, QuoteStatus } from './types';

// ==========================================
// MOCK INITIAL SEED DATA
// ==========================================

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Invitaciones Digitales', slug: 'invitaciones-digitales', description: 'Invitaciones interactivas para bodas, XV años, cumpleaños y eventos corporativos con RSVP, GPS y cuenta regresiva.' },
  { id: 'cat-2', name: 'Totebags Sublimadas', slug: 'tote-bags', description: 'Bolsas de tela canvas ecológicas y duraderas con diseños personalizados y sublimación premium.' },
  { id: 'cat-3', name: 'Stickers Personalizados', slug: 'stickers', description: 'Pegatinas de alta calidad con cortes precisos en diferentes acabados: brillante, mate y holográfico.' },
  { id: 'cat-4', name: 'Llaveros de Listón y Acrílico', slug: 'llaveros-resina', description: 'Llaveros elegantes elaborados con moño de listón de raso/organza, argolla metálica y placa acrílica circular decorada.' },
  { id: 'cat-5', name: 'Postres Personalizados', slug: 'postres-personalizados', description: 'Pasteles de fondant o buttercream, cupcakes y repostería personalizada para eventos.' }
];

const initialMaterials: Material[] = [
  { id: 'mat-1', name: 'Listón de Organza/Raso (m)', unit_measure: 'm', unit_cost: 4.50, waste_percentage: 10.00 },
  { id: 'mat-2', name: 'Argolla y Cadena de Llavero', unit_measure: 'pza', unit_cost: 3.50, waste_percentage: 2.00 },
  { id: 'mat-3', name: 'Acrílico Circular 5cm', unit_measure: 'pza', unit_cost: 9.00, waste_percentage: 5.00 },
  { id: 'mat-4', name: 'Vinilo Autoadhesivo de Recorte (diseño)', unit_measure: 'pza', unit_cost: 5.00, waste_percentage: 10.00 },
  { id: 'mat-5', name: 'Bolsa Tote Bag Canvas Lisa', unit_measure: 'pza', unit_cost: 32.00, waste_percentage: 0.00 },
  { id: 'mat-6', name: 'Hoja de Transfer / Sublimación A4', unit_measure: 'pza', unit_cost: 8.50, waste_percentage: 10.00 },
  { id: 'mat-7', name: 'Vinilo Adhesivo Holográfico A4', unit_measure: 'pza', unit_cost: 18.00, waste_percentage: 15.00 },
  { id: 'mat-8', name: 'Papel Fotográfico Autoadhesivo A4', unit_measure: 'pza', unit_cost: 6.00, waste_percentage: 8.00 },
  { id: 'mat-9', name: 'Hospedaje Digital Invitación (por año)', unit_measure: 'pza', unit_cost: 50.00, waste_percentage: 0.00 },
  { id: 'mat-10', name: 'Mezcla Base de Pastel (Harina/Huevo/Mantequilla) (g)', unit_measure: 'g', unit_cost: 0.08, waste_percentage: 5.00 },
  { id: 'mat-11', name: 'Fondant y Coberturas (g)', unit_measure: 'g', unit_cost: 0.12, waste_percentage: 15.00 },
  { id: 'mat-12', name: 'Caja de Pastel y Soporte', unit_measure: 'pza', unit_cost: 18.00, waste_percentage: 0.00 }
];

const initialProducts: Product[] = [
  { id: 'prod-1', category_id: 'cat-1', title: 'Invitación Digital Interactiva Premium', description: 'Invitación interactiva para dispositivos móviles. Incluye cuenta regresiva, confirmación automática de asistencia por WhatsApp, ubicación con Google Maps, mesa de regalos y galería de fotos.', images: ['/placeholder_invitacion.png'], is_digital: true, estimated_minutes: 180 },
  { id: 'prod-2', category_id: 'cat-2', title: 'Tote Bag Canvas Personalizada', description: 'Bolsa de tela de algodón (canvas) resistente con impresión de alta calidad mediante técnica de sublimación. Medidas estándar 35x40cm.', images: ['/placeholder_totebag.png'], is_digital: false, estimated_minutes: 45 },
  { id: 'prod-3', category_id: 'cat-3', title: 'Planilla de Stickers Custom (A4)', description: 'Planilla tamaño A4 de stickers personalizados troquelados con la forma de tu diseño. Ideales para termos, laptops, packaging o decoración.', images: ['/placeholder_stickers.png'], is_digital: false, estimated_minutes: 30 },
  { id: 'prod-4', category_id: 'cat-4', title: 'Llavero de Listón y Acrílico Circular', description: 'Llavero hecho a mano con moño de listón de raso/organza, argolla metálica reforzada y placa de acrílico circular con vinilo personalizado.', images: ['/placeholder_llavero.png'], is_digital: false, estimated_minutes: 25 },
  { id: 'prod-5', category_id: 'cat-5', title: 'Pastel Personalizado Temático', description: 'Pastel artístico personalizado para eventos. Configura sabor de pan, rellenos y cobertura en fondant o buttercream según la temática.', images: ['/placeholder_pastel.png'], is_digital: false, estimated_minutes: 180 },
  { id: 'prod-6', category_id: 'cat-5', title: 'Set de Cupcakes Decorados (6 pzas)', description: 'Set de 6 cupcakes personalizados con buttercream y pequeños detalles de fondant temáticos.', images: ['/placeholder_cupcakes.png'], is_digital: false, estimated_minutes: 90 }
];

// Mapeos de insumos iniciales
const initialProductMaterials = [
  { productId: 'prod-1', materialId: 'mat-9', quantity: 1 },
  { productId: 'prod-2', materialId: 'mat-5', quantity: 1 },
  { productId: 'prod-2', materialId: 'mat-6', quantity: 1 },
  { productId: 'prod-3', materialId: 'mat-8', quantity: 1 },
  { productId: 'prod-4', materialId: 'mat-1', quantity: 0.3 },
  { productId: 'prod-4', materialId: 'mat-2', quantity: 1 },
  { productId: 'prod-4', materialId: 'mat-3', quantity: 1 },
  { productId: 'prod-4', materialId: 'mat-4', quantity: 1 },
  { productId: 'prod-5', materialId: 'mat-10', quantity: 1000 },
  { productId: 'prod-5', materialId: 'mat-11', quantity: 400 },
  { productId: 'prod-5', materialId: 'mat-12', quantity: 1 },
  { productId: 'prod-6', materialId: 'mat-10', quantity: 300 },
  { productId: 'prod-6', materialId: 'mat-11', quantity: 150 },
  { productId: 'prod-6', materialId: 'mat-12', quantity: 1 }
];

const mockSettings: QuoteSettings = {
  hourly_rate: 120.00,
  indirect_cost_percentage: 15.00,
  default_profit_margin: 40.00,
  included_revisions: 2,
  extra_revision_fee: 50.00,
  express_surcharge: 25.00,
  urgent_surcharge: 50.00,
  local_delivery_fee: 40.00,
  national_shipping_fee: 80.00 // Actualizado a 80
};

// Keys para LocalStorage
const PRODUCTS_KEY = 'obidobi_local_products';
const MATERIALS_KEY = 'obidobi_local_materials';
const PROD_MATERIALS_KEY = 'obidobi_local_product_materials';
const QUOTES_KEY = 'obidobi_local_quotes';
const SETTINGS_KEY = 'obidobi_local_settings';

// ==========================================
// HELPERS LOCALSTORAGE PERSISTENCE
// ==========================================

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// Cargar listas iniciales
function getLocalProducts(): Product[] {
  return getStorageItem<Product[]>(PRODUCTS_KEY, initialProducts);
}

function getLocalMaterials(): Material[] {
  return getStorageItem<Material[]>(MATERIALS_KEY, initialMaterials);
}

interface LocalProductMaterialRel {
  productId: string;
  materialId: string;
  quantity: number;
}

function getLocalProductMaterialsRel(): LocalProductMaterialRel[] {
  return getStorageItem<LocalProductMaterialRel[]>(PROD_MATERIALS_KEY, initialProductMaterials);
}

// ==========================================
// DB SERVICE METHODS WITH LOCAL FALLBACK
// ==========================================

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('categories').select('*');
    if (!error && data) return data as Category[];
    console.warn('Error fetching categories from Supabase, using mock:', error);
  }
  return initialCategories;
}

export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) return data as Product[];
    console.warn('Error fetching products from Supabase, using mock:', error);
  }
  return getLocalProducts();
}

export async function getMaterials(): Promise<Material[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('materials').select('*');
    if (!error && data) return data as Material[];
    console.warn('Error fetching materials from Supabase, using mock:', error);
  }
  return getLocalMaterials();
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
  const relations = getLocalProductMaterialsRel().filter(r => r.productId === productId);
  const matsList = getLocalMaterials();
  return relations.map(rel => {
    const mat = matsList.find(m => m.id === rel.materialId)!;
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
  return getStorageItem<QuoteSettings>(SETTINGS_KEY, mockSettings);
}

// ==========================================
// ADMIN MUTATION METHODS
// ==========================================

export async function createProduct(
  product: Omit<Product, 'id'>, 
  materials: { materialId: string; quantity: number }[]
): Promise<Product> {
  if (isSupabaseConfigured) {
    const { data: newProd, error: prodErr } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (!prodErr && newProd) {
      if (materials.length > 0) {
        const mappings = materials.map(m => ({
          product_id: newProd.id,
          material_id: m.materialId,
          quantity: m.quantity
        }));
        await supabase.from('product_materials').insert(mappings);
      }
      return newProd as Product;
    }
    console.error('Error inserting product to Supabase:', prodErr);
  }

  // Fallback
  const prods = getLocalProducts();
  const newProduct: Product = {
    ...product,
    id: 'prod-' + Math.random().toString(36).substr(2, 9)
  };
  prods.push(newProduct);
  setStorageItem(PRODUCTS_KEY, prods);

  // Guardar relaciones
  const rels = getLocalProductMaterialsRel();
  materials.forEach(m => {
    rels.push({
      productId: newProduct.id,
      materialId: m.materialId,
      quantity: m.quantity
    });
  });
  setStorageItem(PROD_MATERIALS_KEY, rels);

  return newProduct;
}

export async function updateProduct(
  product: Product, 
  materials: { materialId: string; quantity: number }[]
): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error: prodErr } = await supabase
      .from('products')
      .update({
        title: product.title,
        description: product.description,
        category_id: product.category_id,
        estimated_minutes: product.estimated_minutes,
        is_digital: product.is_digital,
        images: product.images
      })
      .eq('id', product.id);

    if (!prodErr) {
      // Borrar relaciones anteriores
      await supabase.from('product_materials').delete().eq('product_id', product.id);
      
      // Insertar nuevas relaciones
      if (materials.length > 0) {
        const mappings = materials.map(m => ({
          product_id: product.id,
          material_id: m.materialId,
          quantity: m.quantity
        }));
        await supabase.from('product_materials').insert(mappings);
      }
      return true;
    }
    console.error('Error updating product in Supabase:', prodErr);
    return false;
  }

  // Fallback
  const prods = getLocalProducts();
  const index = prods.findIndex(p => p.id === product.id);
  if (index !== -1) {
    prods[index] = product;
    setStorageItem(PRODUCTS_KEY, prods);

    // Actualizar relaciones en LocalStorage
    const rels = getLocalProductMaterialsRel();
    const updatedRels = rels.filter(r => r.productId !== product.id);
    materials.forEach(m => {
      updatedRels.push({
        productId: product.id,
        materialId: m.materialId,
        quantity: m.quantity
      });
    });
    setStorageItem(PROD_MATERIALS_KEY, updatedRels);
    return true;
  }
  return false;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) return true;
    console.error('Error deleting product from Supabase:', error);
  }

  // Fallback
  const prods = getLocalProducts();
  const updatedProds = prods.filter(p => p.id !== productId);
  setStorageItem(PRODUCTS_KEY, updatedProds);

  // Borrar relaciones
  const rels = getLocalProductMaterialsRel();
  const updatedRels = rels.filter(r => r.productId !== productId);
  setStorageItem(PROD_MATERIALS_KEY, updatedRels);

  return true;
}

export async function createMaterial(material: Omit<Material, 'id'>): Promise<Material> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('materials')
      .insert([material])
      .select()
      .single();
    if (!error && data) return data as Material;
    console.error('Error inserting material to Supabase:', error);
  }

  // Fallback
  const mats = getLocalMaterials();
  const newMat: Material = {
    ...material,
    id: 'mat-' + Math.random().toString(36).substr(2, 9)
  };
  mats.push(newMat);
  setStorageItem(MATERIALS_KEY, mats);
  return newMat;
}

export async function updateMaterial(material: Material): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('materials')
      .update({
        name: material.name,
        unit_measure: material.unit_measure,
        unit_cost: material.unit_cost,
        waste_percentage: material.waste_percentage
      })
      .eq('id', material.id);
    if (!error) return true;
    console.error('Error updating material in Supabase:', error);
  }

  // Fallback
  const mats = getLocalMaterials();
  const index = mats.findIndex(m => m.id === material.id);
  if (index !== -1) {
    mats[index] = material;
    setStorageItem(MATERIALS_KEY, mats);
    return true;
  }
  return false;
}

export async function deleteMaterial(materialId: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('materials').delete().eq('id', materialId);
    if (!error) return true;
    console.error('Error deleting material from Supabase:', error);
  }

  // Fallback
  const mats = getLocalMaterials();
  const updatedMats = mats.filter(m => m.id !== materialId);
  setStorageItem(MATERIALS_KEY, updatedMats);

  // Borrar relaciones asociadas
  const rels = getLocalProductMaterialsRel();
  const updatedRels = rels.filter(r => r.materialId !== materialId);
  setStorageItem(PROD_MATERIALS_KEY, updatedRels);

  return true;
}

// ==========================================
// QUOTES LOCALSTORAGE & SUPABASE METHODS
// ==========================================

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

  // Fallback
  const quotes = getStorageItem<Quote[]>(QUOTES_KEY, []);
  const nextFolio = quotes.length > 0 ? Math.max(...quotes.map(q => q.folio || 1000)) + 1 : 1001;
  const newQuote: Quote = {
    ...quote,
    id: 'q-' + Math.random().toString(36).substr(2, 9),
    folio: nextFolio,
    created_at: new Date().toISOString()
  };
  quotes.push(newQuote);
  setStorageItem(QUOTES_KEY, quotes);
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
  // Sembramos algunas cotizaciones demo iniciales si no existen
  const demoQuotes: Quote[] = [
    {
      id: 'q-demo-1',
      folio: 1001,
      client_name: 'María Alejandra Hernández',
      client_phone: '4171234567',
      event_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      delivery_type: 'local',
      urgency_level: 'normal',
      payment_method: 'transferencia',
      total_amount: 320.00,
      deposit_amount: 160.00,
      status: 'pendiente',
      included_revisions: 2,
      extra_revisions_count: 0,
      extra_revisions_cost: 0,
      notes: 'Desea diseño de listón rosa pastel en el llavero.',
      created_at: new Date().toISOString(),
      product_title: 'Llavero de Listón y Acrílico Circular',
      quantity: 5
    },
    {
      id: 'q-demo-2',
      folio: 1002,
      client_name: 'Juan Carlos Pérez',
      client_phone: '7891117199',
      event_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    }
  ];
  return getStorageItem<Quote[]>(QUOTES_KEY, demoQuotes);
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
  const quotes = getStorageItem<Quote[]>(QUOTES_KEY, []);
  const index = quotes.findIndex(q => q.id === quoteId);
  if (index !== -1) {
    quotes[index].status = status;
    setStorageItem(QUOTES_KEY, quotes);
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
  const quotes = getStorageItem<Quote[]>(QUOTES_KEY, []);
  const index = quotes.findIndex(q => q.id === quoteId);
  if (index !== -1) {
    quotes[index].extra_revisions_count = extraRevisionsCount;
    quotes[index].extra_revisions_cost = extraRevisionsCost;
    quotes[index].total_amount = totalAmount;
    quotes[index].deposit_amount = depositAmount;
    setStorageItem(QUOTES_KEY, quotes);
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
  const quotes = getStorageItem<Quote[]>(QUOTES_KEY, []);
  const index = quotes.findIndex(q => q.id === quoteId);
  if (index !== -1) {
    quotes[index].payment_receipt_url = paymentReceiptUrl;
    quotes[index].status = 'anticipo_recibido';
    setStorageItem(QUOTES_KEY, quotes);
    return true;
  }
  return false;
}
