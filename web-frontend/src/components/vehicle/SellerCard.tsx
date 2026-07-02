import { SellerPublic } from '@/types/listing.types';

interface SellerCardProps {
  seller: SellerPublic;
}

export function SellerCard({ seller }: SellerCardProps) {
  return (
    <div className="bg-surface border border-border rounded-3xl p-6 mb-6 backdrop-blur-md">
      <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Informações do Vendedor</h3>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-brand/20 text-brand rounded-full flex items-center justify-center font-bold font-display text-xl flex-shrink-0">
          {seller.name.charAt(0).toUpperCase()}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-foreground font-display text-lg">{seller.name}</h4>
            {seller.verified && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.441A1.5 1.5 0 017.5 2.5h5a1.5 1.5 0 011.233.941l1.52 3.65a1.5 1.5 0 01-.132 1.567l-3.236 4.045a1.5 1.5 0 01-2.348 0l-3.236-4.045a1.5 1.5 0 01-.132-1.567l1.52-3.65z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          <div className="flex flex-col gap-1 mt-2 text-sm text-muted">
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span>{seller.city}, {seller.state}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span>No PECAÊ desde {seller.memberSince.split('-')[0]}</span>
            </div>
            
            {seller.rating && (
              <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-warning">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-foreground">{seller.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
