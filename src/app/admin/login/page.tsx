'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import LogoBubbles from '../../../components/LogoBubbles';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!isSupabaseConfigured);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Error de autenticación');
        setLoading(false);
      } else {
        router.push('/admin');
      }
    } else {
      // Mock Auth Fallback para demostración local
      setTimeout(() => {
        if (
          (email === 'admin@obidobi.com' || email === 'debanhi@obidobi.com' || email === 'admin') &&
          (password === 'admin123' || password === 'debanhi' || password === '')
        ) {
          sessionStorage.setItem('obidobi_admin_logged', 'true');
          router.push('/admin');
        } else {
          setErrorMsg('Credenciales inválidas. En modo offline usa: debanhi@obidobi.com y clave: debanhi');
        }
        setLoading(false);
      }, 800);
    }
  };

  return (
    <div className="flex-1 bg-cream flex items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-forest/5 p-8 shadow-xl flex flex-col gap-6 relative overflow-hidden">
        
        {/* Decoraciones */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-logo-pink/5 rounded-full blur-xl" />
        
        <div className="text-center flex flex-col items-center gap-4">
          <LogoBubbles size="sm" className="scale-95" />
          <div>
            <h1 className="text-xl font-bold text-forest mt-2">Panel de Administración</h1>
            <p className="text-xs text-forest/50">Área exclusiva para Debanhi</p>
          </div>
        </div>

        {isOffline && (
          <div className="bg-logo-yellow/10 border border-logo-yellow/30 rounded-2xl p-4 flex gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-logo-orange shrink-0 mt-0.5" />
            <div className="text-xs text-forest/75 leading-relaxed">
              <span className="font-bold block text-logo-orange">Modo Demostración Activado</span>
              No hay credenciales reales de Supabase. Ingresa con:
              <br />
              <span className="font-mono bg-white/70 px-1 py-0.5 rounded">debanhi@obidobi.com</span> y clave <span className="font-mono bg-white/70 px-1 py-0.5 rounded">debanhi</span>.
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-logo-red/10 border border-logo-red/20 text-logo-red rounded-xl p-3.5 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-primary-blue" />
              Correo Electrónico
            </label>
            <input
              type="text"
              required
              placeholder="debanhi@obidobi.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest/60 uppercase mb-1.5 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-logo-pink" />
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-forest/15 bg-white text-forest text-sm font-semibold focus:outline-none focus:border-logo-pink"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-forest text-cream font-bold py-3.5 rounded-xl shadow hover:bg-forest/95 transition-all text-sm cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-4 h-4 text-logo-yellow" />
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>

      </div>
    </div>
  );
}
