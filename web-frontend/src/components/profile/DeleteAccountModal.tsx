import { X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout, user } = useAuthStore();
  const router = useRouter();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!password) return;
    
    setIsDeleting(true);
    try {
      const endpoint = user?.type === 'SELLER'
        ? '/sellers/me' 
        : '/buyers/me';

      await api.delete(endpoint, {
        data: { currentPassword: password }
      });
      
      toast.success('Conta excluída com sucesso.');
      logout();
      router.replace('/login');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir conta. Tente novamente mais tarde.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Excluir Conta</h2>
              <p className="text-sm text-white/60">Esta ação é irreversível.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-white/80 leading-relaxed">
            Tem certeza que deseja excluir sua conta? Todos os seus dados, anúncios, e conversas serão apagados permanentemente e não poderão ser recuperados.
          </p>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-sm text-red-200 mb-2 font-medium">
              Para confirmar, digite sua <span className="font-bold text-red-400">senha atual</span> no campo abaixo:
            </p>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha atual"
              className="w-full bg-black/40 border border-red-500/30 rounded-lg px-4 py-2 text-red-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleDelete}
            disabled={!password || isDeleting}
            className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir Definitivamente'}
          </button>
        </div>

      </div>
    </div>
  );
}
