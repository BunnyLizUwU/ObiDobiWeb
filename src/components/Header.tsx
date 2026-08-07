'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Lock, Sparkles, Calculator, BookOpen } from 'lucide-react';
import LogoBubbles from './LogoBubbles';
import { supabase } from '../lib/supabase';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      const localLogged = sessionStorage.getItem('obidobi_admin_logged') === 'true';
      if (user || localLogged) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const links = [
    { href: '/', label: 'Inicio', icon: Sparkles, hoverClass: 'hover:bg-primary-blue/15 hover:text-primary-blue', activeClass: 'bg-primary-blue text-white shadow-sm' },
    { href: '/catalog', label: 'Catálogo', icon: BookOpen, hoverClass: 'hover:bg-logo-pink/15 hover:text-logo-pink', activeClass: 'bg-logo-pink text-white shadow-sm' },
    { href: '/demos/invitation', label: 'Demo Invitación', icon: Sparkles, hoverClass: 'hover:bg-logo-yellow/25 hover:text-logo-orange', activeClass: 'bg-logo-yellow text-forest shadow-sm' },
    { href: '/quote', label: 'Cotizar', icon: Calculator, hoverClass: 'hover:bg-logo-green/15 hover:text-logo-green', activeClass: 'bg-logo-green text-forest shadow-sm' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-forest/10 px-4 md:px-8 py-3">
      {/* Top Colorful Gradient Strip */}
      <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary-blue via-logo-yellow via-logo-red via-logo-pink via-logo-green via-logo-orange to-logo-cyan z-50" />

      <div className="max-w-6xl mx-auto flex items-center justify-between mt-[2px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <LogoBubbles size="sm" className="scale-90 origin-left" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? `${link.activeClass} scale-105`
                    : `text-forest/80 ${link.hoverClass} hover:scale-102`
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/admin"
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-sm border-2 ${
              isLoggedIn
                ? 'border-logo-green bg-logo-green/10 text-forest hover:bg-logo-green/20'
                : 'border-logo-pink hover:bg-logo-pink hover:text-cream text-forest'
            }`}
          >
            {isLoggedIn ? (
              <>
                <span className="w-2 h-2 rounded-full bg-logo-green animate-pulse" />
                Panel Admin (Activo)
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Panel Admin
              </>
            )}
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            href="/admin"
            className={`p-2 rounded-xl transition-all ${
              isLoggedIn ? 'text-logo-green bg-logo-green/10' : 'text-forest hover:bg-forest/5'
            }`}
            aria-label="Panel Administrador"
          >
            {isLoggedIn ? (
              <div className="relative">
                <Lock className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-logo-green border border-white" />
              </div>
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl text-forest hover:bg-forest/5 transition-colors"
            aria-label="Menú principal"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-cream border-b border-forest/10 p-4 shadow-lg animate-fadeIn">
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                    active
                      ? link.activeClass
                      : `text-forest/80 ${link.hoverClass}`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
