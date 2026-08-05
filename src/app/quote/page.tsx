'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calculator, Check, Phone, Send, Info, Calendar, User, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getProducts, getMaterials, getProductMaterials, getQuoteSettings, createQuote } from '../../lib/db';
import { calculateQuote, QuoteBreakdown, COMMERCIAL_LEGEND } from '../../lib/calculator';
import { Product, Material, QuoteSettings, Quote } from '../../lib/types';

function QuoteCalculatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // DB Data
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [settings, setSettings] = useState<QuoteSettings | null>(null);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [extraRevisions, setExtraRevisions] = useState(0);
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'express' | 'urgente'>('normal');
  const [deliveryType, setDeliveryType] = useState<'taller' | 'local' | 'nacional'>('taller');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'tarjeta'>('efectivo');
  const [notes, setNotes] = useState('');

  // UI / Calculation states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productMaterials, setProductMaterials] = useState<{ material: Material; quantityUsed: number }[]>([]);
  const [breakdown, setBreakdown] = useState<QuoteBreakdown | null>(null);
  const [successQuote, setSuccessQuote] = useState<Quote | null>(null);

  // 1. Cargar catálogo básico
  useEffect(() => {
    async function init() {
      try {
        const [prods, mats, setts] = await Promise.all([
          getProducts(),
          getMaterials(),
          getQuoteSettings()
        ]);
        setProducts(prods);
        setMaterials(mats);
        setSettings(setts);

        // Preseleccionar producto por URL query params si existe
        const urlProductSlug = searchParams.get('product');
        if (urlProductSlug) {
          const matched = prods.find(p => {
            const cat = urlProductSlug === 'invitaciones-digitales' && p.title.toLowerCase().includes('invitaci')
              || urlProductSlug === 'tote-bags' && p.title.toLowerCase().includes('tote')
              || urlProductSlug === 'stickers' && p.title.toLowerCase().includes('stickers')
              || urlProductSlug === 'llaveros-resina' && p.title.toLowerCase().includes('llavero');
            return cat;
          });
          if (matched) {
            setSelectedProductId(matched.id);
          } else if (prods.length > 0) {
            setSelectedProductId(prods[0].id);
          }
        } else if (prods.length > 0) {
          setSelectedProductId(prods[0].id);
        }
      } catch (err) {
        console.error('Error loading calculator dependencies:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [searchParams]);

  // 2. Cargar insumos específicos cuando cambia el producto
  useEffect(() => {
    if (!selectedProductId) return;
    async function loadMaterials() {
      try {
        const pMats = await getProductMaterials(selectedProductId);
        setProductMaterials(pMats);
      } catch (err) {
        console.error('Error loading product materials:', err);
      }
    }
    loadMaterials();
  }, [selectedProductId]);

  // 3. Ejecutar algoritmo de cotización en tiempo real
  useEffect(() => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product || !settings) {
      setBreakdown(null);
      return;
    }

    const res = calculateQuote({
      product,
      productMaterials,
      quantity,
      extraRevisionsCount: extraRevisions,
      urgencyLevel,
      deliveryType,
      paymentMethod,
      settings
    });
    setBreakdown(res);
  }, [selectedProductId, productMaterials, quantity, extraRevisions, urgencyLevel, deliveryType, paymentMethod, products, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !breakdown || submitting) return;

    setSubmitting(true);
    const product = products.find(p => p.id === selectedProductId)!;

    try {
      const quoteData: Omit<Quote, 'id' | 'folio' | 'created_at'> = {
        client_name: clientName,
        client_phone: clientPhone,
        event_date: eventDate,
        delivery_type: deliveryType,
        urgency_level: urgencyLevel,
        payment_method: paymentMethod,
        total_amount: breakdown.total,
        deposit_amount: breakdown.depositRequired,
        status: 'pendiente',
        included_revisions: settings?.included_revisions || 2,
        extra_revisions_count: extraRevisions,
        extra_revisions_cost: breakdown.revisionsCost,
        notes: notes,
        product_title: product.title,
        quantity: quantity
      };

      const result = await createQuote(quoteData);
      setSuccessQuote(result);

      // Lanzar confeti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Error submitting quote request:', err);
      alert('Hubo un error al registrar tu cotización. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!successQuote || !breakdown) return;

    const urgencyLabels = { normal: 'Normal (3-5 días)', express: 'Express (24-48h)', urgente: 'Urgente (Mismo día)' };
    const deliveryLabels = { taller: 'Recoger en Taller ($0)', local: 'Envío Local', nacional: 'Envío Nacional / Paquetería' };
    const paymentLabels = { efectivo: 'Efectivo', transferencia: 'Transferencia', tarjeta: 'Tarjeta' };

    const text = `✨ *NUEVA SOLICITUD DE COTIZACIÓN - OBI DOBI* ✨\n\n` +
      `*Folio:* #${successQuote.folio}\n` +
      `*Cliente:* ${successQuote.client_name}\n` +
      `*Teléfono:* ${successQuote.client_phone}\n` +
      `*Fecha del Evento:* ${successQuote.event_date || 'No especificada'}\n` +
      `*Producto:* ${successQuote.product_title}\n` +
      `*Cantidad:* ${successQuote.quantity} pza(s)\n\n` +
      `*Desglose de Cotización:*\n` +
      `- Revisiones extra: ${successQuote.extra_revisions_count} ($${breakdown.revisionsCost} MXN)\n` +
      `- Urgencia: ${urgencyLabels[successQuote.urgency_level]}\n` +
      `- Entrega: ${deliveryLabels[successQuote.delivery_type] || successQuote.delivery_type}\n` +
      `- Método de Pago: ${paymentLabels[successQuote.payment_method]}\n` +
      `----------------------------------\n` +
      `*Total estimado:* $${breakdown.total.toFixed(2)} MXN\n` +
      `*Anticipo Requerido (50%):* $${breakdown.depositRequired.toFixed(2)} MXN\n` +
      `*Saldo contra entrega (50%):* $${breakdown.balanceDue.toFixed(2)} MXN\n\n` +
      `*Notas:* ${successQuote.notes || 'Ninguna'}\n\n` +
      `_Tiempos de entrega inician al confirmar anticipo y aprobar boceto final._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?phone=5217891117199&text=${encoded}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-forest/60">Cargando cotizador...</p>
      </div>
    );
  }

  // Éxito al cotizar
  if (successQuote && breakdown) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-forest/5 p-8 shadow-xl text-center my-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-logo-green/10 text-logo-green flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10" />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-extrabold text-forest mb-2">
          ¡Cotización Registrada con Éxito!
        </h1>
        <p className="text-xs font-bold text-logo-pink uppercase tracking-widest mb-4">
          Folio de pedido: #{successQuote.folio}
        </p>
        <p className="text-sm text-forest/60 max-w-md mx-auto mb-8">
          Tu cotización ha sido guardada en nuestro sistema. Para iniciar a trabajar en tus bocetos personalizados, por favor envía la información a Debanhi haciendo clic en el botón de WhatsApp abajo.
        </p>

        {/* Breakdown Card */}
        <div className="bg-cream rounded-2xl p-6 border border-forest/5 text-left max-w-md mx-auto mb-8 flex flex-col gap-3">
          <h3 className="font-bold text-forest text-sm uppercase tracking-wider border-b border-forest/5 pb-2">
            Resumen de tu Estimación
          </h3>
          <div className="flex justify-between text-xs text-forest/70">
            <span>Producto:</span>
            <span className="font-bold">{successQuote.product_title}</span>
          </div>
          <div className="flex justify-between text-xs text-forest/70">
            <span>Cantidad:</span>
            <span className="font-bold">{successQuote.quantity} pza(s)</span>
          </div>
          <div className="w-full h-px bg-forest/5" />
          <div className="flex justify-between text-xs font-semibold text-forest/90">
            <span>Anticipo para iniciar (50%):</span>
            <span className="text-logo-pink text-sm font-bold">${breakdown.depositRequired.toFixed(2)} MXN</span>
          </div>
          <div className="flex justify-between text-xs text-forest/60">
            <span>Resto al entregar (50%):</span>
            <span className="font-semibold">${breakdown.balanceDue.toFixed(2)} MXN</span>
          </div>
          <div className="flex justify-between text-sm font-black text-forest border-t border-dashed border-forest/10 pt-2">
            <span>Total estimado:</span>
            <span className="text-base text-forest font-black">${breakdown.total.toFixed(2)} MXN</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 bg-logo-green hover:bg-logo-green/95 text-forest font-black px-6 py-4 rounded-xl shadow-md transition-all text-sm"
          >
            <Phone className="w-5 h-5 fill-forest" />
            Enviar a Debanhi por WhatsApp
          </button>
          
          <button
            onClick={() => {
              setSuccessQuote(null);
              setClientName('');
              setClientPhone('');
              setEventDate('');
              setNotes('');
              setQuantity(1);
              setExtraRevisions(0);
            }}
            className="px-6 py-4 border border-forest/10 hover:bg-forest/5 text-forest font-bold text-sm rounded-xl transition-all"
          >
            Hacer otra cotización
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto my-8">
      
      {/* Formulario Izquierda (7 Columnas) */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl border border-forest/5 p-6 md:p-8 shadow-md flex flex-col gap-6">
        
        <div>
          <h2 className="text-xl font-extrabold text-forest mb-1 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-logo-pink" />
            Cotizador Inteligente
          </h2>
          <p className="text-xs text-forest/50">
            Completa los detalles de tu producto para calcular costos y surcharges al instante.
          </p>
        </div>

        {/* Datos de contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-primary-blue" />
              Tu Nombre completo
            </label>
            <input
              type="text"
              required
              placeholder="ej. María Alejandra"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-logo-green" />
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              required
              placeholder="ej. 4171234567"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
            />
          </div>
        </div>

        {/* Producto y cantidad */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">
              Producto a Cotizar
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">
              Cantidad (Pzas)
            </label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
            />
          </div>
        </div>

        {/* Fecha y Revisiones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-logo-orange" />
              Fecha del Evento
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-logo-yellow" />
              Revisiones Adicionales (+$50 c/u)
            </label>
            <select
              value={extraRevisions}
              onChange={(e) => setExtraRevisions(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
            >
              <option value="0">0 (2 rondas gratis incluidas)</option>
              <option value="1">1 ronda extra (+$50 MXN)</option>
              <option value="2">2 rondas extra (+$100 MXN)</option>
              <option value="3">3 rondas extra (+$150 MXN)</option>
              <option value="4">4 rondas extra (+$200 MXN)</option>
              <option value="5">5 rondas extra (+$250 MXN)</option>
            </select>
          </div>
        </div>

        {/* Correcciones y Factores de Costo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-forest/5 pt-4">
          <div>
            <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">
              Tiempo de Entrega
            </label>
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
            >
              <option value="normal">Normal (3-5 días, sin cargo)</option>
              <option value="express">Express (24-48 hrs, +25%)</option>
              <option value="urgente">Urgente (Mismo día, +50%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">
              Tipo de Entrega
            </label>
            <select
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
            >
              <option value="taller">Recoger en Taller ($0)</option>
              <option value="local">Envío Local Acámbaro (+${settings?.local_delivery_fee || 40})</option>
              <option value="nacional">Paquetería Nacional (+${settings?.national_shipping_fee || 180})</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">
              Método de Pago
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
            >
              <option value="efectivo">Efectivo ($0 cargo)</option>
              <option value="transferencia">Transferencia ($0 cargo)</option>
              <option value="tarjeta">Tarjeta/Pasarela (+4% com.)</option>
            </select>
          </div>
        </div>

        {/* Detalles / Notas */}
        <div>
          <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">
            Detalles de tu Diseño / Notas adicionales
          </label>
          <textarea
            placeholder="Describe colores, textos, figuras o ideas para tu papelería..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-forest/15 bg-white text-forest text-sm font-medium focus:outline-none focus:border-logo-pink h-24"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-forest text-cream font-bold py-4 rounded-xl shadow hover:bg-forest/95 transition-all text-sm cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4 text-logo-yellow" />
          {submitting ? 'Guardando cotización...' : 'Confirmar y Guardar Cotización'}
        </button>

      </form>

      {/* Desglose de Costos Derecha (5 Columnas) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Estimación Panel */}
        <div className="bg-forest text-cream rounded-3xl p-6 md:p-8 shadow-md flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-logo-yellow/5 rounded-full blur-2xl" />
          
          <div>
            <h3 className="text-lg font-extrabold tracking-wide uppercase text-logo-yellow mb-1">
              Desglose Estimado
            </h3>
            <p className="text-[10px] text-cream/60">
              Cálculo inmediato basado en las variables seleccionadas.
            </p>
          </div>

          {breakdown ? (
            <div className="flex flex-col gap-3.5 text-xs text-cream/80">
              
              <div className="flex justify-between">
                <span>Costo Insumos/Materiales:</span>
                <span className="font-bold font-mono text-cream">${breakdown.materialsCost.toFixed(2)} MXN</span>
              </div>
              
              <div className="flex justify-between">
                <span>Costo Mano de Obra:</span>
                <span className="font-bold font-mono text-cream">${breakdown.laborCost.toFixed(2)} MXN</span>
              </div>

              <div className="flex justify-between">
                <span>Gastos Indirectos (Luz/Máquinas):</span>
                <span className="font-bold font-mono text-cream">${breakdown.indirectCost.toFixed(2)} MXN</span>
              </div>

              <div className="flex justify-between text-cream/50">
                <span>Margen de Ganancia Neto:</span>
                <span>+${breakdown.profit.toFixed(2)} MXN</span>
              </div>

              {breakdown.revisionsCost > 0 && (
                <div className="flex justify-between text-logo-pink font-semibold">
                  <span>Revisiones Extra ({extraRevisions}):</span>
                  <span>+${breakdown.revisionsCost.toFixed(2)} MXN</span>
                </div>
              )}

              {breakdown.urgencySurcharge > 0 && (
                <div className="flex justify-between text-logo-orange font-semibold">
                  <span>Recargo por Urgencia ({urgencyLevel}):</span>
                  <span>+${breakdown.urgencySurcharge.toFixed(2)} MXN</span>
                </div>
              )}

              {breakdown.paymentSurcharge > 0 && (
                <div className="flex justify-between text-logo-cyan font-semibold">
                  <span>Comisión por pago ({paymentMethod}):</span>
                  <span>+${breakdown.paymentSurcharge.toFixed(2)} MXN</span>
                </div>
              )}

              {breakdown.deliveryFee > 0 && (
                <div className="flex justify-between text-cream font-semibold">
                  <span>Gastos de Envío ({deliveryType}):</span>
                  <span>+${breakdown.deliveryFee.toFixed(2)} MXN</span>
                </div>
              )}

              <div className="w-full h-px bg-cream/15 my-1" />

              {/* Total Requerido */}
              <div className="flex justify-between text-base font-extrabold text-cream">
                <span>Total de Pedido:</span>
                <span className="text-xl font-black text-logo-yellow font-mono">${breakdown.total.toFixed(2)} MXN</span>
              </div>

              <div className="w-full h-px bg-cream/15 my-1" />

              {/* 50% Anticipo */}
              <div className="flex justify-between text-sm font-bold text-cream bg-white/5 p-3 rounded-xl border border-white/10 items-center">
                <span className="flex flex-col gap-0.5">
                  <span>Anticipo del 50%:</span>
                  <span className="text-[9px] font-normal text-cream/50">Requerido para iniciar</span>
                </span>
                <span className="text-lg font-black text-logo-pink font-mono">${breakdown.depositRequired.toFixed(2)} MXN</span>
              </div>

              {/* 50% Saldo */}
              <div className="flex justify-between text-xs text-cream/70 px-1">
                <span>Saldo restante del 50%:</span>
                <span className="font-bold">${breakdown.balanceDue.toFixed(2)} MXN</span>
              </div>

            </div>
          ) : (
            <p className="text-xs text-cream/50 py-8 text-center">Selecciona un producto para cargar los costos.</p>
          )}

        </div>

        {/* Políticas y Condiciones */}
        <div className="bg-logo-pink/10 border border-logo-pink/20 rounded-3xl p-6 flex gap-4">
          <Info className="w-6 h-6 text-logo-pink shrink-0" />
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-forest text-xs uppercase tracking-wide">Condiciones Comerciales</h4>
            <p className="text-[11px] text-forest/70 leading-relaxed">
              {COMMERCIAL_LEGEND}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function QuoteCalculator() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-cream py-12 px-6">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-forest/60">Cargando cotizador...</p>
          </div>
        }>
          <QuoteCalculatorContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
