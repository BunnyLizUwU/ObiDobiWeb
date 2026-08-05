'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Gift, Phone, Clock, ChevronLeft, ArrowLeft, Heart, Sparkles } from 'lucide-react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function InvitationDemo() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [guestName, setGuestName] = useState('');
  const [numGuests, setNumGuests] = useState('1');
  const [isAttending, setIsAttending] = useState('yes');
  const [message, setMessage] = useState('');

  // Configurar fecha del evento: 14 de Noviembre de 2026
  const eventDate = new Date('2026-11-14T17:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = eventDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRSVPWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('Por favor, ingresa tu nombre.');
      return;
    }

    const attendanceText = isAttending === 'yes' ? '¡Sí, confirmo mi asistencia! 🎉' : 'Lamentablemente no podré asistir. 😔';
    const messagePart = message.trim() ? `\nMensaje para los novios: "${message}"` : '';
    const text = `Hola Ana y Luis, soy ${guestName}. ${attendanceText}\nBoletos confirmados: ${numGuests} persona(s).${messagePart}`;
    
    // Abrir WhatsApp de Obi Dobi (en demo, teléfono ficticio o el de Debanhi)
    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?phone=5217891117199&text=${encodedText}`, '_blank');
  };

  return (
    <>
      {/* Banner de Previsualización */}
      <div className="bg-logo-pink text-white text-center py-2 px-4 text-xs md:text-sm font-bold flex items-center justify-center gap-2 relative z-50">
        <Sparkles className="w-4 h-4 animate-spin text-logo-yellow" />
        <span>VISTA PREVIA: Demo de Invitación Digital Interactiva de Obi Dobi</span>
        <Link 
          href="/quote?product=invitaciones-digitales" 
          className="underline hover:text-logo-yellow ml-2 transition-colors font-extrabold"
        >
          ¡Cotizar la mía! ➡️
        </Link>
      </div>

      <Header />
      
      {/* Contenedor Principal con fondo floral romántico */}
      <main className="flex-1 bg-[#F9F3EE] py-12 px-4 md:px-6 relative overflow-hidden font-sans">
        
        {/* Adornos Florales CSS */}
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-logo-pink/5 blur-xl -z-10" />
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-logo-orange/5 blur-xl -z-10" />

        <div className="max-w-xl mx-auto bg-white rounded-[2.5rem] border border-forest/5 shadow-xl overflow-hidden relative">
          
          {/* Header de la invitación */}
          <div className="p-8 text-center bg-gradient-to-b from-[#FFF5EE] to-white relative">
            <span className="text-4xl block mb-2 animate-bounce">🤵👰</span>
            <span className="text-xs uppercase tracking-[0.25em] text-forest/50 font-bold block mb-1">Nuestra Boda</span>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-logo-pink to-logo-orange my-4">
              Ana & Luis
            </h1>
            <p className="text-sm font-medium text-forest/75 italic">
              "Hay momentos en la vida que son especiales por sí solos, pero compartirlos con las personas que amamos los hace inolvidables."
            </p>
            <div className="w-12 h-0.5 bg-logo-pink/20 mx-auto my-6" />
          </div>

          {/* CUENTA REGRESIVA */}
          <div className="px-6 pb-8 text-center">
            <h2 className="text-xs uppercase tracking-widest text-forest/50 font-bold mb-4 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-logo-pink" />
              Faltan para el gran día
            </h2>
            
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              <div className="bg-[#FAF3EE] rounded-2xl p-3 flex flex-col items-center">
                <span className="text-2xl font-extrabold text-forest">{timeLeft.days}</span>
                <span className="text-[10px] text-forest/50 font-bold">Días</span>
              </div>
              <div className="bg-[#FAF3EE] rounded-2xl p-3 flex flex-col items-center">
                <span className="text-2xl font-extrabold text-forest">{timeLeft.hours}</span>
                <span className="text-[10px] text-forest/50 font-bold">Horas</span>
              </div>
              <div className="bg-[#FAF3EE] rounded-2xl p-3 flex flex-col items-center">
                <span className="text-2xl font-extrabold text-forest">{timeLeft.minutes}</span>
                <span className="text-[10px] text-forest/50 font-bold">Mins</span>
              </div>
              <div className="bg-[#FAF3EE] rounded-2xl p-3 flex flex-col items-center">
                <span className="text-2xl font-extrabold text-forest">{timeLeft.seconds}</span>
                <span className="text-[10px] text-forest/50 font-bold">Segs</span>
              </div>
            </div>
          </div>

          {/* DETALLES DE HORA Y FECHA */}
          <div className="px-6 py-8 bg-[#FFF9F6] border-y border-forest/5 text-center">
            <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
              <div className="w-12 h-12 rounded-full bg-logo-pink/10 flex items-center justify-center text-logo-pink">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-forest text-base">¿Cuándo?</h3>
                <p className="text-sm font-semibold text-forest/70">Sábado 14 de Noviembre de 2026</p>
                <p className="text-xs text-forest/50">Recepción: 17:00 hrs</p>
              </div>
            </div>
          </div>

          {/* UBICACIONES Y GPS */}
          <div className="p-8 text-center flex flex-col gap-8">
            <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-forest text-base">Ceremonia Religiosa</h3>
                <p className="text-sm font-semibold text-forest/70">Parroquia de Santa María de Gracia</p>
                <p className="text-xs text-forest/50 mb-4">Calle Principal #12, Centro, Acámbaro, Gto.</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-blue hover:bg-primary-blue/90 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Ver mapa GPS
                </a>
              </div>
            </div>

            <div className="w-8 h-px bg-forest/5 mx-auto" />

            {/* MESA DE REGALOS */}
            <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-full bg-logo-orange/10 flex items-center justify-center text-logo-orange">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-forest text-base">Mesa de Regalos</h3>
                <p className="text-xs text-forest/60 mb-4">
                  Tu presencia es nuestro mejor regalo, pero si deseas tener un detalle con nosotros, puedes elegir algo de nuestra lista.
                </p>
                <div className="flex justify-center gap-3">
                  <a
                    href="https://amazon.com"
                    target="_blank"
                    className="px-4 py-2 border border-forest/10 hover:bg-forest/5 text-forest font-bold text-xs rounded-xl transition-all"
                  >
                    Amazon
                  </a>
                  <a
                    href="https://liverpool.com.mx"
                    target="_blank"
                    className="px-4 py-2 border border-forest/10 hover:bg-forest/5 text-forest font-bold text-xs rounded-xl transition-all"
                  >
                    Liverpool (Folio: 12345)
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* CONFIRMACIÓN DE ASISTENCIA (RSVP) */}
          <div className="p-8 bg-[#FFFDF9] border-t border-forest/5">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-logo-green/10 flex items-center justify-center text-logo-green mx-auto mb-3">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-forest text-base">Confirmar Asistencia</h3>
              <p className="text-xs text-forest/50">Por favor, confírmanos antes del 30 de Octubre de 2026.</p>
            </div>

            <form onSubmit={handleRSVPWhatsApp} className="flex flex-col gap-4 max-w-xs mx-auto">
              <div>
                <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">Tu Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Familia Gómez Pérez"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">Boletos / Personas</label>
                  <select
                    value={numGuests}
                    onChange={(e) => setNumGuests(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
                  >
                    <option value="1">1 Persona</option>
                    <option value="2">2 Personas</option>
                    <option value="3">3 Personas</option>
                    <option value="4">4 Personas</option>
                    <option value="5">5 Personas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">¿Asistirás?</label>
                  <select
                    value={isAttending}
                    onChange={(e) => setIsAttending(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
                  >
                    <option value="yes">Sí, asistiré</option>
                    <option value="no">No podré asistir</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5">Mensaje Opcional</label>
                <textarea
                  placeholder="¡Felicidades, nos vemos pronto!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-forest/15 bg-white text-forest text-sm font-medium focus:outline-none focus:border-logo-pink h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-logo-green hover:bg-logo-green/95 text-forest font-bold py-3.5 rounded-xl shadow-md transition-all text-xs"
              >
                <Phone className="w-4 h-4 fill-forest" />
                Confirmar Asistencia por WhatsApp
              </button>
            </form>
          </div>

        </div>

        {/* Back Link */}
        <div className="max-w-xl mx-auto text-center mt-8">
          <Link
            href="/quote?product=invitaciones-digitales"
            className="inline-flex items-center gap-1 text-xs font-bold text-forest/50 hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Cotizador
          </Link>
        </div>

      </main>
      
      <Footer />
    </>
  );
}
