'use client';

export function ReportButton() {
  const handleReport = () => {
    alert('Funcionalidade de denúncia abrirá um modal em breve.');
  };

  return (
    <div className="mt-12 pt-6 border-t border-gray-200 text-center">
      <button 
        onClick={handleReport}
        className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 mx-auto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
        Denunciar este anúncio
      </button>
    </div>
  );
}
