'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Inbox, Calendar as CalIcon, Users, Settings, LogOut, 
  Search, Phone, Check, RefreshCw, Send, AlertTriangle, 
  Plus, Minus, Clock, DollarSign, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  getQuotes, updateQuoteStatus, updateQuoteRevisions, uploadReceiptUrl, getQuoteSettings,
  getCategories, getProducts, getMaterials, getProductMaterials, createProduct, deleteProduct,
  createMaterial, updateMaterial, deleteMaterial
} from '../../lib/db';
import { Quote, QuoteStatus, QuoteSettings, Product, Material, Category } from '../../lib/types';
import LogoBubbles from '../../components/LogoBubbles';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // States
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [settings, setSettings] = useState<QuoteSettings | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'inbox' | 'calendar' | 'clients' | 'catalog'>('inbox');
  
  // Catalog & Materials States
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [selectedSubTab, setSelectedSubTab] = useState<'products' | 'materials'>('products');
  
  // Material Form
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [matName, setMatName] = useState('');
  const [matUnit, setMatUnit] = useState('pza');
  const [matCost, setMatCost] = useState(0);
  const [matWaste, setMatWaste] = useState(0);
  
  // Material Calculator Helper
  const [useCalcHelper, setUseCalcHelper] = useState(false);
  const [calcPkgCost, setCalcPkgCost] = useState('');
  const [calcPkgQty, setCalcPkgQty] = useState('');

  // Product Form
  const [showProductForm, setShowProductForm] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodMinutes, setProdMinutes] = useState(0);
  const [prodIsDigital, setProdIsDigital] = useState(false);
  const [prodSelectedMaterials, setProdSelectedMaterials] = useState<Record<string, number>>({});

  
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
      const [qs, setts, cats, prods, mats] = await Promise.all([
        getQuotes(), 
        getQuoteSettings(),
        getCategories(),
        getProducts(),
        getMaterials()
      ]);
      setQuotes(qs);
      setSettings(setts);
      setCategories(cats);
      setProductsList(prods);
      setMaterialsList(mats);
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

  // --- GESTIÓN DE MATERIALES ---
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matName.trim()) return;

    let finalCost = matCost;
    if (useCalcHelper && calcPkgCost && calcPkgQty) {
      const costVal = parseFloat(calcPkgCost) || 0;
      const qtyVal = parseFloat(calcPkgQty) || 0;
      if (qtyVal > 0) {
        finalCost = costVal / qtyVal;
      }
    }

    if (editingMaterial) {
      const updated: Material = {
        ...editingMaterial,
        name: matName,
        unit_measure: matUnit,
        unit_cost: finalCost,
        waste_percentage: matWaste
      };
      const ok = await updateMaterial(updated);
      if (ok) {
        setMaterialsList(prev => prev.map(m => m.id === editingMaterial.id ? updated : m));
        setShowMaterialForm(false);
        setEditingMaterial(null);
      }
    } else {
      const data: Omit<Material, 'id'> = {
        name: matName,
        unit_measure: matUnit,
        unit_cost: finalCost,
        waste_percentage: matWaste
      };
      const created = await createMaterial(data);
      if (created) {
        setMaterialsList(prev => [...prev, created]);
        setShowMaterialForm(false);
      }
    }
    // Limpiar formulario
    setMatName('');
    setMatCost(0);
    setMatWaste(0);
    setMatUnit('pza');
    setUseCalcHelper(false);
    setCalcPkgCost('');
    setCalcPkgQty('');
  };

  const handleEditMaterialClick = (material: Material) => {
    setEditingMaterial(material);
    setMatName(material.name);
    setMatUnit(material.unit_measure);
    setMatCost(material.unit_cost);
    setMatWaste(material.waste_percentage);
    setUseCalcHelper(false);
    setShowMaterialForm(true);
  };

  const handleDeleteMaterialClick = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar este material? Esto afectará las cotizaciones de los productos que lo utilicen.')) return;
    const ok = await deleteMaterial(id);
    if (ok) {
      setMaterialsList(prev => prev.filter(m => m.id !== id));
    }
  };

  // --- GESTIÓN DE PRODUCTOS ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim()) return;

    // Compilar relaciones de materiales seleccionados
    const materialsMapping = Object.entries(prodSelectedMaterials)
      .filter(([_, qty]) => qty > 0)
      .map(([matId, qty]) => ({
        materialId: matId,
        quantity: qty
      }));

    const data: Omit<Product, 'id'> = {
      title: prodTitle,
      description: prodDesc,
      category_id: prodCategory || categories[0]?.id || '',
      estimated_minutes: prodMinutes,
      is_digital: prodIsDigital,
      images: ['/placeholder_producto.png']
    };

    const created = await createProduct(data, materialsMapping);
    if (created) {
      setProductsList(prev => [...prev, created]);
      setShowProductForm(false);
      
      // Limpiar formulario
      setProdTitle('');
      setProdDesc('');
      setProdCategory(categories[0]?.id || '');
      setProdMinutes(0);
      setProdIsDigital(false);
      setProdSelectedMaterials({});
    }
  };

  const handleDeleteProductClick = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar este producto del catálogo?')) return;
    const ok = await deleteProduct(id);
    if (ok) {
      setProductsList(prev => prev.filter(p => p.id !== id));
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

        <button
          onClick={() => setSelectedTab('catalog')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            selectedTab === 'catalog' ? 'bg-forest text-cream shadow' : 'text-forest/70 hover:bg-forest/5'
          }`}
        >
          <Settings className="w-4 h-4" />
          Catálogo & Insumos
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

        {/* 4. GESTIÓN DE CATÁLOGO Y MATERIALES */}
        {selectedTab === 'catalog' && (
          <div className="flex-1 bg-cream p-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              
              {/* Encabezado y Sub-Navegación */}
              <div className="bg-white rounded-3xl border border-forest/5 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-forest mb-1">Catálogo e Insumos</h2>
                  <p className="text-xs text-forest/50">Crea nuevos productos y gestiona los precios base de los materiales para el cotizador.</p>
                </div>
                <div className="flex bg-cream p-1.5 rounded-2xl gap-1 shrink-0 border border-forest/5">
                  <button
                    onClick={() => { setSelectedSubTab('products'); setShowProductForm(false); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                      selectedSubTab === 'products' ? 'bg-forest text-cream shadow-sm' : 'text-forest/70 hover:bg-forest/5'
                    }`}
                  >
                    Productos
                  </button>
                  <button
                    onClick={() => { setSelectedSubTab('materials'); setShowMaterialForm(false); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                      selectedSubTab === 'materials' ? 'bg-forest text-cream shadow-sm' : 'text-forest/70 hover:bg-forest/5'
                    }`}
                  >
                    Materiales / Insumos
                  </button>
                </div>
              </div>

              {/* CONTENIDO PRODUCTOS */}
              {selectedSubTab === 'products' && (
                <div className="bg-white rounded-3xl border border-forest/5 p-6 shadow-sm">
                  {!showProductForm ? (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-forest uppercase tracking-wider">Productos del Catálogo</h3>
                        <button
                          onClick={() => {
                            setProdTitle('');
                            setProdDesc('');
                            setProdCategory(categories[0]?.id || '');
                            setProdMinutes(30);
                            setProdIsDigital(false);
                            setProdSelectedMaterials({});
                            setShowProductForm(true);
                          }}
                          className="flex items-center gap-1 px-4 py-2 bg-logo-pink text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-logo-pink/90 transition-all shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar Producto
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-forest/10 text-xs font-bold text-forest/40 uppercase">
                              <th className="py-3 px-4">Producto</th>
                              <th className="py-3 px-4">Categoría</th>
                              <th className="py-3 px-4 text-center">Labor (Mins)</th>
                              <th className="py-3 px-4 text-center">Tipo</th>
                              <th className="py-3 px-4 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-forest/5 text-xs text-forest/80">
                            {productsList.map((p) => {
                              const categoryName = categories.find(c => c.id === p.category_id)?.name || 'Sin Categoría';
                              return (
                                <tr key={p.id} className="hover:bg-cream/40">
                                  <td className="py-4 px-4 font-bold text-forest flex items-center gap-2">
                                    <span className="text-base">📦</span>
                                    {p.title}
                                  </td>
                                  <td className="py-4 px-4 font-semibold text-forest/70">{categoryName}</td>
                                  <td className="py-4 px-4 text-center font-mono font-bold">{p.estimated_minutes} min</td>
                                  <td className="py-4 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                      p.is_digital ? 'bg-primary-blue/15 text-primary-blue' : 'bg-logo-green/15 text-logo-green'
                                    }`}>
                                      {p.is_digital ? 'Digital' : 'Físico'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    <button
                                      onClick={() => handleDeleteProductClick(p.id)}
                                      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-logo-red bg-logo-red/10 hover:bg-logo-red hover:text-white rounded-lg transition-all"
                                    >
                                      Eliminar
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    // FORMULARIO CREAR PRODUCTO
                    <form onSubmit={handleSaveProduct} className="flex flex-col gap-6 max-w-2xl mx-auto">
                      <h3 className="text-base font-black text-forest border-b border-forest/10 pb-2">Agregar Nuevo Producto al Catálogo</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">Título del Producto</label>
                          <input type="text" required placeholder="ej. Pastel Personalizado de Boda" value={prodTitle} onChange={(e) => setProdTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-forest/15 text-sm font-semibold focus:outline-none focus:border-logo-pink" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">Categoría</label>
                          <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-forest/15 text-sm font-semibold focus:outline-none focus:border-logo-pink">
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">Descripción</label>
                        <textarea required placeholder="Escribe para qué sirve y qué incluye..." value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-forest/15 text-sm font-medium focus:outline-none focus:border-logo-pink h-20" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">Tiempo Estimado de Trabajo (Minutos)</label>
                          <input type="number" min={5} required value={prodMinutes} onChange={(e) => setProdMinutes(parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 rounded-xl border border-forest/15 text-sm font-semibold focus:outline-none focus:border-logo-pink" />
                        </div>
                        <div className="flex items-center mt-6">
                          <label className="flex items-center gap-2 text-sm font-semibold text-forest cursor-pointer">
                            <input type="checkbox" checked={prodIsDigital} onChange={(e) => setProdIsDigital(e.target.checked)} className="rounded border-forest/20 text-logo-pink focus:ring-logo-pink" />
                            ¿Es un producto Digital? (ej. Invitación en web)
                          </label>
                        </div>
                      </div>

                      {/* ASOCIACIÓN DE INSUMOS */}
                      <div className="border-t border-dashed border-forest/10 pt-4">
                        <h4 className="text-xs font-black uppercase text-forest/60 tracking-wider mb-3">Insumos y Materiales Utilizados (Para Cotización)</h4>
                        <p className="text-[10px] text-forest/40 mb-4">Marca los materiales que consume la unidad de este producto y la cantidad exacta que usa.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto border border-forest/5 p-4 rounded-2xl bg-cream/20">
                          {materialsList.map(mat => {
                            const isChecked = prodSelectedMaterials[mat.id] !== undefined;
                            const qty = prodSelectedMaterials[mat.id] || 0;
                            return (
                              <div key={mat.id} className="flex items-center justify-between gap-2 p-2 border-b border-forest/5 text-xs">
                                <label className="flex items-center gap-2 font-semibold text-forest cursor-pointer shrink-0 max-w-[200px] truncate">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setProdSelectedMaterials(prev => ({ ...prev, [mat.id]: mat.unit_measure === 'pza' ? 1 : 0.5 }));
                                      } else {
                                        setProdSelectedMaterials(prev => {
                                          const copy = { ...prev };
                                          delete copy[mat.id];
                                          return copy;
                                        });
                                      }
                                    }}
                                    className="rounded border-forest/20 text-logo-pink focus:ring-logo-pink"
                                  />
                                  {mat.name}
                                </label>

                                {isChecked && (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      step="0.0001"
                                      min="0.0001"
                                      value={qty}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setProdSelectedMaterials(prev => ({ ...prev, [mat.id]: val }));
                                      }}
                                      className="w-16 px-1.5 py-1 text-center font-bold border border-forest/20 rounded bg-white text-forest"
                                    />
                                    <span className="text-[10px] text-forest/50 font-bold">{mat.unit_measure}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 border-t border-forest/10 pt-4 mt-2">
                        <button
                          type="button"
                          onClick={() => setShowProductForm(false)}
                          className="px-5 py-2.5 border border-forest/10 hover:bg-forest/5 text-forest text-xs font-black uppercase rounded-xl transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-forest text-cream text-xs font-black uppercase rounded-xl hover:bg-forest/90 transition-all shadow-md"
                        >
                          Guardar Producto
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* CONTENIDO MATERIALES */}
              {selectedSubTab === 'materials' && (
                <div className="bg-white rounded-3xl border border-forest/5 p-6 shadow-sm">
                  {!showMaterialForm ? (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-forest uppercase tracking-wider">Inventario de Materiales & Costos</h3>
                        <button
                          onClick={() => {
                            setEditingMaterial(null);
                            setMatName('');
                            setMatUnit('pza');
                            setMatCost(0);
                            setMatWaste(0);
                            setUseCalcHelper(false);
                            setCalcPkgCost('');
                            setCalcPkgQty('');
                            setShowMaterialForm(true);
                          }}
                          className="flex items-center gap-1 px-4 py-2 bg-logo-green text-forest text-xs font-black uppercase tracking-wider rounded-xl hover:bg-logo-green/90 transition-all shadow-sm"
                        >
                          <Plus className="w-4 h-4 text-forest" />
                          Crear Insumo
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-forest/10 text-xs font-bold text-forest/40 uppercase">
                              <th className="py-3 px-4">Material / Insumo</th>
                              <th className="py-3 px-4 text-center">U. Medida</th>
                              <th className="py-3 px-4 text-right">Costo Unitario ($)</th>
                              <th className="py-3 px-4 text-center">Merma (%)</th>
                              <th className="py-3 px-4 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-forest/5 text-xs text-forest/80">
                            {materialsList.map((m) => (
                              <tr key={m.id} className="hover:bg-cream/40">
                                <td className="py-4 px-4 font-bold text-forest">{m.name}</td>
                                <td className="py-4 px-4 text-center font-mono">{m.unit_measure}</td>
                                <td className="py-4 px-4 text-right font-mono font-bold text-logo-pink">${Number(m.unit_cost).toFixed(2)} MXN</td>
                                <td className="py-4 px-4 text-center font-mono">{m.waste_percentage}%</td>
                                <td className="py-4 px-4 text-right flex justify-end gap-2">
                                  <button
                                    onClick={() => handleEditMaterialClick(m)}
                                    className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-forest bg-logo-yellow/20 hover:bg-logo-yellow rounded-lg transition-all"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMaterialClick(m.id)}
                                    className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-logo-red bg-logo-red/10 hover:bg-logo-red hover:text-white rounded-lg transition-all"
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    // FORMULARIO CREAR/EDITAR MATERIAL
                    <form onSubmit={handleSaveMaterial} className="flex flex-col gap-6 max-w-2xl mx-auto">
                      <h3 className="text-base font-black text-forest border-b border-forest/10 pb-2">
                        {editingMaterial ? `Editar Insumo: ${editingMaterial.name}` : 'Crear Nuevo Insumo / Material'}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">Nombre del Insumo</label>
                          <input type="text" required placeholder="ej. Acrílico Circular 5cm, Harina" value={matName} onChange={(e) => setMatName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-forest/15 text-sm font-semibold focus:outline-none focus:border-logo-pink" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">Unidad de Medida</label>
                          <select value={matUnit} onChange={(e) => setMatUnit(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-forest/15 text-sm font-semibold focus:outline-none focus:border-logo-pink">
                            <option value="pza">Pieza (pza)</option>
                            <option value="g">Gramo (g)</option>
                            <option value="m">Metro (m)</option>
                            <option value="ml">Mililitro (ml)</option>
                            <option value="cm2">Centímetro Cuadrado (cm²)</option>
                          </select>
                        </div>
                      </div>

                      {/* AYUDANTE DE COSTO PROPORCIONAL */}
                      <div className="bg-cream/40 p-4 rounded-2xl border border-forest/5 flex flex-col gap-3">
                        <label className="flex items-center gap-2 text-xs font-black uppercase text-forest/60 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useCalcHelper}
                            onChange={(e) => setUseCalcHelper(e.target.checked)}
                            className="rounded border-forest/20 text-logo-pink focus:ring-logo-pink"
                          />
                          Calcular costo unitario proporcional (por empaque/paquete)
                        </label>
                        
                        {useCalcHelper && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                            <div>
                              <label className="block text-[10px] font-bold text-forest/50 uppercase mb-1">Precio Total del Paquete ($)</label>
                              <input
                                type="number"
                                placeholder="ej. 30 (precio de bolsa harina)"
                                value={calcPkgCost}
                                onChange={(e) => setCalcPkgCost(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-forest/15 bg-white text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-forest/50 uppercase mb-1">Contenido / Cantidad en Paquete</label>
                              <div className="flex items-center gap-1.5 bg-white border border-forest/15 rounded-lg px-3 py-1">
                                <input
                                  type="number"
                                  placeholder="ej. 1000"
                                  value={calcPkgQty}
                                  onChange={(e) => setCalcPkgQty(e.target.value)}
                                  className="w-full text-xs font-semibold focus:outline-none"
                                />
                                <span className="text-[10px] text-forest/40 font-bold">{matUnit}</span>
                              </div>
                            </div>
                            
                            {calcPkgCost && calcPkgQty && parseFloat(calcPkgQty) > 0 && (
                              <div className="sm:col-span-2 text-xs font-bold text-logo-pink p-2 bg-logo-pink/5 rounded-lg">
                                Costo Unitario Calculado: ${(parseFloat(calcPkgCost) / parseFloat(calcPkgQty)).toFixed(4)} MXN por {matUnit}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">Costo Unitario ($ MXN)</label>
                          <input
                            type="number"
                            step="0.0001"
                            required
                            disabled={useCalcHelper}
                            placeholder="ej. 0.03"
                            value={useCalcHelper && calcPkgCost && calcPkgQty && parseFloat(calcPkgQty) > 0 ? (parseFloat(calcPkgCost) / parseFloat(calcPkgQty)).toFixed(4) : matCost}
                            onChange={(e) => setMatCost(parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2.5 rounded-xl border border-forest/15 text-sm font-semibold bg-white text-forest focus:outline-none disabled:bg-forest/5 disabled:text-forest/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">Porcentaje de Merma / Desperdicio (%)</label>
                          <input type="number" min={0} max={100} required placeholder="ej. 10" value={matWaste} onChange={(e) => setMatWaste(parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 rounded-xl border border-forest/15 text-sm font-semibold focus:outline-none focus:border-logo-pink" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 border-t border-forest/10 pt-4 mt-2">
                        <button
                          type="button"
                          onClick={() => { setShowMaterialForm(false); setEditingMaterial(null); }}
                          className="px-5 py-2.5 border border-forest/10 hover:bg-forest/5 text-forest text-xs font-black uppercase rounded-xl transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-forest text-cream text-xs font-black uppercase rounded-xl hover:bg-forest/90 transition-all shadow-md"
                        >
                          {editingMaterial ? 'Actualizar Insumo' : 'Guardar Insumo'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
