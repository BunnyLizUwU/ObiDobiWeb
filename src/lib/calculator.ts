import { Product, Material, QuoteSettings } from './types';

export interface CalculateQuoteInput {
  product: Product;
  productMaterials: { material: Material; quantityUsed: number }[];
  quantity: number;
  extraRevisionsCount: number;
  urgencyLevel: 'normal' | 'express' | 'urgente';
  deliveryType: 'taller' | 'local' | 'nacional';
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta';
  settings: QuoteSettings;
  options?: {
    // Stickers
    stickerWidth?: number;
    stickerHeight?: number;
    stickerFinish?: 'brillante' | 'mate' | 'holografico';
    // Llaveros
    extraAcrylic?: boolean;
    // Tote bags
    doubleSided?: boolean;
    // Postres
    servings?: number;
    tiersCount?: number;
    decorationComplexity?: 'simple' | 'detallado' | 'fondant';
  };
}

export interface QuoteBreakdown {
  materialsCost: number;
  laborCost: number;
  indirectCost: number;
  manufacturingCost: number;
  profit: number;
  revisionsCost: number;
  complexitySurcharge: number;
  subtotal: number;
  urgencySurcharge: number;
  paymentSurcharge: number;
  deliveryFee: number;
  total: number;
  depositRequired: number;
  balanceDue: number;
  // Stickers extra details
  stickersPerPage?: number;
  sheetsNeeded?: number;
  pricePerPiece?: number;
}

