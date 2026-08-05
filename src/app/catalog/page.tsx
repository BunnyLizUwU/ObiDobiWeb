'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Calculator, Sparkles, Clock, ChevronRight, Tag } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getCategories, getProducts } from '../../lib/db';
import { Category, Product } from '../../lib/types';

export default function Catalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error('Error loading catalog data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  const getCategorySlug = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.slug : '';
  };

  // Ilustraciones CSS de reemplazo por si no hay fotos cargadas aún
  const getProductIllustration = (slug: string) => {
    switch (slug) {
      case 'invitaciones-digitales':
        return (
          <div className="w-full h-48 bg-gradient-to-br from-primary-blue/30 to-logo-cyan/20 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
            <div className="w-20 h-32 bg-white rounded-lg shadow-md border border-forest/10 p-2 flex flex-col justify-between relative transform rotate-6">
              <div className="w-full h-0.5 bg-logo-pink rounded-full" />
              <div className="text-center font-bold text-[8px] text-forest/70 leading-none">Invitación Digital</div>
              <div className="w-full py-0.5 bg-forest text-[6px] text-center text-cream rounded">VER DEMO</div>
            </div>
            <Sparkles className="absolute top-3 right-3 w-4 h-4 text-logo-yellow animate-bounce" />
          </div>
        );
      case 'tote-bags':
        return (
          <div className="w-full h-48 bg-gradient-to-br from-logo-orange/20 to-logo-yellow/20 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
            <div className="w-20 h-24 bg-cream border border-forest/15 rounded-b-md relative shadow-sm flex items-center justify-center">
              <div className="absolute -top-3 w-8 h-4 border border-forest/15 rounded-t-full" />
              <span className="text-lg">🌸</span>
            </div>
          </div>
        );
      case 'stickers':
        return (
          <div className="w-full h-48 bg-gradient-to-br from-logo-pink/20 to-logo-red/20 rounded-t-2xl flex items-center justify-center gap-2 relative overflow-hidden">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-[9px] text-forest shadow border border-logo-pink/20 transform -rotate-12">
              Sticker ⭐
            </div>
            <div className="w-12 h-12 bg-logo-yellow rounded-lg flex items-center justify-center font-bold text-[10px] text-forest shadow border border-white transform rotate-12">
              Cute ✨
            </div>
          </div>
        );
      case 'llaveros-resina':
        return (
          <div className="w-full h-48 bg-gradient-to-br from-logo-green/20 to-logo-cyan/20 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
            {/* Moño de listón */}
            <div className="absolute top-16 w-8 h-3 bg-logo-pink/80 rounded-full rotate-12 shadow-sm flex items-center justify-center text-[6px] text-white font-extrabold">🎀</div>
            {/* Placa acrílica circular */}
            <div className="w-12 h-12 bg-white/50 backdrop-blur-sm border-2 border-white rounded-full relative shadow flex items-center justify-center transform -rotate-12 mt-2">
              <div className="absolute top-1.5 left-5.5 w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span className="text-xs font-black text-forest/70">OD ⭐</span>
            </div>
          </div>
        );
      case 'postres-personalizados':
        return (
          <div className="w-full h-48 bg-gradient-to-br from-logo-pink/20 to-logo-yellow/20 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
            <div className="flex flex-col items-center">
              {/* Cereza */}
              <div className="w-3.5 h-3.5 bg-logo-red rounded-full animate-bounce shadow-sm z-10" />
              {/* Crema / Glaseado */}
              <div className="w-8 h-5 bg-white rounded-full -mt-1 shadow-sm border border-forest/5" />
              {/* Base Cupcake */}
              <div className="w-10 h-8 bg-logo-orange/60 rounded-b-lg border-t border-forest/10 relative shadow-sm" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }} />
            </div>
            <span className="absolute top-4 right-4 text-xs animate-float">🧁</span>
          </div>
        );
      default:
        return (
          <div className="w-full h-48 bg-forest/5 rounded-t-2xl flex items-center justify-center">
            <Tag className="w-8 h-8 text-forest/20" />
          </div>
        );
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream py-12 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Breadcrumb & Title */}
          <div className="flex items-center gap-1.5 text-xs text-forest/50 mb-3 uppercase tracking-wider font-semibold">
            <Link href="/" className="hover:text-forest">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-forest/80">Catálogo</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-forest mb-2 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-logo-pink" />
                Nuestro Catálogo
              </h1>
              <p className="text-sm text-forest/60 max-w-lg">
                Todos nuestros diseños son completamente personalizables. Si no encuentras el producto exacto, puedes cotizarlo a través del formulario o contactarnos.
              </p>
            </div>
            
            {/* Demo button if digital items exist */}
            <Link 
              href="/demos/invitation" 
              className="bg-logo-pink/10 hover:bg-logo-pink/20 text-logo-pink border border-logo-pink/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all self-start md:self-auto flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ver Demo Invitación Boda
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-forest/60">Cargando productos...</p>
            </div>
          ) : (
            <>
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-forest text-cream shadow'
                      : 'bg-white hover:bg-forest/5 text-forest border border-forest/10'
                  }`}
                >
                  Todos los Productos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-forest text-cream shadow'
                        : 'bg-white hover:bg-forest/5 text-forest border border-forest/10'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-forest/5 p-8">
                  <p className="text-base font-bold text-forest/70 mb-1">No encontramos productos en esta categoría</p>
                  <p className="text-xs text-forest/50">Por favor, selecciona otra categoría o vuelve más tarde.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => {
                    const catSlug = getCategorySlug(product.category_id);
                    return (
                      <div 
                        key={product.id}
                        className="bg-white rounded-2xl border border-forest/5 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex flex-col overflow-hidden group"
                      >
                        {/* Product Illustration / Image */}
                        <div>
                          {getProductIllustration(catSlug)}
                        </div>

                        {/* Product Body */}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-logo-pink">
                              {categories.find(c => c.id === product.category_id)?.name}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-forest/50 font-medium">
                              <Clock className="w-3 h-3 text-logo-yellow" />
                              {product.estimated_minutes} min aprox.
                            </span>
                          </div>

                          <h3 className="font-bold text-lg text-forest mb-2 group-hover:text-logo-pink transition-colors">
                            {product.title}
                          </h3>

                          <p className="text-xs text-forest/60 leading-relaxed mb-6 flex-1">
                            {product.description}
                          </p>

                          <div className="flex items-center gap-2 mt-auto border-t border-forest/5 pt-4">
                            <Link
                              href={`/quote?product=${catSlug}`}
                              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-forest hover:bg-forest/95 text-cream font-bold text-xs shadow transition-all hover:scale-102"
                            >
                              <Calculator className="w-3.5 h-3.5 text-logo-yellow" />
                              Cotizar e Iniciar Pedido
                            </Link>
                            
                            {product.is_digital && (
                              <Link
                                href="/demos/invitation"
                                className="px-3 py-3 rounded-xl border border-forest/10 hover:bg-forest/5 text-forest transition-all"
                                title="Ver Demo Interactiva"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-logo-pink" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Catalog Footer Info */}
          <div className="mt-16 p-8 bg-logo-yellow/10 rounded-3xl border border-logo-yellow/20 flex flex-col md:flex-row items-center gap-6">
            <span className="text-4xl">💡</span>
            <div className="flex-1">
              <h4 className="font-bold text-forest text-base mb-1">¿Tienes una idea personalizada que no ves aquí?</h4>
              <p className="text-xs text-forest/70">
                Podemos diseñar prácticamente cualquier sticker, bolsa de canvas, invitación interactiva o llavero de resina con tus ideas. ¡Cotízalo en nuestro formulario especial o escríbenos directamente!
              </p>
            </div>
            <Link
              href="/quote"
              className="bg-forest hover:bg-forest/90 text-cream px-6 py-3 rounded-xl text-xs font-bold shadow shrink-0"
            >
              Cotización Personalizada
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
