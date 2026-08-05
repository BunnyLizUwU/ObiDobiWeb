'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Inbox, Calendar as CalIcon, Users, Settings, LogOut, 
  Search, Phone, Check, RefreshCw, Send, AlertTriangle, 
  Plus, Minus, Clock, DollarSign, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getQuotes, updateQuoteStatus, updateQuoteRevisions, uploadReceiptUrl, getQuoteSettings } from '../../lib/db';
import { Quote, QuoteStatus, QuoteSettings } from '../../lib/types';
import LogoBubbles from '../../components/LogoBubbles';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // States
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [settings, setSettings] = useState<QuoteSettings | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'inbox' | 'calendar' | 'clients'>('inbox');
  
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail edits
  const [revisionsCount, setRevisionsCount] = useState(0);
  const [updatingDetails, setUpdatingDetails] = useState(false);

  // Verificación de autenticación
  useEffect(() => {
    async function checkAuth() {
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/admin/login');
        } else {
          setAuthorized(true);
        }
      } else {
        const localLogged = sessionStorage.getItem('obidobi_admin_logged');
        if (localLogged !== 'true') {
          router.push('/admin/login');
        } else {
          setAuthorized(true);
        }
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  // Cargar datos
  const loadData = async () => {
    try {
      const [qs, setts] = await Promise.all([getQuotes(), getQuoteSettings()]);
      setQuotes(qs);
      setSettings(setts);
      if (qs.length > 0 && !selectedQuoteId) {
        setSelectedQuoteId(qs[0].id);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    if (authorized) {
      loadData();
    }
  }, [authorized]);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      sessionStorage.removeItem('obidobi_admin_logged');
    }
    router.push('/admin/login');
  };

  // Filtrado de cotizaciones
  const filteredQuotes = quotes.filter(q => {
    // Filtrado por estado
    const matchesStatus = statusFilter === 'todas' || q.status === statusFilter;
    
    // Filtrado por buscador
    const matchesSearch = 
      q.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.folio && q.folio.toString().includes(searchQuery)) ||
      (q.product_title && q.product_title.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const selectedQuote = quotes.find(q => q.id === selectedQuoteId);

  // Sincronizar campo de revisiones
  useEffect(() => {
    if (selectedQuote) {
      setRevisionsCount(selectedQuote.extra_revisions_count || 0);
    }
  }, [selectedQuoteId, selectedQuote]);

  // Manejar cambio de estado
  const handleStatusChange = async (status: QuoteStatus) => {
    if (!selectedQuoteId) return;
    const ok = await updateQuoteStatus(selectedQuoteId, status);
    if (ok) {
      setQuotes(prev => prev.map(q => q.id === selectedQuoteId ? { ...q, status } : q));
    }
  };

  // Recalcular costo con revisiones extras
  const handleUpdateRevisions = async (newCount: number) => {
    if (!selectedQuote || !settings) return;
    
    setUpdatingDetails(true);
    const difference = newCount - (selectedQuote.extra_revisions_count || 0);
    const extraCost = difference * settings.extra_revision_fee;
    
    const newRevisionsCount = newCount;
    const newRevisionsCost = (selectedQuote.extra_revisions_cost || 0) + extraCost;
    const newTotal = Number(selectedQuote.total_amount) + extraCost;
    const newDeposit = newTotal * 0.5;

    const ok = await updateQuoteRevisions(
      selectedQuote.id,
      newRevisionsCount,
      newRevisionsCost,
      newTotal,
      newDeposit
    );

    if (ok) {
      setQuotes(prev => prev.map(q => q.id === selectedQuote.id ? { 
        ...q, 
        extra_revisions_count: newRevisionsCount,
        extra_revisions_cost: newRevisionsCost,
        total_amount: newTotal,
        deposit_amount: newDeposit
      } : q));
      setRevisionsCount(newRevisionsCount);
    }
    setUpdatingDetails(false);
  };

  // Simular aprobación de anticipo
  const handleVerifyPayment = async () => {
    if (!selectedQuote) return;
    const ok = await uploadReceiptUrl(selectedQuote.id, 'https://example.com/receipt-placeholder.png');
    if (ok) {
      setQuotes(prev => prev.map(q => q.id === selectedQuote.id ? { 
        ...q, 
        status: 'anticipo_recibido', 
        payment_receipt_url: 'https://example.com/receipt-placeholder.png' 
      } : q));
    }
  };

  // Generador de plantillas de WhatsApp
  const generateWhatsAppLink = (templateType: 'cotizacion' | 'boceto' | 'listo') => {
    if (!selectedQuote) return '';
    
    const clientPhoneClean = selectedQuote.client_phone.replace(/\D/g, '');
    const phone = clientPhoneClean.startsWith('52') ? clientPhoneClean : `52${clientPhoneClean}`;
    const folio = selectedQuote.folio || '0000';
    const clientName = selectedQuote.client_name;
    const product = selectedQuote.product_title || 'Pedido';
    const total = selectedQuote.total_amount.toFixed(2);
    const deposit = selectedQuote.deposit_amount.toFixed(2);
    const balance = (selectedQuote.total_amount * 0.5).toFixed(2);
    
    let text = '';
    if (templateType === 'cotizacion') {
      text = `Hola *${clientName}*! Te comparto la cotización oficial para tu pedido de papelería creativa en Obi Dobi (Folio: #${folio}). ✨\n\n` +
        `*Detalles del pedido:*\n` +
        `- Producto: ${product}\n` +
        `- Cantidad: ${selectedQuote.quantity || 1} pzas\n\n` +
        `*Presupuesto:*\n` +
        `- Total Estimado: *$${total} MXN*\n` +
        `- Anticipo Requerido (50%): *$${deposit} MXN*\n` +
        `- Saldo Restante (50%): *$${balance} MXN*\n\n` +
        `Para iniciar a trabajar en tus bocetos, por favor compárteme tu comprobante de pago por este medio. Quedo atenta! ❤️`;
    } else if (templateType === 'boceto') {
      text = `Hola *${clientName}*! ¡Excelentes noticias! El boceto preliminar para tu pedido #${folio} está listo para tu revisión. 🎨\n\n` +
        `Por favor avísame si hay algún detalle de diseño que quieras modificar. Recuerda que tu pedido incluye 2 rondas gratis de cambios.`;
    } else if (templateType === 'listo') {
      text = `Hola *${clientName}*! ¡Tu pedido #${folio} (*${product}*) está terminado y listo para entrega! 🥳🎉\n\n` +
        `- Saldo pendiente a liquidar (50%): *$${balance} MXN*\n\n` +
        `Dime cuándo te gustaría pasar por él o coordinamos la entrega según lo acordado. ¡Muchas gracias por tu confianza! 🌸`;
    }

    const encoded = encodeURIComponent(text);
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`;
  };

  // Agrupar clientes para el Directorio
  const getClientDirectory = () => {
    const clientsMap: Record<string, { name: string; phone: string; count: number; totalSpent: number }> = {};
    quotes.forEach(q => {
      const key = q.client_phone;
      if (!clientsMap[key]) {
        clientsMap[key] = {
          name: q.client_name,
          phone: q.client_phone,
          count: 0,
          totalSpent: 0
        };
      }
      clientsMap[key].count += 1;
      // Solo sumamos lo pagado si ya se recibió anticipo o está terminado
      if (q.status !== 'pendiente' && q.status !== 'cancelado') {
        clientsMap[key].totalSpent += Number(q.total_amount);
      }
    });
    return Object.values(clientsMap);
  };

  // Obtener cotizaciones del calendario (ordenadas por fecha límite)
  const getCalendarQuotes = () => {
    return [...quotes]
      .filter(q => q.status !== 'cancelado' && q.status !== 'listo_entrega' && q.event_date)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  };

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream gap-4">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-forest/60">Verificando acceso...</p>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      
      {/* HEADER DE PANEL */}
      <header className="bg-forest text-cream px-6 py-4 flex items-center justify-between border-b border-white/10 shadow">
        <div className="flex items-center gap-4">
          <LogoBubbles size="sm" className="scale-90 origin-left" />
          <div className="hidden sm:block w-px h-8 bg-white/20" />
          <div className="hidden sm:block text-xs text-cream/70 font-semibold tracking-widest uppercase">
            Panel de Control
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white/10 hover:bg-logo-red hover:text-white rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </header>

      {/* SUB-NAVBAR TABS */}
      <div className="bg-white border-b border-forest/10 px-6 py-3 flex gap-2">
        <button
          onClick={() => setSelectedTab('inbox')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            selectedTab === 'inbox' ? 'bg-forest text-cream shadow' : 'text-forest/70 hover:bg-forest/5'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Bandeja de Pedidos ({quotes.length})
        </button>
        
        <button
          onClick={() => setSelectedTab('calendar')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            selectedTab === 'calendar' ? 'bg-forest text-cream shadow' : 'text-forest/70 hover:bg-forest/5'
          }`}
        >
          <CalIcon className="w-4 h-4" />
          Calendario de Entregas ({getCalendarQuotes().length})
        </button>

        <button
          onClick={() => setSelectedTab('clients')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            selectedTab === 'clients' ? 'bg-forest text-cream shadow' : 'text-forest/70 hover:bg-forest/5'
          }`}
        >
          <Users className="w-4 h-4" />
          Directorio de Clientes ({getClientDirectory().length})
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* 1. SECCIÓN BANDEJA DE ENTRADA */}
        {selectedTab === 'inbox' && (
          <>
            {/* Listado Izquierdo (5 Columnas) */}
            <div className="w-full lg:w-5/12 bg-white border-r border-forest/10 flex flex-col">
              
              {/* Buscador y Estado */}
              <div className="p-4 border-b border-forest/5 flex flex-col gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-forest/40" />
                  <input
                    type="text"
                    placeholder="Buscar cliente, folio o producto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-forest/15 text-sm font-semibold focus:outline-none focus:border-logo-pink"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[10px] uppercase font-bold text-forest/40">Filtro:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs font-bold border border-forest/15 rounded-lg px-2 py-1 bg-cream text-forest focus:outline-none"
                  >
                    <option value="todas">Todas</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="boceto_enviado">Boceto Enviado</option>
                    <option value="anticipo_recibido">Anticipo Recibido</option>
                    <option value="en_produccion">En Producción</option>
                    <option value="listo_entrega">Listos p/ Entrega</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                </div>
              </div>

              {/* Lista Scroll */}
              <div className="flex-1 overflow-y-auto divide-y divide-forest/5">
                {filteredQuotes.length === 0 ? (
                  <p className="text-xs text-center py-12 text-forest/40">No hay cotizaciones registradas</p>
                ) : (
                  filteredQuotes.map((q) => {
                    const statusStyles: Record<string, string> = {
                      pendiente: 'bg-logo-yellow/10 text-logo-orange border-logo-yellow/30',
                      boceto_enviado: 'bg-primary-blue/10 text-primary-blue border-primary-blue/20',
                      anticipo_recibido: 'bg-logo-cyan/10 text-logo-cyan border-logo-cyan/20',
                      en_produccion: 'bg-logo-orange/10 text-logo-orange border-logo-orange/20',
                      listo_entrega: 'bg-logo-green/10 text-logo-green border-logo-green/20',
                      cancelado: 'bg-logo-red/10 text-logo-red border-logo-red/20'
                    };

                    const statusLabels: Record<string, string> = {
                      pendiente: 'Pendiente',
                      boceto_enviado: 'Boceto',
                      anticipo_recibido: 'Anticipo',
                      en_produccion: 'Producción',
                      listo_entrega: 'Listo',
                      cancelado: 'Cancelado'
                    };

                    const isSelected = q.id === selectedQuoteId;
                    const dateText = q.event_date ? new Date(q.event_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : 'Sin fecha';

                    return (
                      <button
                        key={q.id}
                        onClick={() => setSelectedQuoteId(q.id)}
                        className={`w-full text-left p-4 transition-colors flex items-center justify-between gap-4 ${
                          isSelected ? 'bg-cream' : 'hover:bg-forest/5'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-extrabold text-forest">#{q.folio || '0000'}</span>
                            <span className="text-[10px] font-bold text-forest/50 font-mono">{dateText}</span>
                            {q.urgency_level !== 'normal' && (
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                q.urgency_level === 'urgente' ? 'bg-logo-red text-white animate-pulse' : 'bg-logo-orange text-white'
                              }`}>
                                {q.urgency_level}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-bold text-sm text-forest truncate">{q.client_name}</h4>
                          <p className="text-xs text-forest/60 truncate">{q.product_title} x{q.quantity || 1}</p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-sm font-black font-mono text-forest">${q.total_amount.toFixed(2)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusStyles[q.status]}`}>
                            {statusLabels[q.status]}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Detalle Derecho (7 Columnas) */}
            <div className="flex-1 bg-cream p-6 overflow-y-auto">
              {selectedQuote ? (
                <div className="max-w-xl mx-auto flex flex-col gap-6 bg-white rounded-3xl border border-forest/5 p-6 md:p-8 shadow-sm">
                  
                  {/* Folio y Estado General */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/5 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-logo-pink">Detalles del Pedido</span>
                      <h2 className="text-xl font-extrabold text-forest">Folio: #{selectedQuote.folio}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest/50">Estado:</span>
                      <select
                        value={selectedQuote.status}
                        onChange={(e) => handleStatusChange(e.target.value as QuoteStatus)}
                        className="text-xs font-bold border border-forest/15 rounded-lg px-2.5 py-1.5 bg-cream text-forest focus:outline-none cursor-pointer"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="boceto_enviado">Boceto Enviado</option>
                        <option value="anticipo_recibido">Anticipo Recibido</option>
                        <option value="en_produccion">En Producción</option>
                        <option value="listo_entrega">Listo para Entrega</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  {/* Ficha de Cliente */}
                  <div className="grid grid-cols-2 gap-4 bg-cream rounded-2xl p-4 text-xs">
                    <div>
                      <span className="text-[10px] text-forest/40 uppercase font-bold block mb-0.5">Cliente</span>
                      <span className="font-bold text-forest block">{selectedQuote.client_name}</span>
                      <span className="text-[10px] text-forest/60">{selectedQuote.client_phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-forest/40 uppercase font-bold block mb-0.5">Fecha del Evento</span>
                      <span className="font-bold text-forest block">{selectedQuote.event_date || 'No especificada'}</span>
                      <span className="text-[10px] text-forest/60">Entrega: {selectedQuote.delivery_type}</span>
                    </div>
                  </div>

                  {/* Insumos & Cantidad */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-extrabold text-forest/50 mb-2">Producto y Personalización</h4>
                    <div className="bg-white border border-forest/10 rounded-2xl p-4 flex flex-col gap-2">
                      <div className="flex justify-between text-sm font-bold text-forest">
                        <span>{selectedQuote.product_title}</span>
                        <span>x{selectedQuote.quantity || 1} pzas</span>
                      </div>
                      {selectedQuote.notes && (
                        <p className="text-xs text-forest/70 bg-cream/50 p-2.5 rounded-lg border border-forest/5 mt-1 leading-relaxed">
                          <span className="font-bold block text-[10px] text-forest/40 uppercase mb-0.5">Notas del diseño:</span>
                          "{selectedQuote.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* AJUSTADOR DE REVISIONES EXTRAS */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-extrabold text-forest/50 mb-2">Revisiones de Diseño</h4>
                    <div className="bg-white border border-forest/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="text-xs">
                        <span className="font-bold text-forest block">Rondas de cambios adicionales</span>
                        <span className="text-forest/60">Incluye 2 gratis. Costo extra: ${settings?.extra_revision_fee || 50} c/u</span>
                      </div>
                      
                      <div className="flex items-center gap-3 border border-forest/15 rounded-xl px-2 py-1">
                        <button
                          onClick={() => handleUpdateRevisions(Math.max(0, revisionsCount - 1))}
                          disabled={revisionsCount === 0 || updatingDetails}
                          className="p-1 hover:bg-forest/5 rounded text-forest disabled:opacity-30"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-extrabold text-forest">{revisionsCount}</span>
                        <button
                          onClick={() => handleUpdateRevisions(revisionsCount + 1)}
                          disabled={updatingDetails}
                          className="p-1 hover:bg-forest/5 rounded text-forest"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COMPROBANTE DE ANTICIPO */}
                  {selectedQuote.status === 'pendiente' && (
                    <div className="border border-logo-yellow bg-logo-yellow/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="text-xs">
                        <span className="font-bold text-forest block">Verificar Anticipo de Pago (50%)</span>
                        <span className="text-forest/60">¿El cliente ya envió su comprobante de transferencia/efectivo?</span>
                      </div>
                      <button
                        onClick={handleVerifyPayment}
                        className="px-4 py-2 bg-logo-green hover:bg-logo-green/95 text-forest font-bold text-xs rounded-xl shadow-sm transition-all"
                      >
                        Validar Pago
                      </button>
                    </div>
                  )}

                  {selectedQuote.payment_receipt_url && (
                    <div className="border border-logo-green bg-logo-green/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="text-xs flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-logo-green" />
                        <div>
                          <span className="font-bold text-forest block">Pago del 50% Verificado</span>
                          <span className="text-forest/60">Comprobante validado correctamente por Debanhi.</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-logo-green uppercase border border-logo-green/30 px-2 py-0.5 rounded-full">Aprobado</span>
                    </div>
                  )}

                  {/* DESGLOSE FINANCIERO */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-extrabold text-forest/50 mb-2">Desglose de Costos</h4>
                    <div className="bg-cream border border-forest/5 rounded-2xl p-4 flex flex-col gap-2.5 text-xs text-forest/70">
                      <div className="flex justify-between">
                        <span>Total del Pedido:</span>
                        <span className="font-bold text-forest font-mono">${selectedQuote.total_amount.toFixed(2)} MXN</span>
                      </div>
                      <div className="flex justify-between text-logo-pink font-semibold">
                        <span>Anticipo 50% Recibido:</span>
                        <span className="font-mono">${selectedQuote.deposit_amount.toFixed(2)} MXN</span>
                      </div>
                      <div className="flex justify-between font-bold text-forest border-t border-forest/5 pt-2 text-sm">
                        <span>Saldo pendiente (50%):</span>
                        <span className="font-mono text-base font-black text-logo-orange">${(selectedQuote.total_amount * 0.5).toFixed(2)} MXN</span>
                      </div>
                    </div>
                  </div>

                  {/* GENERADOR DE MENSAJES RÁPIDOS WHATSAPP */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-extrabold text-forest/50 mb-2">Respuestas Rápidas por WhatsApp</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={generateWhatsAppLink('cotizacion')}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-forest/15 hover:bg-forest/5 text-center group transition-all"
                      >
                        <Send className="w-4 h-4 text-primary-blue" />
                        <span className="text-[10px] font-bold text-forest">Aviso de Cotización</span>
                      </a>
                      <a
                        href={generateWhatsAppLink('boceto')}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-forest/15 hover:bg-forest/5 text-center group transition-all"
                      >
                        <RefreshCw className="w-4 h-4 text-logo-orange animate-spin" style={{ animationDuration: '6s' }} />
                        <span className="text-[10px] font-bold text-forest">Envío de Boceto</span>
                      </a>
                      <a
                        href={generateWhatsAppLink('listo')}
                        target="_blank"
                        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-forest/15 hover:bg-forest/5 text-center group transition-all"
                      >
                        <Check className="w-4 h-4 text-logo-green" />
                        <span className="text-[10px] font-bold text-forest">Notificación Listo</span>
                      </a>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-forest/35">
                  <Inbox className="w-12 h-12 mb-2" />
                  <p className="text-sm font-semibold">Selecciona un pedido para ver los detalles</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* 2. SECCIÓN CALENDARIO DE ENTREGAS */}
        {selectedTab === 'calendar' && (
          <div className="flex-1 bg-cream p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-forest/5 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-forest mb-6 flex items-center gap-2">
                <CalIcon className="w-6 h-6 text-logo-orange" />
                Cronograma de Entregas Prioritarias
              </h2>

              <div className="flex flex-col gap-4">
                {getCalendarQuotes().length === 0 ? (
                  <p className="text-xs text-center py-12 text-forest/40">No hay entregas pendientes calendarizadas</p>
                ) : (
                  getCalendarQuotes().map((q) => {
                    const diffDays = Math.ceil((new Date(q.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const statusLabels: Record<string, string> = {
                      pendiente: 'Pendiente Anticipo',
                      boceto_enviado: 'Boceto Enviado',
                      anticipo_recibido: 'Anticipo Listo',
                      en_produccion: 'En Producción',
                      listo_entrega: 'Terminado'
                    };

                    return (
                      <div 
                        key={q.id}
                        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border transition-all ${
                          q.urgency_level === 'urgente' 
                            ? 'border-logo-red/40 bg-logo-red/5' 
                            : q.urgency_level === 'express'
                              ? 'border-logo-orange/40 bg-logo-orange/5'
                              : 'border-forest/10 bg-cream/10'
                        }`}
                      >
                        <div className="mb-3 sm:mb-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-black text-forest">#{q.folio}</span>
                            <span className="text-xs font-semibold text-forest/75">{q.client_name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                              q.urgency_level === 'urgente' ? 'bg-logo-red text-white' : q.urgency_level === 'express' ? 'bg-logo-orange text-white' : 'bg-primary-blue/20 text-primary-blue'
                            }`}>
                              {q.urgency_level}
                            </span>
                          </div>
                          
                          <p className="text-xs text-forest/60 font-bold">{q.product_title} x{q.quantity || 1}</p>
                        </div>

                        <div className="flex flex-col sm:items-end gap-1 shrink-0 text-left sm:text-right">
                          <span className="text-xs font-extrabold text-forest flex items-center gap-1.5">
                            📅 {q.event_date}
                            <span className="text-[10px] font-normal text-forest/50">
                              ({diffDays === 0 ? 'Hoy' : diffDays === 1 ? 'Mañana' : `En ${diffDays} días`})
                            </span>
                          </span>
                          <span className="text-[10px] text-forest/50 font-bold">Estado: {statusLabels[q.status] || q.status}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. SECCIÓN DIRECTORIO DE CLIENTES */}
        {selectedTab === 'clients' && (
          <div className="flex-1 bg-cream p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-forest/5 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-forest mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary-blue" />
                Directorio de Clientes de Acámbaro
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-forest/10 text-xs font-bold text-forest/40 uppercase">
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Celular/WhatsApp</th>
                      <th className="py-3 px-4 text-center">Pedidos</th>
                      <th className="py-3 px-4 text-right">Monto total facturado</th>
                      <th className="py-3 px-4 text-right">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/5 text-xs text-forest/80">
                    {getClientDirectory().map((c) => (
                      <tr key={c.phone} className="hover:bg-cream/40">
                        <td className="py-4 px-4 font-bold text-forest">{c.name}</td>
                        <td className="py-4 px-4 font-mono">{c.phone}</td>
                        <td className="py-4 px-4 text-center font-bold">{c.count}</td>
                        <td className="py-4 px-4 text-right font-bold text-logo-pink font-mono">${c.totalSpent.toFixed(2)} MXN</td>
                        <td className="py-4 px-4 text-right">
                          <a
                            href={`https://api.whatsapp.com/send?phone=52${c.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-logo-green hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5 fill-logo-green text-white" />
                            Escribir
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
