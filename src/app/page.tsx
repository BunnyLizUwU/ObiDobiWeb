import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Calculator, BookOpen, Clock, Heart, Award } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LogoBubbles from '../components/LogoBubbles';

export default function Home() {
  const categories = [
    {
      title: 'Invitaciones Digitales',
      description: 'Invitaciones móviles e interactivas con cuenta regresiva, confirmación por WhatsApp y mapa GPS.',
      slug: 'invitaciones-digitales',
      bgColor: 'bg-primary-blue/10 hover:bg-primary-blue/15',
      accentColor: 'bg-primary-blue text-white',
      badge: 'Demo en vivo',
      demoLink: '/demos/invitation',
      illustration: (
        <div className="w-full h-40 bg-gradient-to-tr from-primary-blue/30 to-logo-cyan/30 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
          <div className="w-24 h-36 bg-white rounded-xl shadow-md border-2 border-forest/10 p-2 flex flex-col justify-between relative transform rotate-6 hover:rotate-0 transition-transform duration-300">
            <div className="w-full h-1 bg-logo-pink rounded-full" />
            <div className="flex flex-col items-center justify-center flex-1 my-2">
              <span className="text-[10px] uppercase tracking-widest text-forest/40">Boda</span>
              <span className="text-sm font-bold text-forest text-center leading-none mt-1">Ana & Luis</span>
              <div className="w-6 h-6 rounded-full bg-logo-yellow/50 mt-2 flex items-center justify-center animate-bounce">
                ❤️
              </div>
            </div>
            <div className="w-full py-0.5 bg-forest text-[8px] text-center text-cream rounded font-bold">
              CONFIRMAR
            </div>
          </div>
          {/* Sparkles */}
          <Sparkles className="absolute top-4 right-4 w-4 h-4 text-logo-yellow animate-spin" />
        </div>
      )
    },
    {
      title: 'Totebags Personalizadas',
      description: 'Bolsas de tela canvas súper resistentes, sublimadas con colores vibrantes y diseños a tu gusto.',
      slug: 'tote-bags',
      bgColor: 'bg-logo-orange/10 hover:bg-logo-orange/15',
      accentColor: 'bg-logo-orange text-white',
      illustration: (
        <div className="w-full h-40 bg-gradient-to-tr from-logo-orange/20 to-logo-yellow/20 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
          <div className="w-24 h-28 bg-cream border-2 border-forest/20 rounded-b-lg relative shadow-md flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            {/* Bag Handles */}
            <div className="absolute -top-4 w-12 h-8 border-2 border-forest/20 rounded-t-full" />
            {/* Design on the bag */}
            <div className="flex flex-col items-center text-center">
              <span className="text-xl">🌸</span>
              <span className="text-[8px] font-bold tracking-widest text-forest/60 uppercase">Obi Dobi</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Stickers Custom',
      description: 'Pegatinas troqueladas con formas personalizadas en acabado brillante, mate o efectos holográficos.',
      slug: 'stickers',
      bgColor: 'bg-logo-pink/10 hover:bg-logo-pink/15',
      accentColor: 'bg-logo-pink text-white',
      illustration: (
        <div className="w-full h-40 bg-gradient-to-tr from-logo-pink/20 to-logo-red/20 rounded-2xl flex items-center justify-center p-4 gap-2 relative overflow-hidden">
          {/* Sticker 1 */}
          <div className="w-14 h-14 bg-white border-2 border-dashed border-logo-pink rounded-full flex items-center justify-center font-bold text-forest shadow-md transform -rotate-12 hover:rotate-0 transition-transform duration-300 text-xs">
            Cute! 💖
          </div>
          {/* Sticker 2 */}
          <div className="w-14 h-14 bg-logo-yellow border-2 border-white rounded-xl flex items-center justify-center font-bold text-forest shadow-md transform rotate-12 hover:rotate-0 transition-transform duration-300 text-sm">
            ✨ Smile
          </div>
        </div>
      )
    },
    {
      title: 'Llaveros de Resina',
      description: 'Hermosos llaveros de iniciales y figuras encapsuladas con resina epóxica, flores secas y glitter.',
      slug: 'llaveros-resina',
      bgColor: 'bg-logo-green/10 hover:bg-logo-green/15',
      accentColor: 'bg-logo-green text-forest',
      illustration: (
        <div className="w-full h-40 bg-gradient-to-tr from-logo-green/20 to-logo-cyan/20 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
          {/* Resin Keychain Representation */}
          <div className="w-14 h-20 bg-white/40 backdrop-blur-md border-2 border-white/60 rounded-xl relative shadow-lg flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            {/* Key ring */}
            <div className="absolute -top-3 w-4 h-4 rounded-full border-2 border-zinc-400 bg-zinc-200" />
            <div className="absolute -top-1 w-2 h-4 bg-zinc-300" />
            {/* Resin Letter */}
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-logo-pink to-logo-orange animate-pulse">
              D
            </span>
            {/* Glitter inside */}
            <span className="absolute bottom-2 right-2 text-xs">✨</span>
            <span className="absolute top-2 left-2 text-[8px]">🌸</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream">
        
        {/* HERO SECTION */}
        <section className="relative py-16 md:py-24 px-6 overflow-hidden">
          {/* Floating Colorful Backdrop Blobs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-logo-pink/10 rounded-full filter blur-3xl -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-10 right-10 w-80 h-80 bg-logo-cyan/10 rounded-full filter blur-3xl -z-10 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute bottom-5 left-1/3 w-64 h-64 bg-logo-yellow/10 rounded-full filter blur-3xl -z-10 animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          <div className="absolute bottom-12 right-20 w-72 h-72 bg-logo-orange/5 rounded-full filter blur-3xl -z-10 animate-pulse" style={{ animationDuration: '12s', animationDelay: '3s' }} />

          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8 relative z-10">
            {/* Decoración flotante */}
            <span className="absolute -top-10 -left-10 text-4xl animate-float">☁️</span>
            <span className="absolute top-20 -right-10 text-4xl animate-float" style={{ animationDelay: '1s' }}>⭐️</span>
            <span className="absolute bottom-10 left-0 text-3xl animate-float" style={{ animationDelay: '1.5s' }}>🎨</span>
            <span className="absolute -bottom-6 right-10 text-4xl animate-float" style={{ animationDelay: '2.5s' }}>🎈</span>
            <span className="absolute top-40 left-[-40px] text-2xl animate-float" style={{ animationDelay: '2.2s' }}>💖</span>
            <span className="absolute top-2 right-1/4 text-2xl animate-float" style={{ animationDelay: '0.5s' }}>✨</span>

            <LogoBubbles size="lg" className="mb-4 animate-fadeIn" />

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-forest max-w-2xl leading-tight">
              Papelería creativa que hace brillar tus momentos especiales
            </h1>
            
            <p className="text-base md:text-lg text-forest/70 max-w-xl font-medium">
              Diseño personalizado local en Acámbaro, Guanajuato. Cotiza al instante tus invitaciones interactivas, totebags, stickers y llaveros hechos a mano con amor.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href="/quote"
                className="flex items-center justify-center gap-2 bg-forest text-cream font-bold px-8 py-4 rounded-2xl shadow-lg hover:bg-forest/90 hover:scale-105 transition-all duration-300"
              >
                <Calculator className="w-5 h-5 text-logo-yellow" />
                Cotizador Inteligente
              </Link>
              <Link
                href="/catalog"
                className="flex items-center justify-center gap-2 bg-white text-forest border-2 border-forest font-bold px-8 py-4 rounded-2xl hover:bg-forest/5 hover:scale-105 transition-all duration-300"
              >
                <BookOpen className="w-5 h-5 text-logo-pink" />
                Ver Catálogo
              </Link>
            </div>
          </div>
          
          {/* Fondo estético con ondas y gradiente de dulces */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 via-logo-pink/5 to-logo-yellow/5 -z-10" />
        </section>

        {/* CATEGORIES SECTION */}
        <section className="py-16 px-6 bg-white/50 border-y border-forest/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-extrabold text-forest mb-3">
                ¿Qué creamos en Obi Dobi?
              </h2>
              <p className="text-sm md:text-base text-forest/60 max-w-md mx-auto">
                Explora nuestras principales líneas de productos. Todo se diseña y fabrica bajo pedido adaptándonos a tu temática.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.title}
                  className={`flex flex-col p-6 rounded-3xl border border-forest/5 transition-all duration-300 ${cat.bgColor} group`}
                >
                  <div className="mb-4">
                    {cat.illustration}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-forest">{cat.title}</h3>
                    {cat.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-logo-pink text-white animate-pulse">
                        {cat.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-forest/70 leading-relaxed mb-6 flex-1">
                    {cat.description}
                  </p>

                  <div className="flex flex-col gap-2 mt-auto">
                    <Link
                      href={`/quote?product=${cat.slug}`}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${cat.accentColor}`}
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      Cotizar ahora
                    </Link>
                    
                    {cat.demoLink && (
                      <Link
                        href={cat.demoLink}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-forest border border-forest/10 hover:bg-white transition-all"
                      >
                        Probar Demo
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-4xl font-extrabold text-forest mb-3">
                ¿Cómo funciona el Cotizador Inteligente?
              </h2>
              <p className="text-sm md:text-base text-forest/60 max-w-md mx-auto">
                Diseñamos una herramienta ágil para estimar costos de forma transparente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Conector visual en desktop */}
              <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-dashed border-t-2 border-forest/10 -z-10" />

              {/* Paso 1 */}
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-forest/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary-blue text-white flex items-center justify-center text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="font-bold text-forest mb-2">Personaliza</h3>
                <p className="text-xs text-forest/60 leading-relaxed">
                  Entra a la calculadora, elige tu producto, materiales, revisiones necesarias y método de envío.
                </p>
              </div>

              {/* Paso 2 */}
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-forest/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-logo-yellow text-forest flex items-center justify-center text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="font-bold text-forest mb-2">Cotización Inmediata</h3>
                <p className="text-xs text-forest/60 leading-relaxed">
                  Obtén el desglose detallado al instante: costo total, 50% de anticipo para iniciar y saldo contra entrega.
                </p>
              </div>

              {/* Paso 3 */}
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-forest/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-logo-pink text-white flex items-center justify-center text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="font-bold text-forest mb-2">Pide por WhatsApp</h3>
                <p className="text-xs text-forest/60 leading-relaxed">
                  Registra tus datos y genera un mensaje estructurado directo para WhatsApp. Debanhi recibirá tu folio para arrancar bocetos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-16 px-6 bg-forest text-cream relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-logo-yellow/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-logo-pink/5 rounded-full blur-3xl" />
          
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6 relative z-10">
            <Award className="w-12 h-12 text-logo-yellow animate-bounce" />
            <h2 className="text-2xl md:text-4xl font-extrabold">
              ¿Listo para dar vida a tus ideas?
            </h2>
            <p className="text-sm md:text-base text-cream/70 max-w-lg leading-relaxed">
              Prueba nuestro sistema interactivo de estimación o revisa el catálogo. Si tienes dudas, puedes consultarnos directamente.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <Link
                href="/quote"
                className="bg-logo-pink hover:bg-logo-pink/95 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                Probar Cotizador
              </Link>
              <Link
                href="https://www.instagram.com/obidobi_obi/"
                target="_blank"
                className="bg-white/10 hover:bg-white/20 text-cream font-bold px-8 py-3.5 rounded-xl border border-cream/20 transition-all duration-300 transform hover:scale-105"
              >
                Instagram Oficial
              </Link>
            </div>
          </div>
        </section>
        
      </main>
      <Footer />
    </>
  );
}
