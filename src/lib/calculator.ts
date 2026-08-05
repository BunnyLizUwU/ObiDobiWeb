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
}

export interface QuoteBreakdown {
  materialsCost: number;
  laborCost: number;
  indirectCost: number;
  manufacturingCost: number;
  profit: number;
  revisionsCost: number;
  subtotal: number;
  urgencySurcharge: number;
  paymentSurcharge: number;
  deliveryFee: number;
  total: number;
  depositRequired: number;
  balanceDue: number;
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
    settings
  } = input;

  // 1. Costo de Materiales ($C_mat) con mermas
  let materialsCost = 0;
  productMaterials.forEach(({ material, quantityUsed }) => {
    const costWithWaste = material.unit_cost * (1 + material.waste_percentage / 100);
    materialsCost += quantityUsed * costWithWaste;
  });
  // Multiplicamos por la cantidad del pedido
  materialsCost = materialsCost * quantity;

  // 2. Costo de Mano de Obra ($C_mo)
  const laborCostPerUnit = (product.estimated_minutes * settings.hourly_rate) / 60;
  const laborCost = laborCostPerUnit * quantity;

  // 3. Gastos Indirectos ($C_ind)
  const indirectCost = (materialsCost + laborCost) * (settings.indirect_cost_percentage / 100);

  // Costo total de fabricación antes de revisiones
  const manufacturingCost = materialsCost + laborCost + indirectCost;

  // 4. Margen de Ganancia ($M_gan)
  const profit = manufacturingCost * (settings.default_profit_margin / 100);

  // 5. Costo de Revisiones Extra ($C_rev)
  const revisionsCost = extraRevisionsCount * settings.extra_revision_fee;

  // Subtotal base (Costo Fabricación + Ganancia)
  const baseSubtotal = manufacturingCost + profit;

  // 6. Factores de Corrección Dinámicos
  // - Tiempo de Entrega (Urgencia)
  let urgencySurcharge = 0;
  if (urgencyLevel === 'express') {
    urgencySurcharge = baseSubtotal * (settings.express_surcharge / 100);
  } else if (urgencyLevel === 'urgente') {
    urgencySurcharge = baseSubtotal * (settings.urgent_surcharge / 100);
  }

  // - Método de Pago (Comisión del 4% si es Tarjeta)
  let paymentSurcharge = 0;
  if (paymentMethod === 'tarjeta') {
    paymentSurcharge = (baseSubtotal + urgencySurcharge) * 0.04;
  }

  // - Tipo de Entrega Local en Acámbaro
  let deliveryFee = 0;
  if (deliveryType === 'local') {
    deliveryFee = Number(settings.local_delivery_fee);
  } else if (deliveryType === 'nacional') {
    deliveryFee = Number(settings.national_shipping_fee);
  }

  // Subtotal general sumando revisiones, urgencia, pago y envío
  const total = baseSubtotal + revisionsCost + urgencySurcharge + paymentSurcharge + deliveryFee;

  // 7. Desglose de condiciones obligatorias
  const depositRequired = total * 0.5; // Anticipo del 50%
  const balanceDue = total * 0.5;     // Saldo restante del 50%

  return {
    materialsCost: Math.round(materialsCost * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    indirectCost: Math.round(indirectCost * 100) / 100,
    manufacturingCost: Math.round(manufacturingCost * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    revisionsCost: Math.round(revisionsCost * 100) / 100,
    subtotal: Math.round(baseSubtotal * 100) / 100,
    urgencySurcharge: Math.round(urgencySurcharge * 100) / 100,
    paymentSurcharge: Math.round(paymentSurcharge * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    total: Math.round(total * 100) / 100,
    depositRequired: Math.round(depositRequired * 100) / 100,
    balanceDue: Math.round(balanceDue * 100) / 100
  };
}

export const COMMERCIAL_LEGEND = "Los tiempos de entrega comienzan a correr a partir de la confirmación del 50% de anticipo y aprobación del boceto final. Incluye 2 rondas de cambios gratis; rondas adicionales: $50 MXN c/u.";
