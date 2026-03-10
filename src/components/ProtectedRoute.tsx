import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { motion } from 'motion/react';
import { Lock, Zap } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePro?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requirePro = false }) => {
  const { user, profile, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-nature-100 rounded-[32px] flex items-center justify-center text-nature-900">
          <Lock size={40} />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-3xl font-serif font-bold">Authentication Required</h2>
          <p className="text-nature-500">You need to be signed in to access this feature and start your journey as a Nature Guardian.</p>
        </div>
        <button 
          onClick={() => setIsAuthModalOpen(true)}
          className="px-8 py-4 bg-nature-900 text-white rounded-2xl font-bold hover:bg-nature-800 transition-all shadow-xl shadow-nature-900/20"
        >
          Sign In to Unlock
        </button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  if (requirePro && profile?.role !== 'pro' && profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 rounded-[32px] flex items-center justify-center text-amber-600">
          <Zap size={40} />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-3xl font-serif font-bold">Nature Pro Feature</h2>
          <p className="text-nature-500">This advanced ecosystem intelligence is reserved for our Nature Pro members. Upgrade to unlock deeper insights.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20">
            Upgrade to Pro ($2/mo)
          </button>
          <button className="px-8 py-4 bg-nature-100 text-nature-900 rounded-2xl font-bold hover:bg-nature-200 transition-all">
            Learn More
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
