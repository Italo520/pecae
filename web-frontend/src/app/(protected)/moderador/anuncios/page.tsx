import { ModerationListingsTable } from '@/components/moderador/ModerationListingsTable';

export const metadata = {
  title: 'Fila de Anúncios | PECAÊ Moderador',
  description: 'Aprovação e rejeição de anúncios',
};

export default function ModeradorAnunciosPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Fila de Anúncios</h1>
          <p className="text-white/60 mt-2">
            Avalie anúncios pendentes. Aprovação libera para publicação, rejeição notifica o vendedor.
          </p>
        </header>

        <section>
          <ModerationListingsTable />
        </section>

      </div>
    </div>
  );
}
