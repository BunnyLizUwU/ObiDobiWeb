'use client';

import { useEffect, useState } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <div
      className={`transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        mounted 
          ? 'opacity-100 translate-y-0 scale-100 filter blur-0' 
          : 'opacity-0 translate-y-3 scale-[0.995] filter blur-[1px]'
      }`}
    >
      {children}
    </div>
  );
}