export function calculateQuote(input: CalculateQuoteInput): QuoteBreakdown {
  const {
    product,
    productMaterials,
    quantity = 1,
    extraRevisionsCount = 0,
    urgencyLevel = 'normal',
    deliveryType = 'taller',
    paymentMethod = 'efectivo',
    settings,
    options = {}
  } = input;

  // Determinar la categoría basándose en la relación (usando slug o id de producto o categoría)
  // Como no tenemos el objeto Category completo, podemos inferir de la descripción/título del producto o su category_id
  const isSticker = product.category_id === 'cat-3' || product.title.toLowerCase().includes('sticker');
  const isKeychain = product.category_id === 'cat-4' || product.title.toLowerCase().includes('llavero');
  const isDessert = product.category_id === 'cat-5' || product.title.toLowerCase().includes('pastel') || product.title.toLowerCase().includes('cupcake');
  const isToteBag = product.category_id === 'cat-2' || product.title.toLowerCase().includes('tote');

  let materialsCost = 0;
  let estimatedMinutes = product.estimated_minutes;

  // Trackers para stickers
  let stickersPerPageVal: number | undefined;
  let sheetsNeededVal: number | undefined;

  // ==========================================
  // 1. CÁLCULO DE MATERIALES Y TIEMPO ESPECÍFICOS
  // ==========================================

  if (isSticker && options.stickerWidth && options.stickerHeight) {
    // --- STICKERS DINÁMICOS ---
    // Área imprimible de una A4 aproximada: 20cm ancho x 28.7cm alto
    const w = Number(options.stickerWidth) || 5;
    const h = Number(options.stickerHeight) || 5;
    
    const cols = Math.floor(20 / w);
    const rows = Math.floor(28.7 / h);
    const stickersPerPage = Math.max(1, cols * rows);
    
    // Planillas A4 necesarias
    const sheetsNeeded = Math.ceil(quantity / stickersPerPage);
    
    // Costo del papel según acabado
    let paperUnitCost = 6.00; // Papel Fotográfico Autoadhesivo A4 base
    let wastePct = 8.00;

    if (options.stickerFinish === 'holografico') {
      paperUnitCost = 18.00; // Vinilo Adhesivo Holográfico A4
      wastePct = 15.00;
    } else if (options.stickerFinish === 'mate') {
      paperUnitCost = 6.50; // Papel autoadhesivo mate
      wastePct = 8.00;
    }

    const paperCostWithWaste = paperUnitCost * (1 + wastePct / 100);
    materialsCost = sheetsNeeded * paperCostWithWaste;
    
    // Mano de obra de corte: 20 minutos base por planilla + 0.5 minutos por sticker
    estimatedMinutes = (20 * sheetsNeeded) + (0.5 * quantity);

    stickersPerPageVal = stickersPerPage;
    sheetsNeededVal = sheetsNeeded;

  } else if (isKeychain) {
    // --- LLAVEROS DE LISTÓN Y ACRÍLICO ---
    // Costo base del llavero
    let unitMaterialsCost = 0;
    productMaterials.forEach(({ material, quantityUsed }) => {
      const costWithWaste = material.unit_cost * (1 + material.waste_percentage / 100);
      unitMaterialsCost += quantityUsed * costWithWaste;
    });

    // Si se selecciona acrílico circular extra, añadimos otra pieza de acrílico y otra de vinilo
    if (options.extraAcrylic) {
      // Buscar material de acrílico y vinilo en los insumos asignados
      const acrylicMaterial = productMaterials.find(m => m.material.name.toLowerCase().includes('acríl') || m.material.name.toLowerCase().includes('acril'));
      const vinylMaterial = productMaterials.find(m => m.material.name.toLowerCase().includes('vinil'));

      if (acrylicMaterial) {
        const costWithWaste = acrylicMaterial.material.unit_cost * (1 + acrylicMaterial.material.waste_percentage / 100);
        unitMaterialsCost += costWithWaste; // 1 pieza más
      }
      if (vinylMaterial) {
        const costWithWaste = vinylMaterial.material.unit_cost * (1 + vinylMaterial.material.waste_percentage / 100);
        unitMaterialsCost += costWithWaste; // 1 vinilo más
      }
      // Armar un llavero con doble acrílico toma 10 minutos adicionales
      estimatedMinutes += 10;
    }

    materialsCost = unitMaterialsCost * quantity;

  } else if (isToteBag && options.doubleSided) {
    // --- TOTEBAG CON DOBLE IMPRESIÓN ---
    let unitMaterialsCost = 0;
    productMaterials.forEach(({ material, quantityUsed }) => {
      const costWithWaste = material.unit_cost * (1 + material.waste_percentage / 100);
      // Añadimos una hoja de transfer extra por pieza si es doble cara
      if (material.name.toLowerCase().includes('transfer') || material.name.toLowerCase().includes('sublim')) {
        unitMaterialsCost += (quantityUsed + 1) * costWithWaste;
      } else {
        unitMaterialsCost += quantityUsed * costWithWaste;
      }
    });

    materialsCost = unitMaterialsCost * quantity;
    // Sublimar doble cara requiere 15 minutos extras de planchado por bolsa
    estimatedMinutes += 15;

  } else if (isDessert && options.servings) {
    // --- POSTRES / REPOSTERÍA PERSONALIZADA ---
    // Receta estándar de semilla está diseñada para 10 porciones (mezcla 1000g, cobertura 400g)
    const baseServings = 10;
    const servings = Number(options.servings) || 10;
    const servingsScale = servings / baseServings;

    let unitMaterialsCost = 0;
    productMaterials.forEach(({ material, quantityUsed }) => {
      const costWithWaste = material.unit_cost * (1 + material.waste_percentage / 100);
      
      if (material.name.toLowerCase().includes('caja') || material.name.toLowerCase().includes('empaque')) {
        // La caja no se escala por las porciones, es 1 por pastel
        unitMaterialsCost += costWithWaste;
      } else {
        // Los ingredientes (mezcla base, coberturas) se escalan proporcionalmente
        unitMaterialsCost += (quantityUsed * servingsScale) * costWithWaste;
      }
    });

    materialsCost = unitMaterialsCost * quantity;

    // Mano de obra del pastel escala con las porciones y pisos
    const tiers = Number(options.tiersCount) || 1;
    // 120 minutos base + 3 minutos por rebanada adicional sobre 10
    let dessertMinutes = product.estimated_minutes;
    if (servings > baseServings) {
      dessertMinutes += (servings - baseServings) * 3;
    }
    // Añadir 45 minutos por cada piso extra de ensamblado y soportes
    if (tiers > 1) {
      dessertMinutes += (tiers - 1) * 45;
    }
    estimatedMinutes = dessertMinutes;

  } else {
    // --- CÁLCULO ESTÁNDAR (OTROS PRODUCTOS) ---
    let unitMaterialsCost = 0;
    productMaterials.forEach(({ material, quantityUsed }) => {
      const costWithWaste = material.unit_cost * (1 + material.waste_percentage / 100);
      unitMaterialsCost += quantityUsed * costWithWaste;
    });
    materialsCost = unitMaterialsCost * quantity;
  }

  // ==========================================
  // 2. CÁLCULO DE MANO DE OBRA Y OPERATIVOS
  // ==========================================
  
  // Costo de Mano de Obra ($C_mo)
  const laborCost = isSticker 
    ? (estimatedMinutes * settings.hourly_rate) / 60
    : ((estimatedMinutes * settings.hourly_rate) / 60) * quantity;

  // Gastos Indirectos ($C_ind)
  const indirectCost = (materialsCost + laborCost) * (settings.indirect_cost_percentage / 100);

  // Costo total de fabricación antes de revisiones
  const manufacturingCost = materialsCost + laborCost + indirectCost;

  // Margen de Ganancia ($M_gan)
  const profit = manufacturingCost * (settings.default_profit_margin / 100);

  // Costo de Revisiones Extra ($C_rev)
  const revisionsCost = extraRevisionsCount * settings.extra_revision_fee;

  // Subtotal base (Costo Fabricación + Ganancia)
  const baseSubtotal = manufacturingCost + profit;

  // ==========================================
  // 3. RECARGOS ESPECÍFICOS Y COMPLEJIDADES
  // ==========================================
  
  // Recargo de complejidad para Decoración de Pasteles
  let complexitySurcharge = 0;
  if (isDessert && options.decorationComplexity) {
    if (options.decorationComplexity === 'detallado') {
      complexitySurcharge = baseSubtotal * 0.20; // +20% por detalle buttercream
    } else if (options.decorationComplexity === 'fondant') {
      complexitySurcharge = baseSubtotal * 0.50; // +50% por modelado fondant
    }
  }

  const subtotalWithComplexity = baseSubtotal + complexitySurcharge;

  // Factores de Corrección Dinámicos
  // - Tiempo de Entrega (Urgencia)
  let urgencySurcharge = 0;
  if (urgencyLevel === 'express') {
    urgencySurcharge = subtotalWithComplexity * (settings.express_surcharge / 100);
  } else if (urgencyLevel === 'urgente') {
    urgencySurcharge = subtotalWithComplexity * (settings.urgent_surcharge / 100);
  }

  // - Método de Pago (Comisión del 4% si es Tarjeta)
  let paymentSurcharge = 0;
  if (paymentMethod === 'tarjeta') {
    paymentSurcharge = (subtotalWithComplexity + urgencySurcharge) * 0.04;
  }

  // - Tipo de Entrega Local en Acámbaro
  let deliveryFee = 0;
  if (deliveryType === 'local') {
    deliveryFee = Number(settings.local_delivery_fee);
  } else if (deliveryType === 'nacional') {
    deliveryFee = Number(settings.national_shipping_fee); // Será 80 MXN
  }

  // Subtotal general sumando todo
  const total = subtotalWithComplexity + revisionsCost + urgencySurcharge + paymentSurcharge + deliveryFee;

  // Desglose de condiciones obligatorias (50% anticipo)
  const depositRequired = total * 0.5;
  const balanceDue = total * 0.5;

  return {
    materialsCost: Math.round(materialsCost * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    indirectCost: Math.round(indirectCost * 100) / 100,
    manufacturingCost: Math.round(manufacturingCost * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    revisionsCost: Math.round(revisionsCost * 100) / 100,
    complexitySurcharge: Math.round(complexitySurcharge * 100) / 100,
    subtotal: Math.round(baseSubtotal * 100) / 100,
    urgencySurcharge: Math.round(urgencySurcharge * 100) / 100,
    paymentSurcharge: Math.round(paymentSurcharge * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    total: Math.round(total * 100) / 100,
    depositRequired: Math.round(depositRequired * 100) / 100,
    balanceDue: Math.round(balanceDue * 100) / 100,
    stickersPerPage: stickersPerPageVal,
    sheetsNeeded: sheetsNeededVal,
    pricePerPiece: quantity > 0 ? Math.round((total / quantity) * 100) / 100 : Math.round(total * 100) / 100
  };
}

export const COMMERCIAL_LEGEND = "Los tiempos de entrega comienzan a correr a partir de la confirmación del 50% de anticipo y aprobación del boceto final. Incluye 2 rondas de cambios gratis; rondas adicionales: $50 MXN c/u.";
