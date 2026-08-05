'use client';

import React from 'react';
import Image from 'next/image';

interface LogoBubblesProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LogoBubbles({ className = '', size = 'md' }: LogoBubblesProps) {
  const dimensions = {
    sm: { width: 70, height: 70 },
    md: { width: 180, height: 180 },
    lg: { width: 280, height: 280 }
  };

  const { width, height } = dimensions[size];

  return (
    <div className={`flex flex-col items-center select-none justify-center ${className}`}>
      <div className="relative group transition-transform duration-500 ease-out hover:scale-105 active:scale-95">
        {/* Soft magical pastel glow behind the logo */}
        <div className="absolute inset-2 bg-gradient-to-tr from-logo-pink/20 via-logo-yellow/15 to-logo-cyan/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <Image
          src="/logo.png"
          alt="Obi Dobi Creative Studio Logo"
          width={width}
          height={height}
          className="relative z-10 transition-transform duration-300 group-hover:rotate-2"
          priority
        />
      </div>
    </div>
  );
}
