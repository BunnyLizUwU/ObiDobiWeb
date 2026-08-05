import React from 'react';
import { Heart } from 'lucide-react';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-forest text-cream py-12 px-6 border-t border-forest/20 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About */}
        <div className="flex flex-col gap-3 text-center md:text-left">
          <h3 className="text-xl font-bold font-sans tracking-wide">Obi Dobi</h3>
          <p className="text-sm text-cream/70 max-w-xs mx-auto md:mx-0">
            Papelería creativa local en Acámbaro, Guanajuato. Diseñamos recuerdos únicos y hermosas experiencias para tus eventos especiales.
          </p>
        </div>

        {/* Location & Contact */}
        <div className="flex flex-col gap-3 text-center">
          <h3 className="text-xl font-bold font-sans tracking-wide">Contacto</h3>
          <p className="text-sm text-cream/70">
            📍 Acámbaro, Guanajuato, México
          </p>
          <p className="text-sm text-cream/70">
            💬 WhatsApp: +52 1 789 111 7199
          </p>
        </div>

        {/* Social Networks */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <h3 className="text-xl font-bold font-sans tracking-wide">Redes Sociales</h3>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/obidobi_obi/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-cream/10 hover:bg-cream/20 text-cream transition-all duration-300 transform hover:scale-110"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
          </div>
          <p className="text-xs text-cream/50 mt-2">
            Síguenos para ver nuestros últimos trabajos y bocetos.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-cream/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/40">
        <p>© 2026 Obi Dobi. Todos los derechos reservados.</p>
        <p className="flex items-center gap-1">
          Hecho con <Heart className="w-3.5 h-3.5 text-logo-red fill-logo-red" /> para Debanhi.
        </p>
      </div>
    </footer>
  );
}
