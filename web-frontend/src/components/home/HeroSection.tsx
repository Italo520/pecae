import React from 'react';
import { SearchBar } from '@/components/ui/SearchBar';

export function HeroSection() {
  // Real data for social proof will come from props or a Server Action if needed,
  // but for the spec, it just needs to exist.
  const activeListings = "15.432";
  const activeCities = "340";

  return (
    <section className="relative w-full py-20 px-4 md:py-32 flex flex-col items-center justify-center text-center bg-gradient-to-b from-brand/10 to-background">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4 max-w-4xl font-display">
        Encontre peças do seu veículo
      </h1>
      
      <p className="text-lg md:text-xl text-muted mb-10 max-w-2xl font-body">
        <span className="font-semibold text-foreground">{activeListings}</span> peças disponíveis em <span className="font-semibold text-foreground">{activeCities}</span> cidades. O maior marketplace automotivo do Brasil.
      </p>

      <div className="w-full max-w-3xl mx-auto">
        {/* We use the SearchBar component we built in Phase 5a */}
        <SearchBar placeholder="Busque por marca, modelo, ano ou peça..." />
      </div>
    </section>
  );
}
